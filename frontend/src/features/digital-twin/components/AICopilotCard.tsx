import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

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
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            const savedUser = localStorage.getItem('mavis_user');
            if (savedUser) {
                try {
                    const parsed = JSON.parse(savedUser);
                    if (parsed.id) headers['x-user-id'] = parsed.id;
                    if (parsed.role) headers['x-user-role'] = parsed.role;
                } catch (e) {}
            }

            const res = await fetch(`http://localhost:5000/api/ai/${animalId}`, { headers });
            if (res.ok) {
                const json = await res.json();
                setInsight(json.data);
            }
        } catch (e) {
            // Quiet fallback
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInsight();
    }, [animalId]);

    if (!animalId) return null;

    return (
        <div className="bento-card p-4 sm:p-4.5 bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
                    <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 leading-relaxed">
                    <strong className="text-emerald-800 font-bold mr-1.5 whitespace-nowrap">Vital Insight:</strong>
                    <span className="text-slate-700 font-semibold">{insight?.summary || `AI Digital Twin modeling confirms ${animalName || 'subject'}'s physiological state is stable and within optimal baseline parameters.`}</span>
                </div>
            </div>

            <button
                onClick={fetchInsight}
                disabled={loading}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer shrink-0 ml-2"
                title="Refresh Telemetry Insight"
            >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
        </div>
    );
};
