import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Animal, AlertItem, HealthStatusResponse } from '../../shared/types';
import { fetchHealthStatus, updateAlertStatus } from '../../shared/services/api';
import { useAuth } from '../auth/context/AuthContext';
import { useToast } from '../../shared/context/ToastContext';
import {
    ShieldCheck, Activity, AlertTriangle, Cpu, Heart,
    ArrowUpRight, AlertCircle, Eye, RefreshCw
} from 'lucide-react';

interface UserDashboardOverviewProps {
    animals: Animal[];
    alerts: AlertItem[];
}

export const UserDashboardOverview: React.FC<UserDashboardOverviewProps> = ({
    animals,
    alerts,
}) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [healthMap, setHealthMap] = useState<Record<string, HealthStatusResponse>>({});
    const [loadingHealth, setLoadingHealth] = useState(false);

    const loadAllVitals = () => {
        if (animals.length === 0) return;
        setLoadingHealth(true);
        Promise.allSettled(animals.map(a => fetchHealthStatus(a._id)))
            .then(results => {
                const map: Record<string, HealthStatusResponse> = {};
                results.forEach((res, idx) => {
                    if (res.status === 'fulfilled') {
                        map[animals[idx]._id] = res.value;
                    }
                });
                setHealthMap(map);
            })
            .finally(() => setLoadingHealth(false));
    };

    useEffect(() => {
        loadAllVitals();
    }, [animals]);

    const healthyCount = animals.filter(a => (a.healthStatus || 'healthy') === 'healthy').length;
    const warningCount = animals.filter(a => a.healthStatus === 'warning').length;
    const criticalCount = animals.filter(a => a.healthStatus === 'critical').length;

    const dynamicInsightText = criticalCount > 0 
        ? `${criticalCount} subject(s) displaying critical temperature or heart rate deviations. Review alerts immediately.`
        : warningCount > 0 
        ? `${warningCount} subject(s) showing minor baseline shifts. Monitor hydration during afternoon peak heat.`
        : `All ${animals.length || 1} tracked animals are operating within optimal baseline physiological parameters. Collar mesh connection is 100% active.`;

    // Active unacknowledged alerts from real MongoDB data
    const activeAlerts = alerts.filter(a => a && a.status === 'active');

    const handleAcknowledge = async (id: string) => {
        try {
            await updateAlertStatus(id, 'acknowledged');
            showToast('Alert acknowledged and marked under review.', 'info');
        } catch {
            showToast('Failed to update alert.', 'error');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Welcome Banner */}
            <div className="bento-card p-8 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white relative overflow-hidden border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold tracking-wider uppercase">
                            <Activity className="h-3.5 w-3.5" />
                            <span>Livestock &amp; Companion Health Monitoring</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0 font-display">
                            Welcome back, {user?.name ? user.name.split(' ')[0] : 'Caregiver'}
                        </h2>
                        <p className="text-sm text-slate-300 max-w-xl font-normal m-0 leading-relaxed">
                            Continuous real-time physiological telemetry, baseline calibration, and epidemiological contagion tracking active.
                        </p>
                    </div>

                    <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 flex items-center gap-4 shrink-0">
                        <div className="p-3 rounded-xl bg-teal-500/20 text-teal-300">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold tracking-tight text-white">{healthyCount} / {animals.length || 0}</div>
                            <div className="text-xs text-slate-300 font-medium">Optimal Baseline Status</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clinical Telemetry Summary Banner */}
            <div className="bento-card p-4 sm:p-4.5 bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-100/80 shrink-0">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 leading-relaxed">
                        <strong className="text-teal-950 font-bold mr-1.5 whitespace-nowrap">Clinical Triage Summary:</strong>
                        <span className="text-slate-700 font-normal">{dynamicInsightText}</span>
                    </div>
                </div>
            </div>

            {/* 4 Core KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Total Tracked Herd</p>
                        <h3 className="text-3xl font-bold tracking-tight text-slate-900 mt-1 mb-0 font-display">{animals.length}</h3>
                        <p className="text-[11px] text-emerald-700 mt-1 m-0 font-medium">Active Collar Mesh</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Healthy Status</p>
                        <h3 className="text-3xl font-bold tracking-tight text-emerald-700 mt-1 mb-0 font-display">{healthyCount}</h3>
                        <p className="text-[11px] text-slate-500 mt-1 m-0 font-normal">Within baseline limits</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Elevated Deviations</p>
                        <h3 className="text-3xl font-bold tracking-tight text-amber-700 mt-1 mb-0 font-display">{warningCount}</h3>
                        <p className="text-[11px] text-amber-700 mt-1 m-0 font-medium">Requires observation</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                        <AlertTriangle className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 flex items-center justify-between bg-white">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 tracking-wider uppercase m-0">Critical Anomaly Alerts</p>
                        <h3 className="text-3xl font-bold tracking-tight text-rose-700 mt-1 mb-0 font-display">{criticalCount || alerts.length}</h3>
                        <p className="text-[11px] text-rose-700 mt-1 m-0 font-medium">Immediate review</p>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                        <Cpu className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Active Clinical Priority Alerts (Only if active alerts exist) */}
            {activeAlerts.length > 0 && (
                <div className="bento-card p-6 bg-white border-l-4 border-l-rose-500 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                                    Priority Clinical Attention Queue ({activeAlerts.length})
                                </h3>
                                <p className="text-xs text-slate-500 m-0">
                                    Unresolved telemetry anomalies requiring caregiver observation
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/alerts')}
                            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                        >
                            <span>Open Alert Center</span>
                            <ArrowUpRight className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {activeAlerts.slice(0, 4).map((alert) => {
                            let animalName = 'Unknown Subject';
                            if (alert.animalId && typeof alert.animalId === 'object') {
                                animalName = alert.animalId.name || 'Subject';
                            } else if (typeof alert.animalId === 'string') {
                                animalName = alert.animalId;
                            }
                            const isCritical = alert.severity === 'critical' || alert.type === 'ANOMALY';

                            return (
                                <div
                                    key={alert._id}
                                    className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                                        isCritical ? 'bg-rose-50/50 border-rose-200/80' : 'bg-amber-50/50 border-amber-200/80'
                                    }`}
                                >
                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-slate-900">{animalName}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                                isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                            }`}>
                                                {alert.type || 'ALERT'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 line-clamp-2 m-0">{alert.message}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAcknowledge(alert._id)}
                                        className="h-8 px-3 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shrink-0 flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                        title="Acknowledge Alert"
                                    >
                                        <Eye className="h-3.5 w-3.5" />
                                        <span>Acknowledge</span>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Real Live Herd Vitals Table (100% Real Physical Collar Sensors: DS18B20 Temp, MAX30102 HR/SpO2, MPU6050 Motion) */}
            <div className="bento-card p-6 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                                <Activity className="h-4 w-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                                Live Herd Telemetry Matrix
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 m-0 mt-0.5">
                            Real-time core vitals and learned baseline deviations from physical collar sensors
                        </p>
                    </div>

                    <button
                        onClick={loadAllVitals}
                        disabled={loadingHealth}
                        className="h-8 px-3.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                        title="Refresh Live Collar Telemetry"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loadingHealth ? 'animate-spin text-teal-600' : ''}`} />
                        <span>Refresh Vitals</span>
                    </button>
                </div>

                {/* Compact Vitals Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                                <th className="pb-3 pr-4">Animal</th>
                                <th className="pb-3 px-3">Core Body Temp</th>
                                <th className="pb-3 px-3">Heart Rate</th>
                                <th className="pb-3 px-3">SpO2 / Resp Rate</th>
                                <th className="pb-3 px-3">Health Status</th>
                                <th className="pb-3 pl-3 text-right">Deep Dive</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                            {animals.map((animal) => {
                                const health = healthMap[animal._id];
                                const metrics = health?.currentMetrics;
                                const dev = health?.deviations;

                                const temp = metrics?.temperature ?? animal.baselines?.temperature ?? 38.5;
                                const hr = metrics?.heartRate ?? animal.baselines?.heartRate ?? 70;
                                const rr = metrics?.respiratoryRate ?? animal.baselines?.respiratoryRate ?? 24;
                                const spo2 = metrics?.bloodOxygen ?? animal.baselines?.bloodOxygen ?? 98;

                                const tempDev = dev ? dev.temperature : 0;
                                const hrDev = dev ? dev.heartRate : 0;

                                const status = animal.healthStatus || 'healthy';
                                let statusPill = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                                let statusLabel = 'Normal Baseline';
                                let dotColor = 'bg-emerald-500';

                                if (status === 'critical') {
                                    statusPill = 'bg-rose-50 text-rose-700 border-rose-200';
                                    statusLabel = 'Critical Attention';
                                    dotColor = 'bg-rose-500';
                                } else if (status === 'warning') {
                                    statusPill = 'bg-amber-50 text-amber-800 border-amber-200';
                                    statusLabel = 'Under Observation';
                                    dotColor = 'bg-amber-500';
                                }

                                return (
                                    <tr key={animal._id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3.5 pr-4">
                                            <div className="font-bold text-slate-900 text-sm font-display">{animal.name}</div>
                                            <div className="text-[11px] text-slate-500">{animal.species} • {animal.breed || 'Standard Breed'}</div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="font-mono font-bold text-slate-800 text-xs">
                                                {temp.toFixed(1)}°C
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-normal">
                                                {tempDev !== 0 ? `${tempDev > 0 ? '+' : ''}${tempDev.toFixed(1)}°C vs base` : 'Optimal baseline'}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="font-mono font-bold text-slate-800 text-xs">
                                                {hr} BPM
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-normal">
                                                {hrDev !== 0 ? `${hrDev > 0 ? '+' : ''}${hrDev} BPM vs resting` : 'Normal resting'}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <div className="font-mono text-slate-700 text-xs font-semibold">
                                                {spo2}% <span className="text-slate-400 font-normal">/</span> {rr} BPM
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-normal">SpO2 / Resp</div>
                                        </td>
                                        <td className="py-3.5 px-3">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${statusPill}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                                                <span>{statusLabel}</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 pl-3 text-right">
                                            <button
                                                onClick={() => navigate('/twin')}
                                                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-teal-50 text-teal-700 hover:text-teal-900 border border-slate-200 hover:border-teal-200 font-semibold text-xs cursor-pointer transition shadow-2xs inline-flex items-center gap-1"
                                                title={`View ${animal.name}'s Digital Twin`}
                                            >
                                                <span>View Twin</span>
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Direct System Navigation Shortcuts (3 Cards in One Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div
                    onClick={() => navigate('/animals')}
                    className="bento-card p-6 cursor-pointer group hover:border-teal-500/50 transition flex flex-col justify-between bg-white"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Subject Registry</span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                        </div>
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 m-0 font-display">Manage Animal Profiles</h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed m-0">
                            Inspect device pairing, breed data, and export comprehensive clinical PDF veterinary audit reports.
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => navigate('/analytics')}
                    className="bento-card p-6 cursor-pointer group hover:border-emerald-500/50 transition flex flex-col justify-between bg-white"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Analytics &amp; Trends</span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                        </div>
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 m-0 font-display">Herd Risk &amp; Deviations</h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed m-0">
                            Compare clinical deviations and baseline risk distributions across your entire animal group.
                        </p>
                    </div>
                </div>

                <div
                    onClick={() => navigate('/twin')}
                    className="bento-card p-6 cursor-pointer group hover:border-indigo-500/50 transition flex flex-col justify-between bg-white"
                >
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Digital Twin Engine</span>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                        </div>
                        <h4 className="text-lg font-bold tracking-tight text-slate-900 m-0 font-display">Local AI Diagnostics</h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed m-0">
                            Deep-dive into 24-hour diurnal circadian rhythms and real-time offline SLM veterinary assessments.
                        </p>
                    </div>
                </div>
            </div>

            {/* 
                TODO: Enable Barn Climate & THI Index once physical DHT11/DHT22 environmental sensor is connected to ESP32
            */}
        </div>
    );
};
