import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, RefreshCw } from 'lucide-react';

interface AICopilotCardProps {
    animalId?: string;
    animalName?: string;
}

interface AIInsight {
    riskLevel: string;
    summary: string;
    recommendations: string[];
}

export const AICopilotCard: React.FC<AICopilotCardProps> = ({ animalId, animalName }) => {
    const [insight, setInsight] = useState<AIInsight | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchInsight = async () => {
        if (!animalId) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/ai/${animalId}`);
            if (res.ok) {
                const json = await res.json();
                setInsight(json.data);
            }
        } catch (e) {
            console.error('Failed to fetch AI insight:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, [animalId]);

    if (!animalId) return null;

    return (
        <div className="bento-card p-6 bg-linear-to-br from-slate-900 to-indigo-950 text-white border-none shadow-lg space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-xs">
                        <Sparkles className="h-5 w-5 animate-pulse text-indigo-300" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-white m-0 flex items-center gap-2">
                            <span>MAVIS AI Veterinary Copilot</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                                GenAI Synthesis
                            </span>
                        </h3>
                        <p className="text-xs text-slate-400 m-0 font-medium">Real-time physiological telemetry analysis for {animalName || 'Subject'}</p>
                    </div>
                </div>

                <button
                    onClick={fetchInsight}
                    disabled={loading}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
                    title="Refresh AI Synthesis"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {insight && (
                <div className="space-y-3 pt-2">
                    <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed font-medium">
                        {insight.summary}
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">AI Care Recommendations:</span>
                        <ul className="space-y-1 pl-0 list-none m-0">
                            {insight.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                                    <Bot className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};
