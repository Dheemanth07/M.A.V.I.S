import React, { useState } from 'react';
import type { Animal, HealthStatusResponse } from '../types';
import { fetchHealthStatus } from '../services/api';
import { Cpu, RefreshCw, Thermometer, Heart, Wind, Battery, Zap } from 'lucide-react';

interface DigitalTwinMonitorProps {
    animals: Animal[];
}

export const DigitalTwinMonitor: React.FC<DigitalTwinMonitorProps> = ({ animals }) => {
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?._id || '');
    const [healthSummary, setHealthSummary] = useState<HealthStatusResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const loadTwinData = async (id: string) => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await fetchHealthStatus(id);
            setHealthSummary(data);
        } catch (err) {
            console.error('Failed to load twin status:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (selectedAnimalId) {
            loadTwinData(selectedAnimalId);
        } else if (animals.length > 0) {
            setSelectedAnimalId(animals[0]._id);
            loadTwinData(animals[0]._id);
        }
    }, [selectedAnimalId, animals]);

    const selectedAnimal = animals.find(a => a._id === selectedAnimalId) || animals[0];

    return (
        <div className="space-y-6">
            {/* Subject Selector Header */}
            <div className="mavis-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white m-0">Personalised Digital Twin Telemetry</h2>
                        <p className="text-xs text-slate-400 m-0">Real-time baseline tracking & deviation anomaly classification</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedAnimalId}
                        onChange={(e) => setSelectedAnimalId(e.target.value)}
                        className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-teal-500 w-full sm:w-64"
                    >
                        {animals.map(a => (
                            <option key={a._id} value={a._id}>{a.name} ({a.species})</option>
                        ))}
                    </select>

                    <button
                        onClick={() => loadTwinData(selectedAnimalId)}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                        title="Refresh Twin Telemetry"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            {selectedAnimal && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Subject Profile & Baseline Status (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="mavis-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`mavis-badge mavis-badge-${healthSummary?.status || selectedAnimal.healthStatus}`}>
                                    {healthSummary?.status || selectedAnimal.healthStatus}
                                </span>
                                <span className="text-xs text-slate-400 font-mono">ID: {selectedAnimal._id.substring(0, 8)}</span>
                            </div>

                            <h3 className="text-2xl font-black text-white mb-1">{selectedAnimal.name}</h3>
                            <p className="text-xs text-slate-400 mb-6">{selectedAnimal.species} • {selectedAnimal.breed || 'Standard Breed'}</p>

                            {/* Baseline Initialization Progress */}
                            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 mb-6">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-400 font-medium">Baseline Initialization</span>
                                    <span className="text-teal-400 font-bold">
                                        {healthSummary?.baselineReadingsCount ?? selectedAnimal.baselineReadingsCount ?? 0} / 10 Readings
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                                        style={{ width: `${Math.min(100, ((healthSummary?.baselineReadingsCount ?? selectedAnimal.baselineReadingsCount ?? 0) / 10) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Learned Baselines Summary */}
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Learned Baselines (EMA α=0.1)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5 text-teal-400" /> Temp Baseline</div>
                                    <div className="text-lg font-extrabold text-white mt-1">{(healthSummary?.baselines || selectedAnimal.baselines)?.temperature || '38.0'}°C</div>
                                </div>
                                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-blue-400" /> Heart Rate</div>
                                    <div className="text-lg font-extrabold text-white mt-1">{(healthSummary?.baselines || selectedAnimal.baselines)?.heartRate || '75'} BPM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Telemetry Cards & Deviations (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="mavis-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-white m-0">Live Vitals & Anomaly Deviation Scores</h3>
                                    <p className="text-xs text-slate-400 m-0">Comparing live telemetry against personalized Digital Twin baseline</p>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold">
                                    Live Stream
                                </span>
                            </div>

                            {/* 4 Telemetry Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Temperature */}
                                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-2 font-semibold text-slate-300"><Thermometer className="h-4 w-4 text-teal-400" /> Body Temperature</span>
                                        <span>Dev: <strong className={healthSummary?.deviations?.temperature && healthSummary.deviations.temperature > 1.0 ? 'text-red-400' : 'text-emerald-400'}>
                                            +{healthSummary?.deviations?.temperature ?? 0.2}°C
                                        </strong></span>
                                    </div>
                                    <div className="text-3xl font-black text-white">
                                        {healthSummary?.currentMetrics?.temperature ?? 38.2}<span className="text-lg text-slate-400 font-normal">°C</span>
                                    </div>
                                </div>

                                {/* Heart Rate */}
                                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-2 font-semibold text-slate-300"><Heart className="h-4 w-4 text-blue-400" /> Heart Rate</span>
                                        <span>Dev: <strong className="text-emerald-400">+{healthSummary?.deviations?.heartRate ?? 2} BPM</strong></span>
                                    </div>
                                    <div className="text-3xl font-black text-white">
                                        {healthSummary?.currentMetrics?.heartRate ?? 77}<span className="text-lg text-slate-400 font-normal"> BPM</span>
                                    </div>
                                </div>

                                {/* Respiratory Rate */}
                                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-2 font-semibold text-slate-300"><Wind className="h-4 w-4 text-purple-400" /> Respiratory Rate</span>
                                        <span>Dev: <strong className="text-emerald-400">+{healthSummary?.deviations?.respiratoryRate ?? 1}</strong></span>
                                    </div>
                                    <div className="text-3xl font-black text-white">
                                        {healthSummary?.currentMetrics?.respiratoryRate ?? 23}
                                    </div>
                                </div>

                                {/* Collar Battery */}
                                <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-2 font-semibold text-slate-300"><Battery className="h-4 w-4 text-amber-400" /> Collar Battery</span>
                                        <span className="text-emerald-400 font-semibold">Normal Ops</span>
                                    </div>
                                    <div className="text-3xl font-black text-white">
                                        {healthSummary?.currentMetrics?.battery ?? 88}<span className="text-lg text-slate-400 font-normal">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Alerts in Digital Twin */}
                            {healthSummary?.alerts && healthSummary.alerts.length > 0 && (
                                <div className="mt-6 bg-red-500/10 border border-red-500/30 p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                                        <Zap className="h-4 w-4" /> Active Telemetry Alerts ({healthSummary.alerts.length})
                                    </div>
                                    <ul className="space-y-1 text-xs text-red-200 pl-5 list-disc m-0">
                                        {healthSummary.alerts.map((alt, idx) => (
                                            <li key={idx}>{alt}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
