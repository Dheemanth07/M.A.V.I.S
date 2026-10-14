import React, { useState } from 'react';
import type { Animal, HealthStatusResponse } from '../../shared/types';
import { fetchHealthStatus } from '../../shared/services/api';
import { RefreshCw, Thermometer, Heart, Wind, Battery, Zap, Activity, ShieldCheck, AlertCircle, Compass, Users, Droplets, Radio } from 'lucide-react';
import { ClinicalAssessmentCard } from './ClinicalAssessmentCard';
import { HistoricalTrendsCard } from './HistoricalTrendsCard';
import { ClinicalTreatmentLogCard } from './ClinicalTreatmentLogCard';

interface DigitalTwinMonitorProps {
    animals: Animal[];
    role?: 'user' | 'admin';
}

export const DigitalTwinMonitor: React.FC<DigitalTwinMonitorProps> = ({ animals }) => {
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>(animals[0]?._id || '');
    const [healthSummary, setHealthSummary] = useState<HealthStatusResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showAlertDetails, setShowAlertDetails] = useState<boolean>(false);

    const loadTwinData = async (id: string) => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await fetchHealthStatus(id);
            setHealthSummary(data);
        } catch (err) {
            console.error('Failed to load health status profile:', err);
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
    const baseRR = healthSummary?.baselines?.respiratoryRate ?? selectedAnimal?.baselines?.respiratoryRate;
    const baseSpO2 = healthSummary?.baselines?.bloodOxygen ?? selectedAnimal?.baselines?.bloodOxygen;

    const baselineCount = healthSummary?.baselineReadingsCount ?? selectedAnimal?.baselineReadingsCount ?? 0;
    const isCalibrating = baselineCount < 10;
    const hasLiveSignal = currentTemp !== undefined && currentTemp !== null;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Clinical Baseline Calibration Banner */}
            <div className="p-5 sm:p-6 rounded-2xl bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-slate-700/60 shadow-sm">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="h-11 w-11 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                        <h3 className="font-sans text-base font-semibold text-white tracking-normal m-0">
                            Biological Baseline Calibration Profile
                        </h3>
                        <p className="text-xs text-slate-400 font-normal m-0 leading-relaxed">
                            Continuous physiological baseline tracking for real-time anomaly detection and vital trend analysis.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                    <select
                        value={selectedAnimalId}
                        onChange={(e) => setSelectedAnimalId(e.target.value)}
                        className="bg-slate-800/90 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-teal-500 cursor-pointer shadow-xs"
                    >
                        {animals.map(a => (
                            <option key={a._id} value={a._id}>{a.name} ({a.species})</option>
                        ))}
                    </select>

                    <button
                        onClick={() => loadTwinData(selectedAnimalId)}
                        className="p-2 bg-slate-800/90 hover:bg-slate-700 text-teal-400 rounded-xl border border-slate-700 transition cursor-pointer shadow-xs"
                        title="Refresh Live Telemetry"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
                    </button>
                </div>
            </div>

            {selectedAnimal && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left Column: Baseline Profile & Calibration Progress */}
                    <div className="lg:col-span-4">
                        <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-2xs h-full flex flex-col justify-between">
                            <div className="space-y-4">
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

                                {/* Established Baselines (4 Parameters Matching Live Telemetry) */}
                                <div>
                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                                        Normal Vitals Range
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                                <Thermometer className="h-3.5 w-3.5 text-teal-600" /> Normal Temp
                                            </div>
                                            <div className="text-base font-bold tracking-tight text-slate-900 mt-1">
                                                {baseTemp ? `${Number(baseTemp).toFixed(1)}°C` : '--'}
                                            </div>
                                            <span className="text-[9px] text-slate-400 block mt-0.5">
                                                {selectedAnimal.species} Baseline
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                                <Heart className="h-3.5 w-3.5 text-blue-600" /> Normal Heart
                                            </div>
                                            <div className="text-base font-bold tracking-tight text-slate-900 mt-1">
                                                {baseHR ? `${baseHR} BPM` : '--'}
                                            </div>
                                            <span className="text-[9px] text-slate-400 block mt-0.5">
                                                Resting Pulse
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                                <Wind className="h-3.5 w-3.5 text-purple-600" /> Normal Breathing
                                            </div>
                                            <div className="text-base font-bold tracking-tight text-slate-900 mt-1">
                                                {baseRR ? `${baseRR} BPM` : '--'}
                                            </div>
                                            <span className="text-[9px] text-slate-400 block mt-0.5">
                                                Resting Respiration
                                            </span>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                                                <Droplets className="h-3.5 w-3.5 text-emerald-600" /> Normal Oxygen
                                            </div>
                                            <div className="text-base font-bold tracking-tight text-slate-900 mt-1">
                                                {baseSpO2 ? `${baseSpO2}%` : '--'}
                                            </div>
                                            <span className="text-[9px] text-slate-400 block mt-0.5">
                                                Blood Oxygenation
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enclosure & Collar Hardware Info Footer */}
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span className="font-medium text-slate-600">
                                    {selectedAnimal.herd || 'Main Herd'} {selectedAnimal.pen ? `• ${selectedAnimal.pen}` : ''}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                    Collar: {selectedAnimal.collarId || selectedAnimal.deviceId || selectedAnimal._id.substring(0, 8)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Telemetry & Deviation Gauges */}
                    <div className="lg:col-span-8">
                        <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-2xs h-full flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <div>
                                        <h3 className="text-lg font-bold tracking-tight text-slate-900 m-0 font-display">
                                            Live Collar Vitals & Differences
                                        </h3>
                                        <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                                            Comparing live collar readings against learned normal vitals
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                                            <Radio className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
                                            <span>Telemetry Cycle: <strong className="text-slate-900">3s Interval</strong></span>
                                        </div>
                                        <span className={`text-[11px] px-3 py-1 rounded-full font-bold tracking-wider uppercase border ${
                                            hasLiveSignal 
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                                                : 'bg-amber-50 text-amber-700 border-amber-200/80'
                                        }`}>
                                            {hasLiveSignal ? 'Live Telemetry Active' : 'Waiting for Collar Signal'}
                                        </span>
                                    </div>
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
                            </div>

                            {/* 6-Axis Behavioral & Sensor Contact Quality Telemetry */}
                            <div className="mt-5 p-4 rounded-2xl bg-linear-to-r from-slate-50 via-teal-50/40 to-slate-50 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <Activity className="h-3 w-3 text-teal-600" /> Rumination
                                    </span>
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${healthSummary?.currentMetrics?.rumination ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        {healthSummary?.currentMetrics?.rumination ? 'Active' : 'Resting'}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">Jaw Movement</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3 text-amber-600" /> Agitation
                                    </span>
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${healthSummary?.currentMetrics?.headShaking ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                        {healthSummary?.currentMetrics?.headShaking ? 'Alert' : 'Calm / Normal'}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">Head Movement</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <Compass className="h-3 w-3 text-blue-600" /> Posture
                                    </span>
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        {healthSummary?.currentMetrics?.posture 
                                            ? (healthSummary.currentMetrics.posture === 'lying_down' ? 'Lying Down' : 'Standing')
                                            : (healthSummary?.currentMetrics?.motion ? 'Walking' : 'Standing')}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">Body Position</span>
                                </div>

                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                        <ShieldCheck className="h-3 w-3 text-emerald-600" /> Optical Sensor
                                    </span>
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <span className={`h-2 w-2 rounded-full ${healthSummary?.currentMetrics?.sensorStatus === 'occluded' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                        {healthSummary?.currentMetrics?.sensorStatus === 'occluded' ? 'Adjust Collar' : 'OPTIMAL'}
                                    </div>
                                    <span className="text-[9px] text-slate-400 block">Skin Contact</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full-Width Cumulative Active Alerts Overview (Displayed dynamically when alerts exist) */}
                    {healthSummary?.alerts && healthSummary.alerts.length > 0 && (() => {
                        const uniqueAlerts = Array.from(new Set(healthSummary.alerts));
                        if (uniqueAlerts.length === 0) return null;

                        const vitalAlerts = uniqueAlerts.filter(a => 
                            /temperature|heart rate|respiratory|oxygen|battery|fever|tachycardia|tachypnea/i.test(a)
                        );
                        const contagionAlerts = uniqueAlerts.filter(a => 
                            /contagion|epidemiology|exposure|cross-infection/i.test(a)
                        );
                        const otherAlerts = uniqueAlerts.filter(a => 
                            !vitalAlerts.includes(a) && !contagionAlerts.includes(a)
                        );

                        return (
                            <div className="lg:col-span-12">
                                <div className="bg-rose-50/70 border border-rose-200/90 p-5 rounded-2xl space-y-4 shadow-2xs">
                                    <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-rose-200/70">
                                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-800">
                                            <Zap className="h-4 w-4 text-rose-600 shrink-0" />
                                            <span>Cumulative Alerts Overview</span>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-200/80 text-rose-900 font-mono">
                                                {uniqueAlerts.length} Total
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowAlertDetails(!showAlertDetails)}
                                            className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 transition flex items-center gap-1 cursor-pointer"
                                        >
                                            {showAlertDetails ? 'Show Summary View' : 'Show Detailed List'}
                                        </button>
                                    </div>

                                    {showAlertDetails ? (
                                        /* Scrollable detailed list capped at max-h-56 so it never balloons the page */
                                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                            {uniqueAlerts.map((alt, idx) => (
                                                <div key={idx} className="bg-white p-3 rounded-xl border border-rose-200/80 text-xs text-slate-800 flex items-start gap-2.5 shadow-2xs">
                                                    <span className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                                    <span className="leading-relaxed">{alt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        /* Clean 2-Card Cumulative Summary */
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Card A: Physiological Vitals Summary */}
                                            {vitalAlerts.length > 0 && (
                                                <div className="bg-white p-4 rounded-xl border border-rose-200/90 space-y-2.5 shadow-2xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Thermometer className="h-3.5 w-3.5 text-rose-600" />
                                                            <span>Vital Sign Deviations</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                                                            {vitalAlerts.length} {vitalAlerts.length === 1 ? 'Parameter' : 'Parameters'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {vitalAlerts.map((va, idx) => {
                                                            const cleanText = va.replace(/^(CRITICAL|WARNING):\s*/i, '');
                                                            return (
                                                                <div key={idx} className="text-xs bg-rose-50/50 border border-rose-100 p-2 rounded-lg text-slate-800 font-medium">
                                                                    <span>{cleanText}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Card B: Herd Contagion Summary */}
                                            {contagionAlerts.length > 0 && (
                                                <div className="bg-white p-4 rounded-xl border border-amber-200/90 space-y-2.5 shadow-2xs">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                                            <Users className="h-3.5 w-3.5 text-amber-600" />
                                                            <span>Herd Contagion Exposure</span>
                                                        </span>
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                            {contagionAlerts.length} {contagionAlerts.length === 1 ? 'Animal' : 'Animals'}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-700 leading-relaxed m-0">
                                                        Direct exposure detected from <strong>{contagionAlerts.length} sick animals</strong> sharing the same herd or enclosure.
                                                    </p>

                                                    <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 font-medium">
                                                        Action: Pen separation or temporary quarantine recommended to prevent herd transmission.
                                                    </div>
                                                </div>
                                            )}

                                            {/* Card C: Other Alerts if any */}
                                            {otherAlerts.length > 0 && (
                                                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 col-span-full">
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                                                        Additional Notifications
                                                    </span>
                                                    {otherAlerts.map((oa, idx) => (
                                                        <p key={idx} className="text-xs text-slate-700 m-0">{oa}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

                    {/* Full-Width Grounded Clinical Veterinary Assessment Card */}
                    <div className="lg:col-span-12">
                        <ClinicalAssessmentCard 
                            animalId={selectedAnimal._id} 
                            animalName={selectedAnimal.name} 
                        />
                    </div>

                    {/* Historical Vital Trends & Baseline Deviation Curves (24 Hours vs 7 Days) */}
                    <div className="lg:col-span-12">
                        <HistoricalTrendsCard 
                            animal={selectedAnimal}
                            currentTemp={currentTemp}
                            currentHR={currentHR}
                            baseTemp={baseTemp}
                            baseHR={baseHR}
                        />
                    </div>

                    {/* Clinical Action & Treatment Intervention Log */}
                    <div className="lg:col-span-12">
                        <ClinicalTreatmentLogCard 
                            animal={selectedAnimal}
                            healthStatus={healthSummary?.status}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
