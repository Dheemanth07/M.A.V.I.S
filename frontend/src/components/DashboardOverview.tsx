import React from 'react';
import type { Animal, AlertItem } from '../types';
import { AnalyticsSection } from './AnalyticsSection';
import { ShieldCheck, AlertTriangle, Cpu, Activity, ArrowRight } from 'lucide-react';

interface DashboardOverviewProps {
    animals: Animal[];
    alerts: AlertItem[];
    setActiveTab: (tab: 'overview' | 'herd' | 'analytics' | 'twin' | 'alerts') => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
    animals,
    alerts,
    setActiveTab
}) => {
    const healthyCount = animals.filter(a => a.healthStatus === 'healthy').length;
    const warningCount = animals.filter(a => a.healthStatus === 'warning').length;
    const criticalCount = animals.filter(a => a.healthStatus === 'critical').length;

    return (
        <div className="space-y-8">
            {/* Top Stat Bento Grid (InsightPay style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Registered Herd */}
                <div className="mavis-card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 m-0">Total Tracked Herd</p>
                        <h3 className="text-3xl font-black text-white mt-1 mb-0">{animals.length}</h3>
                        <p className="text-[11px] text-teal-400 mt-1 m-0 font-medium">Active IoT Collar Mesh</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                </div>

                {/* Healthy Status */}
                <div className="mavis-card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 m-0">Healthy Status</p>
                        <h3 className="text-3xl font-black text-emerald-400 mt-1 mb-0">{healthyCount}</h3>
                        <p className="text-[11px] text-slate-400 mt-1 m-0 font-medium">Within baseline limits</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>

                {/* Warning Status */}
                <div className="mavis-card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 m-0">Elevated Deviations</p>
                        <h3 className="text-3xl font-black text-amber-400 mt-1 mb-0">{warningCount}</h3>
                        <p className="text-[11px] text-amber-400/80 mt-1 m-0 font-medium">Requires observation</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                {/* Critical Anomalies */}
                <div className="mavis-card p-5 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 m-0">Critical Anomaly Alerts</p>
                        <h3 className="text-3xl font-black text-red-400 mt-1 mb-0">{criticalCount || alerts.length}</h3>
                        <p className="text-[11px] text-red-400/80 mt-1 m-0 font-medium">Immediate vet review</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <Cpu className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Embed Analytics Section (Bar Chart & Pie Chart) */}
            <AnalyticsSection animals={animals} />

            {/* Quick Navigation Cards Bento Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                    onClick={() => setActiveTab('twin')}
                    className="mavis-card p-6 cursor-pointer group hover:border-teal-500/40 transition flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Digital Twin Engine</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Inspect Individual Baseline Deviations</h3>
                        <p className="text-xs text-slate-400 leading-relaxed m-0">
                            View live temperature spikes, respiratory variations, and collar telemetry for each subject against their learned EMA baseline.
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => setActiveTab('herd')}
                    className="mavis-card p-6 cursor-pointer group hover:border-teal-500/40 transition flex flex-col justify-between"
                >
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">Herd Management</span>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Register & Manage Subject Profiles</h3>
                        <p className="text-xs text-slate-400 leading-relaxed m-0">
                            Add new cattle, monitor collar pairing status, and inspect detailed profiles across your registered livestock mesh.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
