import React, { useState } from 'react';
import type { Animal, HealthStatusResponse } from '../../shared/types';
import { fetchHealthStatus } from '../../shared/services/api';
import { RefreshCw, Thermometer, Heart, Wind, Battery, Zap, Activity } from 'lucide-react';
import { AICopilotCard } from './AICopilotCard';

interface DigitalTwinMonitorProps {
    animals: Animal[];
    role?: 'user' | 'admin';
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
            console.error('Failed to load digital twin health status:', err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (selectedAnimalId) {
            loadTwinData(selectedAnimalId);
            const interval = setInterval(() => {
                loadTwinData(selectedAnimalId);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [selectedAnimalId]);

    const selectedAnimal = animals.find(a => a._id === selectedAnimalId) || animals[0];

    const currentTemp = healthSummary?.currentMetrics?.temperature;
    const currentHR = healthSummary?.currentMetrics?.heartRate;
    const currentRR = healthSummary?.currentMetrics?.respiratoryRate;
    const currentBattery = healthSummary?.currentMetrics?.battery;

    const baseTemp = healthSummary?.baselines?.temperature ?? selectedAnimal?.baselines?.temperature;
    const baseHR = healthSummary?.baselines?.heartRate ?? selectedAnimal?.baselines?.heartRate;

    const baselineCount = healthSummary?.baselineReadingsCount ?? selectedAnimal?.baselineReadingsCount ?? 0;
    const isCalibrating = baselineCount < 10;
    const hasLiveSignal = currentTemp !== undefined && currentTemp !== null;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Clinical Baseline Calibration Banner */}
            <div className="bento-card p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-teal-800/50">
                <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 shrink-0">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white m-0">Biological Baseline Calibration (Digital Twin)</h3>
                            <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal-500/20 text-teal-200 border border-teal-400/30 px-2 py-0.5 rounded-full">
                                {isCalibrating ? `Calibrating (${baselineCount}/10 Readings)` : 'Baseline Locked (EMA α=0.05)'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300 font-normal m-0 leading-relaxed max-w-2xl">
                            Each animal possesses an individualized biological baseline learned over its initial 10 collar telemetry packets. Real-time alerts trigger based on mathematical deviation from this virtual model.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                    <select
                        value={selectedAnimalId}
                        onChange={(e) => setSelectedAnimalId(e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                        {animals.map(a => (
                            <option key={a._id} value={a._id}>{a.name} ({a.species})</option>
                        ))}
                    </select>

                    <button
                        onClick={() => loadTwinData(selectedAnimalId)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-teal-400 rounded-xl border border-slate-700 transition cursor-pointer"
                        title="Refresh Live Telemetry"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            {selectedAnimal && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Baseline Profile & Calibration Progress */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-2xs space-y-5">
                            <div className="flex items-center justify-between">
                                <span className={`status-pill-${healthSummary?.status || selectedAnimal.healthStatus || 'healthy'} text-[11px] font-bold px-3 py-1 rounded-full tracking-wider uppercase`}>
                                    {healthSummary?.status || selectedAnimal.healthStatus || 'HEALTHY'}
                                </span>
                                <span className="text-xs text-slate-400 font-mono font-medium">Node ID: {selectedAnimal._id.substring(0, 8)}</span>
                            </div>

                            <div>
                                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-0.5">{selectedAnimal.name}</h3>
                                <p className="text-xs text-slate-500 font-normal m-0">{selectedAnimal.species} • {selectedAnimal.breed || 'Standard Breed'}</p>
                            </div>

                            {/* Calibration Progress Bar */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-600 font-semibold">Baseline Calibration</span>
                                    <span className="text-teal-700 font-bold">
                                        {baselineCount} / 10 Readings
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-teal-600 transition-all duration-500 rounded-full"
                                        style={{ width: `${Math.min(100, (baselineCount / 10) * 100)}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 font-normal m-0">
                                    {isCalibrating ? 'Collecting first readings to establish normal vitals.' : 'Normal vitals learned from steady continuous monitoring.'}
                                </p>
                            </div>

                            {/* Established Baselines */}
                            <div>
                                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3">
                                    Normal Vitals Range
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                        <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                            <Thermometer className="h-3.5 w-3.5 text-teal-600" /> Normal Temp
                                        </div>
                                        <div className="text-lg font-bold tracking-tight text-slate-900 mt-1">
                                            {baseTemp ? `${Number(baseTemp).toFixed(1)}°C` : '--'}
                                        </div>
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                            {selectedAnimal.species} Baseline
                                        </span>
                                    </div>
                                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                                        <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                            <Heart className="h-3.5 w-3.5 text-blue-600" /> Normal Heart Rate
                                        </div>
                                        <div className="text-lg font-bold tracking-tight text-slate-900 mt-1">
                                            {baseHR ? `${baseHR} BPM` : '--'}
                                        </div>
                                        <span className="text-[10px] text-slate-500 block mt-0.5">
                                            Resting Pulse Baseline
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Live Telemetry & Deviation Gauges */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-2xs">
                            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight text-slate-900 m-0 font-display">
                                        Live Collar Vitals & Differences
                                    </h3>
                                    <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                                        Comparing live collar readings against learned normal vitals
                                    </p>
                                </div>
                                <span className={`text-[11px] px-3 py-1 rounded-full font-bold tracking-wider uppercase border ${
                                    hasLiveSignal 
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                                        : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                }`}>
                                    {hasLiveSignal ? 'Live Telemetry Active' : 'Waiting for Collar Signal'}
                                </span>
                            </div>

                            {/* Vital Metric Cards with Deviation Scores */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Temperature */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                                            <Thermometer className="h-4 w-4 text-teal-600" /> Body Temperature
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Diff: <strong className={healthSummary?.deviations?.temperature && healthSummary.deviations.temperature > 1.0 ? 'text-rose-600 font-bold' : 'text-teal-700 font-bold'}>
                                                {healthSummary?.deviations?.temperature !== undefined ? `+${Number(healthSummary.deviations.temperature).toFixed(1)}°C` : '--'}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900">
                                        {currentTemp !== undefined && currentTemp !== null ? (
                                            <>{Number(currentTemp).toFixed(1)}<span className="text-lg text-slate-500 font-normal">°C</span></>
                                        ) : (
                                            <span className="text-slate-400 font-normal text-xl">-- °C</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-normal m-0">Live Collar Temperature Sensor</p>
                                </div>

                                {/* Heart Rate */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                                            <Heart className="h-4 w-4 text-blue-600" /> Live Heart Rate
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Diff: <strong className="text-teal-700 font-bold">
                                                {healthSummary?.deviations?.heartRate !== undefined ? `+${healthSummary.deviations.heartRate} BPM` : '--'}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900">
                                        {currentHR !== undefined && currentHR !== null && currentHR > 0 ? (
                                            <>{currentHR}<span className="text-lg text-slate-500 font-normal"> BPM</span></>
                                        ) : (
                                            <span className="text-slate-400 font-normal text-xl">-- BPM</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-normal m-0">Live Collar Pulse Sensor</p>
                                </div>

                                {/* Respiratory Rate */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                                            <Wind className="h-4 w-4 text-purple-600" /> Breathing Rate
                                        </span>
                                        <span className="text-[11px] font-semibold text-slate-500">
                                            Diff: <strong className="text-teal-700 font-bold">
                                                {healthSummary?.deviations?.respiratoryRate !== undefined ? `+${healthSummary.deviations.respiratoryRate}` : '--'}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900">
                                        {currentRR !== undefined && currentRR !== null ? currentRR : <span className="text-slate-400 font-normal text-xl">--</span>}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-normal m-0">Breaths Per Minute</p>
                                </div>

                                {/* Battery & Collar Health */}
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-2 font-semibold text-slate-700">
                                            <Battery className="h-4 w-4 text-emerald-600" /> Collar Battery
                                        </span>
                                        <span className="text-[11px] font-bold text-emerald-700">
                                            {currentBattery !== undefined && Number(currentBattery) < 20 ? 'Low Battery' : 'Good Battery'}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold tracking-tight text-slate-900">
                                        {currentBattery !== undefined && currentBattery !== null ? (
                                            <>{currentBattery}<span className="text-lg text-slate-500 font-normal">%</span></>
                                        ) : (
                                            <span className="text-slate-400 font-normal text-xl">-- %</span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-normal m-0">Remaining Battery Life</p>
                                </div>
                            </div>

                            {/* Active Critical Alerts (Deduplicated) */}
                            {healthSummary?.alerts && healthSummary.alerts.length > 0 && (() => {
                                const uniqueAlerts = Array.from(new Set(healthSummary.alerts));
                                if (uniqueAlerts.length === 0) return null;
                                return (
                                    <div className="mt-6 bg-rose-50 border border-rose-200/80 p-4 rounded-2xl space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-700">
                                            <Zap className="h-4 w-4 text-rose-600" /> Active Telemetry Alerts ({uniqueAlerts.length})
                                        </div>
                                        <ul className="space-y-1 text-xs text-rose-900 font-normal pl-5 list-disc m-0">
                                            {uniqueAlerts.map((alt, idx) => (
                                                <li key={idx}>{alt}</li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Full-Width Grounded Clinical Veterinary Assessment Card */}
                    <div className="lg:col-span-12">
                        <AICopilotCard 
                            animalId={selectedAnimal._id} 
                            animalName={selectedAnimal.name} 
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
