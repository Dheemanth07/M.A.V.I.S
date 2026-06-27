import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Animal, AlertItem } from '../../../shared/types';
import { AnalyticsSection } from '../../analytics/components/AnalyticsSection';
import { ShieldCheck, Activity, AlertTriangle, Cpu, ArrowRight, Smile, Heart } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';

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

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="bento-card p-6 sm:p-8 bg-linear-to-r from-emerald-600 to-teal-600 text-white border-none shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
                            <Smile className="h-4 w-4" /> Everyday Care Dashboard
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Caregiver'}!
                        </h2>
                        <p className="text-sm text-emerald-100 max-w-xl font-medium m-0 leading-relaxed">
                            Everything looks peaceful. All your animals have active baseline collar tracking and their vitals are continuously monitored.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
                        <div className="p-3 rounded-xl bg-white/20 text-white">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black">{healthyCount} / {animals.length || 1}</div>
                            <div className="text-xs text-emerald-100 font-semibold">Doing Great Today</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-bold text-slate-500 m-0">Total Tracked Herd</p>
                        <h3 className="text-3xl font-black text-slate-900 mt-1 mb-0">{animals.length}</h3>
                        <p className="text-[11px] text-emerald-700 mt-1 m-0 font-bold">Active Collar Mesh</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-bold text-slate-500 m-0">Healthy Status</p>
                        <h3 className="text-3xl font-black text-emerald-700 mt-1 mb-0">{healthyCount}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 m-0 font-medium">Within baseline limits</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-bold text-slate-500 m-0">Elevated Deviations</p>
                        <h3 className="text-3xl font-black text-amber-700 mt-1 mb-0">{warningCount}</h3>
                        <p className="text-[11px] text-amber-700 mt-1 m-0 font-bold">Requires observation</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-bold text-slate-500 m-0">Critical Anomaly Alerts</p>
                        <h3 className="text-3xl font-black text-rose-700 mt-1 mb-0">{criticalCount || alerts.length}</h3>
                        <p className="text-[11px] text-rose-700 mt-1 m-0 font-bold">Immediate review</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                        <Cpu className="h-6 w-6" />
                    </div>
                </div>
            </div>

            <AnalyticsSection animals={animals} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => navigate('/animals')}
                    className="bento-card p-6 cursor-pointer group hover:border-emerald-500/50 transition flex flex-col justify-between bg-white"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">My Animals</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">View Detailed Animal Profiles</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed m-0">
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
                            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-700">Digital Twin Engine</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Inspect Baseline Patterns</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed m-0">
                            Deep-dive into personalized baseline tracking and numerical deviation scores to catch early health changes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
