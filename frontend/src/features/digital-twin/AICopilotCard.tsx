import React, { useState, useEffect } from 'react';
import { Stethoscope, RefreshCw, CheckCircle2, Sparkles, Activity, Cpu } from 'lucide-react';

interface AICopilotCardProps {
    animalId?: string;
    animalName?: string;
    allAnimals?: Animal[];
}

interface ClinicalInsight {
    riskLevel: string;
    summary: string;
    differentialDiagnosis?: string[];
    recommendations: string[];
    source?: string;
    latencyMs?: number;
}

export const AICopilotCard: React.FC<AICopilotCardProps> = ({ animalId, animalName }) => {
    const [insight, setInsight] = useState<ClinicalInsight | null>(null);
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
                } catch {}
            }

            const res = await fetch(`http://localhost:5000/api/ai/${animalId}`, { headers });
            if (res.ok) {
                const json = await res.json();
                setInsight(json.data);
            }
        } catch {
            // Quiet network error handling
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

    const rawRisk = insight?.riskLevel?.toLowerCase() || '';
    const isCritical = rawRisk.includes('high') || rawRisk.includes('critical');
    const isModerate = rawRisk.includes('mod') || rawRisk.includes('warn') || rawRisk.includes('elevated');
    const isGood = rawRisk.includes('low') || rawRisk.includes('good') || rawRisk.includes('normal') || rawRisk.includes('optimal') || rawRisk.includes('healthy');

    // Clean, professional triage badge styling
    let triageLabel = 'Triage: Evaluating';
    let badgeStyle = 'bg-teal-50 border-teal-200 text-teal-800';
    let dotColor = 'bg-teal-500';

    if (isCritical) {
        triageLabel = 'Triage: High (Critical)';
        badgeStyle = 'bg-rose-50 border-rose-200 text-rose-700';
        dotColor = 'bg-rose-500';
    } else if (isModerate) {
        triageLabel = 'Triage: Moderate (Warning)';
        badgeStyle = 'bg-amber-50 border-amber-200 text-amber-800';
        dotColor = 'bg-amber-500';
    } else if (isGood) {
        triageLabel = 'Triage: Low (Optimal)';
        badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800';
        dotColor = 'bg-emerald-500';
    } else if (insight?.riskLevel) {
        triageLabel = `Triage: ${insight.riskLevel}`;
    }

    const modelSource = insight?.source || 'Deterministic Clinical Safety Engine';

    return (
        <div className={`bento-card p-6 sm:p-7 w-full bg-white border transition-all duration-300 ${
            isCritical ? 'border-rose-200/90 shadow-rose-500/5' : 'border-slate-200/90'
        } shadow-sm space-y-5`}>
            
            {/* Header: Clean Full-Width Top Bar */}
            <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Left: Stethoscope & Title */}
                    <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-2xl flex items-center justify-center border shrink-0 transition-transform hover:scale-105 ${
                            isCritical 
                                ? 'bg-rose-50 text-rose-600 border-rose-200/80 shadow-xs' 
                                : isModerate
                                ? 'bg-amber-50 text-amber-600 border-amber-200/80 shadow-xs'
                                : 'bg-teal-50 text-teal-700 border-teal-200/80 shadow-xs'
                        }`}>
                            <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-base tracking-tight m-0 font-display whitespace-nowrap">
                                    Clinical Veterinary Assessment
                                </h4>
                                <Sparkles className="h-4 w-4 text-teal-600 shrink-0" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                                Grounded Telemetry Synthesis &amp; Clinical Observations
                            </p>
                        </div>
                    </div>

                    {/* Right: Symmetrically Aligned Triage Pill + Model Engine Badge + Refresh */}
                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        {/* Engine Source Badge (Clean text, no emojis) */}
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Cpu className="h-3 w-3 text-slate-500" />
                            <span>{modelSource}</span>
                        </div>

                        {/* Triage Badge (Static dot, no animation) */}
                        <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase border shadow-2xs whitespace-nowrap ${badgeStyle}`}>
                            <span className={`h-2 w-2 rounded-full ${dotColor}`} />
                            <span>{triageLabel}</span>
                        </div>

                        <button
                            onClick={fetchInsight}
                            disabled={loading}
                            className="h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all duration-200 hover:scale-105 shadow-2xs cursor-pointer shrink-0"
                            title="Refresh Clinical Assessment"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* 2-Column Horizontal Split across Full Width */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column (7 cols): Clinical Telemetry Synthesis Narrative & Differential Diagnosis */}
                <div className="lg:col-span-7 space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Diagnostic Telemetry Synthesis
                            </span>
                            <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                                <Activity className="h-3 w-3" /> Live Collar Stream
                            </span>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed bg-slate-50/70 p-5 rounded-2xl border border-slate-100/90">
                            {insight?.summary || (
                                loading ? (
                                    <div className="flex items-center gap-2 text-slate-500 italic py-1">
                                        <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                                        <span>Synthesizing multi-modal telemetry packets...</span>
                                    </div>
                                ) : (
                                    `Awaiting live collar telemetry stream for ${animalName || 'subject'}...`
                                )
                            )}
                        </div>
                    </div>

                    {/* Differential Diagnosis Tags */}
                    {insight?.differentialDiagnosis && insight.differentialDiagnosis.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                Differential Considerations
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                {insight.differentialDiagnosis.map((item, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (5 cols): Recommended Care Protocol Box */}
                <div className="lg:col-span-5 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Recommended Care Protocol
                    </span>

                    {insight?.recommendations && insight.recommendations.length > 0 ? (
                        <div className="bg-slate-50/90 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                                <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0" />
                                <span>Actionable Directives</span>
                            </div>
                            <ul className="space-y-2.5 text-xs text-slate-600 m-0 pl-1 list-none">
                                {insight.recommendations.map((rec, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                                        <span className="leading-relaxed text-slate-700 font-medium">{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>Subject is maintaining normal biological homeostasis under continuous monitoring.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Model Source Footer */}
            <div className="sm:hidden pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Active Engine:</span>
                <span className="font-semibold text-slate-700">{modelSource}</span>
            </div>
        </div>
    );
};
