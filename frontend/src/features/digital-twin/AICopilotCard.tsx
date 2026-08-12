import React, { useState, useEffect } from 'react';
import { Stethoscope, RefreshCw, CheckCircle2, Sparkles, Activity, Cpu } from 'lucide-react';

interface AICopilotCardProps {
    animalId?: string;
    animalName?: string;
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

    if (!animalId) return null;

    const rawRisk = insight?.riskLevel?.toLowerCase() || '';
    const isCritical = rawRisk.includes('high') || rawRisk.includes('critical');
    const isModerate = rawRisk.includes('mod') || rawRisk.includes('warn') || rawRisk.includes('elevated');
    const isGood = rawRisk.includes('low') || rawRisk.includes('good') || rawRisk.includes('normal') || rawRisk.includes('optimal') || rawRisk.includes('healthy');

    let triageLabel = 'Care Priority: Evaluating';
    let badgeStyle = 'bg-teal-50 border-teal-200 text-teal-800';
    let dotColor = 'bg-teal-500';

    if (isCritical) {
        triageLabel = 'Care Priority: Urgent (Critical)';
        badgeStyle = 'bg-rose-50 border-rose-200 text-rose-700';
        dotColor = 'bg-rose-500';
    } else if (isModerate) {
        triageLabel = 'Care Priority: Moderate (Warning)';
        badgeStyle = 'bg-amber-50 border-amber-200 text-amber-800';
        dotColor = 'bg-amber-500';
    } else if (isGood) {
        triageLabel = 'Care Priority: Low (Healthy)';
        badgeStyle = 'bg-emerald-50 border-emerald-200 text-emerald-800';
        dotColor = 'bg-emerald-500';
    } else if (insight?.riskLevel) {
        triageLabel = `Care Priority: ${insight.riskLevel}`;
    }

    const modelSource = insight?.source || 'Deterministic Clinical Safety Engine';

    return (
        <div className={`bento-card p-6 sm:p-7 w-full bg-white border transition-all duration-300 ${
            isCritical ? 'border-rose-200/90 shadow-rose-500/5' : 'border-slate-200/90'
        } shadow-sm space-y-5`}>

            {/* Header */}
            <div className="space-y-1.5 pb-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-4 flex-wrap">
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

                    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <Cpu className="h-3 w-3 text-slate-500" />
                            <span>{modelSource}</span>
                        </div>

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

            {/* 2-Column Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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

            {/* Mobile Footer */}
            <div className="sm:hidden pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Active Engine:</span>
                <span className="font-semibold text-slate-700">{modelSource}</span>
            </div>
        </div>
    );
};
