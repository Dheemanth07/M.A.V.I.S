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
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                        <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 m-0">Personalised Digital Twin Telemetry</h2>
                        <p className="text-xs text-slate-500 font-medium m-0">Real-time baseline tracking & deviation anomaly classification</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedAnimalId}
                        onChange={(e) => setSelectedAnimalId(e.target.value)}
                        className="bg-slate-50 border border-slate-300 text-slate-900 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-teal-600 w-full sm:w-64"
                    >
                        {animals.map(a => (
                            <option key={a._id} value={a._id}>{a.name} ({a.species})</option>
                        ))}
                    </select>

                    <button
                        onClick={() => loadTwinData(selectedAnimalId)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-300 transition"
                        title="Refresh Twin Telemetry"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-600' : ''}`} />
                    </button>
                </div>
            </div>

            {selectedAnimal && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Subject Profile & Baseline Status (4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bento-card p-6 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`status-pill-${healthSummary?.status || selectedAnimal.healthStatus || 'healthy'} text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                                    {healthSummary?.status || selectedAnimal.healthStatus || 'healthy'}
                                </span>
                                <span className="text-xs text-slate-400 font-mono font-bold">ID: {selectedAnimal._id.substring(0, 8)}</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-1">{selectedAnimal.name}</h3>
                            <p className="text-xs text-slate-500 font-medium mb-6">{selectedAnimal.species} • {selectedAnimal.breed || 'Standard Breed'}</p>

                            {/* Baseline Initialization Progress */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 mb-6">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 font-bold">Baseline Initialization</span>
                                    <span className="text-teal-700 font-black">
                                        {healthSummary?.baselineReadingsCount ?? selectedAnimal.baselineReadingsCount ?? 0} / 10 Readings
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                                        style={{ width: `${Math.min(100, ((healthSummary?.baselineReadingsCount ?? selectedAnimal.baselineReadingsCount ?? 0) / 10) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Learned Baselines Summary */}
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Learned Baselines (EMA α=0.1)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><Thermometer className="h-3.5 w-3.5 text-teal-600" /> Temp Baseline</div>
                                    <div className="text-lg font-black text-slate-900 mt-1">{Number((healthSummary?.baselines || selectedAnimal.baselines)?.temperature || 38.0).toFixed(1)}°C</div>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                    <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-blue-600" /> Heart Rate</div>
                                    <div className="text-lg font-black text-slate-900 mt-1">{(healthSummary?.baselines || selectedAnimal.baselines)?.heartRate || '75'} BPM</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Telemetry Cards & Deviations (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bento-card p-6 bg-white">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 m-0">Live Vitals & Anomaly Deviation Scores</h3>
                                    <p className="text-xs text-slate-500 font-medium m-0">Comparing live telemetry against personalized Digital Twin baseline</p>
                                </div>
                                <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-extrabold">
                                    Live Stream
                                </span>
                            </div>

                            {/* 4 Telemetry Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Temperature */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-700"><Thermometer className="h-4 w-4 text-teal-600" /> Body Temperature</span>
                                        <span className="font-bold text-slate-500">Dev: <strong className={healthSummary?.deviations?.temperature && healthSummary.deviations.temperature > 1.0 ? 'text-rose-600 font-black' : 'text-teal-700 font-black'}>
                                            +{Number(healthSummary?.deviations?.temperature ?? 0).toFixed(1)}°C
                                        </strong></span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {Number(healthSummary?.currentMetrics?.temperature ?? 38.2).toFixed(1)}<span className="text-lg text-slate-500 font-semibold">°C</span>
                                    </div>
                                </div>

                                {/* Heart Rate */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-700"><Heart className="h-4 w-4 text-blue-600" /> Heart Rate</span>
                                        <span className="font-bold text-slate-500">Dev: <strong className="text-teal-700 font-black">+{healthSummary?.deviations?.heartRate ?? 0} BPM</strong></span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {healthSummary?.currentMetrics?.heartRate ?? 72}<span className="text-lg text-slate-500 font-semibold"> BPM</span>
                                    </div>
                                </div>

                                {/* Respiratory Rate */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-700"><Wind className="h-4 w-4 text-purple-600" /> Respiratory Rate</span>
                                        <span className="font-bold text-slate-500">Dev: <strong className="text-teal-700 font-black">+{healthSummary?.deviations?.respiratoryRate ?? 0}</strong></span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {healthSummary?.currentMetrics?.respiratoryRate ?? 24}
                                    </div>
                                </div>

                                {/* Collar Battery */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-bold text-slate-700"><Battery className="h-4 w-4 text-amber-600" /> Collar Battery</span>
                                        <span className="text-teal-700 font-bold">Normal Ops</span>
                                    </div>
                                    <div className="text-3xl font-black text-slate-900">
                                        {healthSummary?.currentMetrics?.battery ?? 88}<span className="text-lg text-slate-500 font-semibold">%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Active Alerts in Digital Twin */}
                            {healthSummary?.alerts && healthSummary.alerts.length > 0 && (
                                <div className="mt-6 bg-rose-50 border border-rose-200 p-4 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-rose-700">
                                        <Zap className="h-4 w-4 text-rose-600" /> Active Telemetry Alerts ({healthSummary.alerts.length})
                                    </div>
                                    <ul className="space-y-1 text-xs text-rose-900 font-medium pl-5 list-disc m-0">
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
