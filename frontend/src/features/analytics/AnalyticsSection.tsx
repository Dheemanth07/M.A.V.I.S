import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
    PieChart, Pie
} from 'recharts';
import type { Animal, HealthStatusResponse } from '../../shared/types';
import { fetchHealthStatus } from '../../shared/services/api';
import {
    BarChart3, PieChart as PieIcon, Activity,
    TrendingUp, Heart, Thermometer, ShieldCheck, AlertCircle, RefreshCw
} from 'lucide-react';

interface AnalyticsSectionProps {
    animals: Animal[];
}

type MetricMode = 'risk' | 'tempDev' | 'hrDev';

// Derives a 0–100 risk score purely from actual live deviations returned by the API
function computeRiskScore(deviations: HealthStatusResponse['deviations'], healthStatus: Animal['healthStatus']): number {
    if (!deviations) {
        if (healthStatus === 'critical') return 80;
        if (healthStatus === 'warning') return 40;
        return 10;
    }
    const tempPoints = Math.min(Math.abs(deviations.temperature) * 30, 50);
    const hrPoints   = Math.min(Math.abs(deviations.heartRate)   *  1, 30);
    const rrPoints   = Math.min(Math.abs(deviations.respiratoryRate) * 1.5, 20);
    return Math.min(Math.round(tempPoints + hrPoints + rrPoints), 100);
}

