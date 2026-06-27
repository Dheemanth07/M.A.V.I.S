import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Animal, AlertItem } from '../../shared/types';
import { AnalyticsSection } from '../analytics/AnalyticsSection';
import { GeofenceMonitor } from '../geofence/GeofenceMonitor';
import { ShieldCheck, Activity, AlertTriangle, Cpu, ArrowRight, Smile, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/context/AuthContext';

interface UserDashboardOverviewProps {
    animals: Animal[];
    alerts: AlertItem[];
}

export const UserDashboardOverview: React.FC<UserDashboardOverviewProps> = ({
    animals,
    alerts,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const healthyCount = animals.filter(a => (a.healthStatus || 'healthy') === 'healthy').length;
    const warningCount = animals.filter(a => a.healthStatus === 'warning').length;
    const criticalCount = animals.filter(a => a.healthStatus === 'critical').length;

    const dynamicInsightText = criticalCount > 0 
        ? `${criticalCount} subject(s) displaying critical temperature or heart rate deviations. Review alerts immediately.`
        : warningCount > 0 
        ? `${warningCount} subject(s) showing minor baseline shifts. Monitor hydration during afternoon peak heat.`
        : `All ${animals.length || 1} tracked animals are operating within optimal baseline physiological parameters. Collar mesh connection is 100% active.`;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Banner */}
            <div className="bento-card p-8 bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold tracking-wider uppercase">
                            <Smile className="h-3.5 w-3.5" />
                            <span>Pet Care & Herd Overview</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0">
                            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Caregiver'}!
                        </h2>
                        <p className="text-sm text-emerald-100 max-w-xl font-normal m-0 leading-relaxed">
                            Everything looks peaceful. All your animals have active baseline collar tracking and their vitals are continuously monitored.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
                        <div className="p-3 rounded-xl bg-white/20 text-white">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold tracking-tight">{healthyCount} / {animals.length || 1}</div>
                            <div className="text-xs text-emerald-100 font-medium">Doing Great Today</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clean Insight Banner matching InsightPay styling */}
            <div className="bento-card p-4 sm:p-4.5 bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/80 shrink-0">
                        <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 leading-relaxed">
                        <strong className="text-emerald-800 font-bold mr-1.5 whitespace-nowrap">Daily Care Insight:</strong>
                        <span className="text-slate-700 font-normal">{dynamicInsightText}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Total Tracked Herd</p>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-1 mb-0">{animals.length}</h3>
                        <p className="text-[11px] text-emerald-700 mt-1 m-0 font-medium">Active Collar Mesh</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Healthy Status</p>
                        <h3 className="text-3xl font-bold tracking-tight text-emerald-700 mt-1 mb-0">{healthyCount}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 m-0 font-normal">Within baseline limits</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Elevated Deviations</p>
                        <h3 className="text-3xl font-bold tracking-tight text-amber-700 mt-1 mb-0">{warningCount}</h3>
                        <p className="text-[11px] text-amber-700 mt-1 m-0 font-medium">Requires observation</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Critical Anomaly Alerts</p>
                        <h3 className="text-3xl font-bold tracking-tight text-rose-700 mt-1 mb-0">{criticalCount || alerts.length}</h3>
                        <p className="text-[11px] text-rose-700 mt-1 m-0 font-medium">Immediate review</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                        <Cpu className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <AnalyticsSection animals={animals} />

            <GeofenceMonitor animals={animals} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => navigate('/animals')}
                    className="bento-card p-6 cursor-pointer group hover:border-emerald-500/50 transition flex flex-col justify-between bg-white"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">My Animals</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">View Detailed Animal Profiles</h3>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed m-0">
                            Inspect individual body temperature, resting heart rates, and quick status badges for every animal under your care.
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => navigate('/twin')}
                    className="bento-card p-6 cursor-pointer group hover:border-emerald-500/50 transition flex flex-col justify-between bg-white"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Digital Twin Engine</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-slate-900 mb-2">Inspect Baseline Patterns</h3>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed m-0">
                            Deep-dive into personalized baseline tracking and numerical deviation scores to catch early health changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
