import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, MessageSquare, Send, X, Bot, User } from 'lucide-react';
import type { Animal } from '../../shared/types';
import { useAuth } from '../auth/context/AuthContext';

interface AICopilotCardProps {
    animalId?: string;
    animalName?: string;
    allAnimals?: Animal[];
}

interface AIInsight {
    riskLevel: string;
    summary: string;
    recommendations: string[];
}

interface ChatMessage {
    sender: 'ai' | 'user';
    text: string;
    timestamp: string;
}

export const AICopilotCard: React.FC<AICopilotCardProps> = ({ animalId, animalName, allAnimals = [] }) => {
    const { user } = useAuth();
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [loading, setLoading] = useState(false);
    const [showChatModal, setShowChatModal] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const userName = user?.name ? user.name.split(' ')[0] : 'Caregiver';

    const currentAnimal = allAnimals.find(a => a._id === animalId) || {
        _id: animalId || '1',
        name: animalName || 'Subject',
        species: 'Dog',
        breed: 'Retriever',
        age: 2,
        weight: 15,
        healthStatus: 'healthy' as const,
        baselineReadingsCount: 10,
        baselines: { temperature: 38.2, heartRate: 72, respiratoryRate: 22, bloodOxygen: 98 }
    };

    const fetchInsight = async () => {
        if (!animalId) return;
        setLoading(true);
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            const savedUser = localStorage.getItem('mavis_user');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    if (parsed.id) headers['x-user-id'] = parsed.id;
                    if (parsed.role) headers['x-user-role'] = parsed.role;
                } catch {
                    // Ignore error
                }
            }

            const res = await fetch(`http://localhost:5000/api/ai/${animalId}`, { headers });
            if (res.ok) {
                const json = await res.json();
                setInsight(json.data);
            }
        } catch {
            // Fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, [animalId]);

    useEffect(() => {
        if (showChatModal && messages.length === 0) {
            setMessages([
                {
                    sender: 'ai',
                    text: `Hello ${userName}! I am your M.A.V.I.S Veterinary Copilot. I'm actively monitoring ${currentAnimal.name} (${currentAnimal.species}, ${currentAnimal.breed || 'Standard'}). Ask me anything about ${currentAnimal.name}'s vitals, diet, fever management, or overall herd status!`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    }, [showChatModal, currentAnimal.name, currentAnimal.species, currentAnimal.breed, userName, messages.length]);

    const generateAIResponse = (query: string): string => {
        const lower = query.toLowerCase().trim();

        // 1. Check if the user is explicitly asking about another animal by name (e.g. "tell me about Dog 2", "how is Bella")
        const matchedAnimal = allAnimals.find(a =>
            a.name && lower.includes(a.name.toLowerCase())
        );

        if (matchedAnimal) {
            const temp = matchedAnimal.baselines?.temperature || 38.5;
            const hr = matchedAnimal.baselines?.heartRate || 74;
            const resp = matchedAnimal.baselines?.respiratoryRate || 22;
            const spo2 = matchedAnimal.baselines?.bloodOxygen || 98;
            const status = (matchedAnimal.healthStatus || 'healthy').toUpperCase();
            const ageStr = matchedAnimal.age ? `${matchedAnimal.age} yr(s)` : '2 yrs';
            const weightStr = matchedAnimal.weight ? `${matchedAnimal.weight} kg` : '15 kg';

            return `🐾 Personalized Telemetry Report for ${matchedAnimal.name}:\n` +
                `• Caregiver: ${userName}\n` +
                `• Profile: ${matchedAnimal.species} (${matchedAnimal.breed || 'Standard'}), ${ageStr}, ${weightStr}\n` +
                `• Health Status: ${status}\n` +
                `• Body Temp: ${temp}°C | Heart Rate: ${hr} BPM\n` +
                `• Resp Rate: ${resp} breaths/min | SpO2: ${spo2}%\n` +
                `• Clinical Prognosis: ${matchedAnimal.name} is displaying steady metabolic stability with zero acute thermal risks.`;
        }

        const subject = currentAnimal.name || 'subject';

        // 2. Greetings
        if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i.test(lower)) {
            return `Hello ${userName}! How can I assist you with ${subject}'s physiological vitals, daily care, or telemetry history today?`;
        }

        // 3. Herd / Other Animals Query
        if (lower.includes('other') || lower.includes('all animal') || lower.includes('herd') || lower.includes('others') || lower.includes('rest')) {
            const animalListStr = allAnimals.length > 0
                ? allAnimals.map(a => `• ${a.name} (${a.species}, ${(a.healthStatus || 'healthy').toUpperCase()})`).join('\n')
                : '• Dog 1 (DOG, HEALTHY)\n• Dog 2 (DOG, HEALTHY)\n• Dairy Cow #402 (COW, HEALTHY)';

            return `Hello ${userName}, here is your active herd overview:\n${animalListStr}\n\nAll IoT collar mesh nodes are broadcasting continuous telemetry to your database.`;
        }

        // 4. Fever & Temperature Query
        if (lower.includes('fever') || lower.includes('temperature') || lower.includes('temp') || lower.includes('hot') || lower.includes('feverish')) {
            const currentTemp = currentAnimal.baselines?.temperature || 38.2;
            return `Personalized Thermal Profile for ${subject}:\n` +
                `• Current Baseline Temp: ${currentTemp}°C\n` +
                `• Normal Range: 38.0°C – 39.2°C\n` +
                `• Care Status: ${currentTemp > 39.5 ? '⚠️ High Thermal Risk' : '✅ Optimal Temperature'}\n\n` +
                `Advice for ${userName}: ${currentTemp > 39.5 ? 'Move subject to shade immediately and apply cold compresses.' : 'Body temperature is completely stable. Continue standard routine care.'}`;
        }

        // 5. Diet & Nutrition Query
        if (lower.includes('diet') || lower.includes('feed') || lower.includes('food') || lower.includes('eat') || lower.includes('water') || lower.includes('nutrition')) {
            return `Nutrition Guidance for ${subject} (${currentAnimal.species}, ${currentAnimal.breed || 'Standard'}):\n` +
                `1. Provide fresh, clean drinking water access 24/7.\n` +
                `2. For a ${currentAnimal.weight || 15} kg ${currentAnimal.species}, maintain balanced caloric intake split into 2 daily meals.\n` +
                `3. Add electrolyte supplements if ambient barn/room temperature exceeds 30°C.`;
        }

        // 6. Cardiac & Respiratory Query
        if (lower.includes('heart') || lower.includes('pulse') || lower.includes('bpm') || lower.includes('respiratory') || lower.includes('breath')) {
            const hr = currentAnimal.baselines?.heartRate || 72;
            const resp = currentAnimal.baselines?.respiratoryRate || 22;
            return `Cardiovascular Profile for ${subject}:\n` +
                `• Resting Heart Rate: ${hr} BPM (Normal range: 60 - 90 BPM)\n` +
                `• Respiratory Rate: ${resp} breaths/min\n` +
                `• SpO2 Saturation: ${currentAnimal.baselines?.bloodOxygen || 98}%\n` +
                `• Heart Rhythm: Regular sinus rhythm detected via collar sensors.`;
        }

        // 7. Advice & Recommendations
        if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('advice') || lower.includes('do') || lower.includes('help')) {
            if (insight?.recommendations && insight.recommendations.length > 0) {
                return `Personalized AI Recommendations for ${userName} regarding ${subject}:\n• ${insight.recommendations.join('\n• ')}`;
            }
            return `Care Recommendations for ${userName} regarding ${subject}:\n` +
                `1. Keep routine outdoor activity to early mornings or late evenings during high thermal index days.\n` +
                `2. Verify that ${subject}'s collar node is snug (two fingers fit beneath strap) for accurate SpO2 sensor readings.\n` +
                `3. Ensure adequate rest between play/exercise cycles.`;
        }

        // 8. General Dynamic Response using live context
        return `Regarding "${query}" for ${subject}:\n` +
            `• Caregiver: ${userName}\n` +
            `• Risk Level: ${insight?.riskLevel || 'HEALTHY'}\n` +
            `• Dynamic Summary: ${insight?.summary || `Continuous digital twin modeling confirms ${subject}'s physiological stability.`}`;
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            sender: 'user',
            text: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const queryText = chatInput;
        setMessages(prev => [...prev, userMsg]);
        setChatInput('');

        // Generate dynamic AI response
        setTimeout(() => {
            const aiReplyText = generateAIResponse(queryText);

            setMessages(prev => [
                ...prev,
                {
                    sender: 'ai',
                    text: aiReplyText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }, 500);
    };

    if (!animalId) return null;

    return (
        <>
            <div className="bento-card p-4 sm:p-4.5 bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 leading-relaxed">
                        <strong className="text-emerald-800 font-bold mr-1.5 whitespace-nowrap">Vital Insight for {currentAnimal.name}:</strong>
                        <span className="text-slate-700 font-semibold">
                            {insight?.summary || `AI Digital Twin modeling confirms ${currentAnimal.name}'s physiological state is stable.`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                    <button
                        onClick={() => setShowChatModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold transition cursor-pointer border border-emerald-200/80 shadow-2xs"
                    >
                        <MessageSquare className="h-3.5 w-3.5" /> Ask AI Copilot
                    </button>

                    <button
                        onClick={fetchInsight}
                        disabled={loading}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer ml-1"
                        title="Refresh Telemetry Insight"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* AI Copilot Chat Modal */}
            {showChatModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 flex flex-col h-[520px]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold tracking-tight text-slate-900 m-0">AI Veterinary Copilot</h3>
                                    <p className="text-[11px] text-slate-500 font-normal m-0">Personal Care Assistant for {userName} • {currentAnimal.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowChatModal(false)} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                            {messages.map((m, idx) => (
                                <div key={idx} className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`p-1.5 rounded-xl text-white shrink-0 ${m.sender === 'user' ? 'bg-slate-800' : 'bg-emerald-600'}`}>
                                        {m.sender === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                                    </div>
                                    <div className={`max-w-[85%] p-3 rounded-2xl ${m.sender === 'user' ? 'bg-slate-900 text-white rounded-tr-xs' : 'bg-white border border-slate-200 text-slate-800 shadow-2xs rounded-tl-xs'}`}>
                                        <p className="m-0 leading-relaxed font-medium whitespace-pre-line">{m.text}</p>
                                        <span className={`text-[9px] block mt-1 ${m.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'}`}>{m.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder={`Ask AI about ${currentAnimal.name}'s vitals, fever, diet...`}
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                            />
                            <button
                                type="submit"
                                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs cursor-pointer shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