// Curated balanced professional palette: medium-chroma, vibrant, neither too dark nor too light
const ANIMAL_BAR_PALETTE = [
    '#0d9488', // Balanced Teal
    '#6366f1', // Modern Indigo
    '#f43f5e', // Vibrant Rose/Coral
    '#0284c7', // Clean Sky Blue
    '#8b5cf6', // Soft Violet
    '#f97316', // Warm Tangerine
    '#06b6d4', // Clean Cyan
    '#ec4899', // Balanced Pink
    '#10b981', // Fresh Emerald
    '#3b82f6', // Balanced Royal Blue
    '#d946ef', // Balanced Fuchsia
    '#eab308', // Balanced Warm Gold
    '#14b8a6', // Mint Teal
    '#a855f7', // Balanced Purple
    '#fb7185', // Soft Crimson
    '#38bdf8', // Azure Sky
    '#84cc16', // Fresh Lime
    '#f59e0b', // Balanced Amber
    '#60a5fa', // Medium Blue
    '#c084fc', // Lavender Violet
];

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ animals }) => {
    const [selectedMetric, setSelectedMetric] = useState<MetricMode>('risk');
    const [healthMap, setHealthMap] = useState<Record<string, HealthStatusResponse>>({});
    const [loading, setLoading] = useState(false);

    const loadAllVitals = () => {
        if (animals.length === 0) return;
        setLoading(true);
        Promise.allSettled(animals.map(a => fetchHealthStatus(a._id)))
            .then(results => {
                const map: Record<string, HealthStatusResponse> = {};
                results.forEach((result, idx) => {
                    if (result.status === 'fulfilled') {
                        map[animals[idx]._id] = result.value;
                    }
                });
                setHealthMap(map);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadAllVitals();
    }, [animals]);

    // Group counts for Pie Chart
    const healthCounts = { healthy: 0, warning: 0, critical: 0 };
    animals.forEach(a => {
        const status = a.healthStatus || 'healthy';
        if (healthCounts[status] !== undefined) healthCounts[status]++;
    });

    const pieData = [
        { name: 'Healthy (Normal)', value: healthCounts.healthy, color: '#10b981' },
        { name: 'Needs Attention',  value: healthCounts.warning,  color: '#f59e0b' },
        { name: 'Critical Issue',   value: healthCounts.critical, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Bar chart data with distinct non-repeating colors per animal
    const barData = animals.map((a, index) => {
        const health = healthMap[a._id];
        const deviations = health?.deviations;

        const tempDev = deviations ? Math.abs(deviations.temperature) : 0;
        const hrDev   = deviations ? Math.abs(deviations.heartRate) : 0;
        const riskScore = computeRiskScore(deviations, a.healthStatus);

        const liveStatus = health?.status ?? a.healthStatus;
        let statusLabel = 'Normal (Healthy)';
        if (liveStatus === 'critical') {
            statusLabel = 'Critical Issue';
        } else if (liveStatus === 'warning') {
            statusLabel = 'Needs Attention';
        }

        const barColor = ANIMAL_BAR_PALETTE[index % ANIMAL_BAR_PALETTE.length];
        const cleanName = a.name.split(' ')[0] || a.name;

        return {
            fullName: a.name,
            breed: a.breed || 'Standard',
            name: cleanName,
            statusLabel,
            riskScore,
            tempDev: parseFloat(tempDev.toFixed(2)),
            hrDev: Math.round(hrDev),
            value: selectedMetric === 'risk' ? riskScore : selectedMetric === 'tempDev' ? parseFloat(tempDev.toFixed(2)) : Math.round(hrDev),
            barColor,
            hasLiveData: !!deviations,
        };
    });

    const metricConfig = {
        risk: {
            title: 'Health Risk Level (%)',
            subtitle: 'Calculated from live temperature, heart rate & breathing deviations (0–100%)',
            unit: '%',
            threshold: 50,
            thresholdLabel: 'Action Line (50%)',
            domain: [0, 100] as [number, number],
        },
        tempDev: {
            title: 'Temperature Difference (°C)',
            subtitle: 'How much the current temperature differs from each animal\'s normal baseline',
            unit: '°C',
            threshold: 1.0,
            thresholdLabel: 'Fever Line (+1.0°C)',
            domain: [0, 3] as [number, number],
        },
        hrDev: {
            title: 'Heart Rate Change (BPM)',
            subtitle: 'Extra beats per minute above each animal\'s normal resting pulse',
            unit: ' BPM',
            threshold: 20,
            thresholdLabel: 'Fast Pulse Line (+20 BPM)',
            domain: [0, 50] as [number, number],
        }
    }[selectedMetric];

    // Real mathematical calculations for Herd Averages & Ranges
    let totalTemp = 0;
    let totalHR = 0;
    let minTemp = 999;
    let maxTemp = 0;
    let minHR = 999;
    let maxHR = 0;
    let feverCount = 0;
    let highHRCount = 0;
    let lowO2Count = 0;

    animals.forEach(a => {
        const health = healthMap[a._id];
        const metrics = health?.currentMetrics;
        const dev = health?.deviations;

        const temp = metrics?.temperature ?? a.baselines?.temperature ?? 38.5;
        const hr = metrics?.heartRate ?? a.baselines?.heartRate ?? 70;
        const spo2 = metrics?.bloodOxygen ?? a.baselines?.bloodOxygen ?? 98;

        totalTemp += temp;
        totalHR += hr;

        if (temp < minTemp) minTemp = temp;
        if (temp > maxTemp) maxTemp = temp;
        if (hr < minHR) minHR = hr;
        if (hr > maxHR) maxHR = hr;

        if (dev && dev.temperature >= 0.8) feverCount++;
        if (dev && dev.heartRate >= 15) highHRCount++;
        if (spo2 < 92) lowO2Count++;
    });

    const animalCount = animals.length || 1;
    const avgTemp = (totalTemp / animalCount).toFixed(1);
    const avgHR = Math.round(totalHR / animalCount);
    const stablePercentage = Math.round((healthCounts.healthy / animalCount) * 100);

    // Group animals by species for clean group comparison
    const speciesGroups: Record<string, { total: number; healthy: number; critical: number; temps: number[] }> = {};
    animals.forEach(a => {
        const spec = a.species || 'Other';
        if (!speciesGroups[spec]) {
            speciesGroups[spec] = { total: 0, healthy: 0, critical: 0, temps: [] };
        }
        speciesGroups[spec].total++;
        if (a.healthStatus === 'healthy' || !a.healthStatus) speciesGroups[spec].healthy++;
        if (a.healthStatus === 'critical') speciesGroups[spec].critical++;

        const health = healthMap[a._id];
        const temp = health?.currentMetrics?.temperature ?? a.baselines?.temperature ?? 38.5;
        speciesGroups[spec].temps.push(temp);
    });

    const minChartWidth = Math.max(500, barData.length * 65);



    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Overview Banner */}
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                            <Activity className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0 font-display">
                            Herd Health Analytics &amp; Trends
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 font-normal m-0 mt-1">
                        Compare health patterns, vital changes, and issue summaries across all your animals
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="text-xs text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-full font-semibold border border-slate-200">
                        Total Animals: <span className="font-bold text-slate-900">{animals.length}</span>
                    </div>
                    <button
                        onClick={loadAllVitals}
                        disabled={loading}
                        className="h-8 px-3 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                        title="Refresh Analytics Data"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Row 1: Interactive Bar Chart & Donut Summary (Horizontally Aligned Equal Height) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left Column (8 cols): Bar Chart */}
                <div className="lg:col-span-8 bento-card p-6 bg-white flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                                        {metricConfig.title}
                                    </h3>
                                    <p className="text-xs text-slate-500 m-0">
                                        {metricConfig.subtitle}
                                    </p>
                                </div>
                            </div>

                            {/* Metric Mode Toggle */}
                            <div className="inline-flex rounded-full bg-slate-100 p-1 border border-slate-200/80 shrink-0 self-start sm:self-auto text-xs">
                                <button
                                    onClick={() => setSelectedMetric('risk')}
                                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                                        selectedMetric === 'risk' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Risk Score (%)
                                </button>
                                <button
                                    onClick={() => setSelectedMetric('tempDev')}
                                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                                        selectedMetric === 'tempDev' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Temp Change (°C)
                                </button>
                                <button
                                    onClick={() => setSelectedMetric('hrDev')}
                                    className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                                        selectedMetric === 'hrDev' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    Heart Rate Change
                                </button>
                            </div>
                        </div>

                        {/* Chart Container */}
                        <div className="overflow-x-auto pt-1">
                            <div style={{ minWidth: `${minChartWidth}px`, height: '240px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ top: 20, right: 20, left: -10, bottom: 25 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                                            tickLine={false}
                                            axisLine={{ stroke: '#e2e8f0' }}
                                            interval={0}
                                        />
                                        <YAxis
                                            domain={metricConfig.domain}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={false}
                                            unit={selectedMetric === 'risk' ? '%' : ''}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
                                                            <div className="font-bold text-sm text-slate-100">{data.fullName}</div>
                                                            <div className="text-[11px] text-slate-400">{data.breed}</div>
                                                            <div className="pt-1 border-t border-slate-700 flex items-center justify-between gap-4">
                                                                <span className="text-slate-300">Status:</span>
                                                                <span className="font-semibold text-slate-100">{data.statusLabel}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-4">
                                                                <span className="text-slate-300">Measured:</span>
                                                                <span className="font-bold font-mono text-teal-400">
                                                                    {data.value}{metricConfig.unit}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <ReferenceLine
                                            y={metricConfig.threshold}
                                            stroke="#ef4444"
                                            strokeDasharray="4 4"
                                            label={{
                                                value: metricConfig.thresholdLabel,
                                                fill: '#ef4444',
                                                fontSize: 10,
                                                fontWeight: 700,
                                                position: 'top'
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                                            {barData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.barColor} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Chart Legend */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500 flex-wrap gap-2">
                        <div className="flex items-center gap-3 flex-wrap text-[11px] font-semibold">
                            <span className="flex items-center gap-1.5 text-slate-600">
                                <span className="h-2 w-2 rounded-full bg-teal-600" />
                                <span>Distinct Color per Animal</span>
                            </span>
                            <span className="flex items-center gap-1.5 text-rose-600">
                                <span className="w-3.5 h-0.5 border-t-2 border-dashed border-rose-500" />
                                <span>{metricConfig.thresholdLabel}</span>
                            </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                            {animals.length} Animals Tracked
                        </span>
                    </div>
                </div>

                {/* Right Column (4 cols): Donut Summary */}
                <div className="lg:col-span-4 bento-card p-6 bg-white flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                                <PieIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                                    Herd Health Summary
                                </h3>
                                <p className="text-xs text-slate-500 m-0">
                                    Breakdown of healthy vs animals needing care
                                </p>
                            </div>
                        </div>

                        {/* Donut Chart with Dynamic Center Display */}
                        <div className="h-52 w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={56}
                                        outerRadius={78}
                                        paddingAngle={4}
                                        dataKey="value"
                                        cursor="pointer"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center Donut Metric Overlay (Represents Entire Chart) */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                                <span className="text-3xl font-bold font-mono text-slate-900 leading-none">
                                    {animals.length}
                                </span>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                                    Total Animals
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown Pills with Exact Counts & Percentages */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 transition hover:scale-102">
                                <div className="text-[11px] font-bold text-emerald-800">Healthy</div>
                                <div className="text-base font-bold text-emerald-700 font-mono mt-0.5">{healthCounts.healthy}</div>
                                <div className="text-[10px] text-emerald-600 font-semibold">{Math.round((healthCounts.healthy / animalCount) * 100)}%</div>
                            </div>
                            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 transition hover:scale-102">
                                <div className="text-[11px] font-bold text-amber-800">Watch</div>
                                <div className="text-base font-bold text-amber-700 font-mono mt-0.5">{healthCounts.warning}</div>
                                <div className="text-[10px] text-amber-600 font-semibold">{Math.round((healthCounts.warning / animalCount) * 100)}%</div>
                            </div>
                            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-2.5 transition hover:scale-102">
                                <div className="text-[11px] font-bold text-rose-800">Critical</div>
                                <div className="text-base font-bold text-rose-700 font-mono mt-0.5">{healthCounts.critical}</div>
                                <div className="text-[10px] text-rose-600 font-semibold">{Math.round((healthCounts.critical / animalCount) * 100)}%</div>
                            </div>
                        </div>

                        {/* 1-Line Dynamic Herd Health Note */}
                        <div className="text-[11px] text-center text-slate-500 font-medium pt-1">
                            {healthCounts.critical > 0 
                                ? `${healthCounts.critical} animal(s) require prompt clinical observation.`
                                : healthCounts.warning > 0 
                                ? `${healthCounts.warning} animal(s) displaying subclinical vital shifts.`
                                : 'All animals are operating at baseline stability.'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Herd Vital Benchmarks & Most Common Issues (Horizontally Aligned Equal Height) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left (7 cols): Herd Vital Benchmarks */}
                <div className="lg:col-span-7 bento-card p-6 bg-white flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                                    Herd Vital Benchmarks &amp; Averages
                                </h3>
                                <p className="text-xs text-slate-500 m-0">
                                    Typical ranges and herd-wide averages recorded from collar sensors
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                            {/* Temperature Card */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                                        <span>Body Temp</span>
                                    </span>
                                    <span>Avg: {avgTemp}°C</span>
                                </div>
                                <div className="text-xl font-bold font-mono text-slate-900 my-1">
                                    {minTemp === 999 ? '38.5' : minTemp.toFixed(1)}° – {maxTemp === 0 ? '38.5' : maxTemp.toFixed(1)}°C
                                </div>
                                <p className="text-[11px] text-slate-400 m-0 font-normal">
                                    Normal baseline: ~38.5°C
                                </p>
                            </div>

                            {/* Heart Rate Card */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <Heart className="h-3.5 w-3.5 text-rose-500" />
                                        <span>Heart Rate</span>
                                    </span>
                                    <span>Avg: {avgHR} BPM</span>
                                </div>
                                <div className="text-xl font-bold font-mono text-slate-900 my-1">
                                    {minHR === 999 ? '70' : minHR} – {maxHR === 0 ? '70' : maxHR} BPM
                                </div>
                                <p className="text-[11px] text-slate-400 m-0 font-normal">
                                    Normal resting: ~70 BPM
                                </p>
                            </div>

                            {/* Herd Stability Score */}
                            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2 flex flex-col justify-between">
                                <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Herd Stability</span>
                                    </span>
                                    <span>{stablePercentage}%</span>
                                </div>
                                <div className="text-xl font-bold font-mono text-emerald-700 my-1">
                                    {healthCounts.healthy} of {animals.length} Stable
                                </div>
                                <p className="text-[11px] text-emerald-800/80 m-0 font-normal">
                                    Operating within normal bounds
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right (5 cols): Most Common Health Issues Today */}
                <div className="lg:col-span-5 bento-card p-6 bg-white flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                                <AlertCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                                    Common Issues Detected
                                </h3>
                                <p className="text-xs text-slate-500 m-0">
                                    Active physiological deviations across the group
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3.5 pt-1">
                            {/* Issue 1: Fever */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                    <span>Elevated Temperature (Fever / Heat)</span>
                                    <span className="font-bold text-rose-600">{feverCount} {feverCount === 1 ? 'animal' : 'animals'}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-rose-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((feverCount / animalCount) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Issue 2: Pulse Spike */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                    <span>Fast Heart Rate (Pulse Spike)</span>
                                    <span className="font-bold text-amber-600">{highHRCount} {highHRCount === 1 ? 'animal' : 'animals'}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((highHRCount / animalCount) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Issue 3: Low Blood Oxygen */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                    <span>Low Blood Oxygen (Breathing Strain)</span>
                                    <span className="font-bold text-blue-600">{lowO2Count} {lowO2Count === 1 ? 'animal' : 'animals'}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min((lowO2Count / animalCount) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                            Distribution
                        </span>
                    </div>
                </div>
            </div>

            {/* Row 3: Simple Group & Species Health Overview */}
            <div className="bento-card p-6 bg-white space-y-4">
                <div className="pb-3 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 m-0 font-display">
                        Species &amp; Group Comparison
                    </h3>
                    <p className="text-xs text-slate-500 m-0 mt-0.5">
                        Overview of health stability comparing different animal groups under your care
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                    {Object.entries(speciesGroups).map(([speciesName, groupData]) => {
                        const avgGroupTemp = (groupData.temps.reduce((a, b) => a + b, 0) / (groupData.temps.length || 1)).toFixed(1);
                        const hasIssues = groupData.critical > 0;

                        return (
                            <div
                                key={speciesName}
                                className={`p-4 rounded-2xl border flex flex-col justify-between h-full ${
                                    hasIssues ? 'bg-rose-50/40 border-rose-200/80' : 'bg-slate-50 border-slate-200/80'
                                } space-y-2.5`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-slate-900">{speciesName}</span>
                                    <span className="text-xs font-semibold text-slate-500">
                                        {groupData.total} {groupData.total === 1 ? 'subject' : 'subjects'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                                    <span>Average Temp:</span>
                                    <span className="font-bold font-mono text-slate-800">{avgGroupTemp}°C</span>
                                </div>

                                <div className="flex items-center justify-between text-xs pt-0.5">
                                    <span>Status:</span>
                                    <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                                        hasIssues ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        {groupData.healthy} Healthy{groupData.critical > 0 ? `, ${groupData.critical} Critical` : ''}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
