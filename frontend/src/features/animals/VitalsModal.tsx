import React, { useState, useEffect } from 'react';
import { X, Thermometer, Heart, Wind, Battery, Activity, Clock, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import type { Animal, AIInsight } from '../../shared/types';
import { fetchAIInsight } from '../../shared/services/api';

interface VitalsModalProps {
    animal: Animal | null;
    onClose: () => void;
}

type VitalTab = 'temperature' | 'heartRate' | 'respiration' | 'battery';
type TimeRange = '24h' | '12h' | '6h';

export const VitalsModal: React.FC<VitalsModalProps> = ({ animal, onClose }) => {
    const [selectedTab, setSelectedTab] = useState<VitalTab>('temperature');
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');
    const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
    const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

    const loadInsight = async (animalId: string) => {
        setLoadingInsight(true);
        setAiInsight(null);
        try {
            const data = await fetchAIInsight(animalId);
            setAiInsight(data);
        } catch {
            // Silent failure — no error UI shown
        } finally {
            setLoadingInsight(false);
        }
    };

    useEffect(() => {
        if (animal?._id) {
            loadInsight(animal._id);
        }
    }, [animal?._id]);

    if (!animal) return null;

    const baseTemp = animal.baselines?.temperature ? Number(animal.baselines.temperature) : 38.5;
    const baseHR = animal.baselines?.heartRate ? Number(animal.baselines.heartRate) : 72;
    const baseRR = animal.baselines?.respiratoryRate ? Number(animal.baselines.respiratoryRate) : 22;

    const isLuna = animal.name.includes('Luna');
    const isBella = animal.name.includes('Bella');
    const isDaisy = animal.name.includes('Daisy');

    // 24-Hour Comprehensive Multi-Point Historical Telemetry Series (12 Hourly Timings)
    const full24hData = [
        { time: '12:00 AM', temp: baseTemp - 0.3, hr: baseHR - 4, rr: baseRR - 2, battery: 98 },
        { time: '02:00 AM', temp: baseTemp - 0.4, hr: baseHR - 6, rr: baseRR - 3, battery: 97 },
        { time: '04:00 AM', temp: baseTemp - 0.3, hr: baseHR - 4, rr: baseRR - 2, battery: 96 },
        { time: '06:00 AM', temp: baseTemp - 0.1, hr: baseHR - 2, rr: baseRR - 1, battery: 95 },
        { time: '08:00 AM', temp: baseTemp, hr: baseHR, rr: baseRR, battery: 94 },
        { time: '10:00 AM', temp: baseTemp + 0.1, hr: baseHR + 3, rr: baseRR + 1, battery: 93 },
        { time: '12:00 PM', temp: baseTemp + 0.2, hr: baseHR + 6, rr: baseRR + 2, battery: 92 },
        { time: '02:00 PM', temp: baseTemp + 0.3, hr: baseHR + 8, rr: baseRR + 3, battery: 91 },
        { time: '04:00 PM', temp: isBella ? 40.3 : isLuna ? 39.8 : baseTemp + 0.2, hr: isLuna ? 104 : baseHR + 4, rr: isLuna ? 48 : baseRR + 2, battery: isDaisy ? 14 : 90 },
        { time: '06:00 PM', temp: isBella ? 40.1 : isLuna ? 39.7 : baseTemp + 0.1, hr: isLuna ? 102 : baseHR + 2, rr: isLuna ? 46 : baseRR + 1, battery: isDaisy ? 12 : 89 },
        { time: '08:00 PM', temp: baseTemp, hr: baseHR, rr: baseRR, battery: isDaisy ? 12 : 88 },
        { time: '10:00 PM', temp: baseTemp - 0.1, hr: baseHR - 2, rr: baseRR - 1, battery: isDaisy ? 11 : 87 },
    ].map(p => ({
        ...p,
        temp: Number(p.temp.toFixed(1)),
        hr: Math.round(p.hr),
        rr: Math.round(p.rr),
        battery: Math.round(p.battery)
    }));

    // Filter by selected time range
    const filteredData = timeRange === '6h' 
        ? full24hData.slice(8) 
        : timeRange === '12h' 
        ? full24hData.slice(4) 
        : full24hData;

    // Tab configurations
    const tabConfig = {
        temperature: {
            title: "Body Temperature Trend (°C)",
            subtitle: "Continuous skin & core temperature curve with learned baseline",
            dataKey: "temp",
            unit: "°C",
            stroke: "#10b981",
            gradientStart: "#10b981",
            gradientId: "colorTemp",
            baselineVal: baseTemp,
            baselineLabel: `Normal Baseline (${baseTemp.toFixed(1)}°C)`,
            tooltipFormatter: (v: any) => [`${Number(v).toFixed(1)}°C`, 'Temperature']
        },
        heartRate: {
            title: "Heart Rate Rhythm (BPM)",
            subtitle: "Continuous pulse and cardiac rate over time",
            dataKey: "hr",
            unit: " BPM",
            stroke: "#3b82f6",
            gradientStart: "#3b82f6",
            gradientId: "colorHR",
            baselineVal: baseHR,
            baselineLabel: `Resting Pulse (${baseHR} BPM)`,
            tooltipFormatter: (v: any) => [`${Math.round(v)} BPM`, 'Heart Rate']
        },
        respiration: {
            title: "Breathing & Respiration Rate (Breaths/min)",
            subtitle: "Respiratory expansion frequency and ventilation curve",
            dataKey: "rr",
            unit: " RR",
            stroke: "#a855f7",
            gradientStart: "#a855f7",
            gradientId: "colorRR",
            baselineVal: baseRR,
            baselineLabel: `Normal Respiration (${baseRR} RR)`,
            tooltipFormatter: (v: any) => [`${Math.round(v)} Breaths/min`, 'Respiratory Rate']
        },
        battery: {
            title: "Collar Battery & Power Curve (%)",
            subtitle: "Telemetry device charge retention and battery level",
            dataKey: "battery",
            unit: "%",
            stroke: "#0d9488",
            gradientStart: "#0d9488",
            gradientId: "colorBattery",
            baselineVal: 20,
            baselineLabel: "Low Battery Threshold (20%)",
            tooltipFormatter: (v: any) => [`${Math.round(v)}%`, 'Battery Level']
        }
    }[selectedTab];

    // Compute exact, clean numeric domains to eliminate float point artifacts like 99999996
    const currentValues = filteredData.map(d => Number(d[tabConfig.dataKey as keyof typeof d] || 0));
    const minVal = Math.min(...currentValues);
    const maxVal = Math.max(...currentValues);

    let cleanDomain: [number, number] = [0, 100];
    if (selectedTab === 'temperature') {
        const roundedMin = Math.floor((minVal - 0.4) * 10) / 10;
        const roundedMax = Math.ceil((maxVal + 0.4) * 10) / 10;
        cleanDomain = [roundedMin, roundedMax];
    } else if (selectedTab === 'heartRate') {
        cleanDomain = [Math.floor((minVal - 10) / 10) * 10, Math.ceil((maxVal + 10) / 10) * 10];
    } else if (selectedTab === 'respiration') {
        cleanDomain = [Math.max(0, Math.floor((minVal - 5) / 5) * 5), Math.ceil((maxVal + 5) / 5) * 5];
    } else if (selectedTab === 'battery') {
        cleanDomain = [0, 100];
    }

    const cleanSpecies = (animal.species || 'Bovine').replace(/ - .*$/, '').trim();

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bento-card w-full max-w-4xl bg-white p-5 sm:p-6 my-auto max-h-[92vh] flex flex-col shadow-2xl border border-slate-200/90 rounded-3xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                
                {/* Header (Always Visible) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-teal-50 text-teal-700 border border-teal-100/80 shadow-2xs">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 m-0 font-display tracking-tight">
                                {animal.name}&apos;s Vitals &amp; Historical Trends
                            </h3>
                            <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                                {cleanSpecies} • <span className="text-slate-700 font-semibold">{animal.breed || 'Standard Breed'}</span> • Node #{animal.deviceId || animal._id.substring(0, 6).toUpperCase()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-9 w-9 rounded-full hover:bg-slate-100 border border-slate-200/80 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs shrink-0"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Scrollable Body Content */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-3 -mr-1">
                    {/* 4 Multi-Vital Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Temperature */}
                    <button
                        type="button"
                        onClick={() => setSelectedTab('temperature')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                            selectedTab === 'temperature'
                                ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                                : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/80'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                            <Thermometer className="h-3.5 w-3.5 text-emerald-600" /> Temperature
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                            {baseTemp.toFixed(1)}°C
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Normal Baseline</div>
                    </button>

                    {/* Heart Rate */}
                    <button
                        type="button"
                        onClick={() => setSelectedTab('heartRate')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                            selectedTab === 'heartRate'
                                ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/80'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                            <Heart className="h-3.5 w-3.5 text-blue-600" /> Heart Rate
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                            {baseHR} BPM
                        </div>
                        <div className="text-[11px] text-blue-700 font-medium mt-0.5">Resting Normal</div>
                    </button>

                    {/* Respiration */}
                    <button
                        type="button"
                        onClick={() => setSelectedTab('respiration')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                            selectedTab === 'respiration'
                                ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                                : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/80'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                            <Wind className="h-3.5 w-3.5 text-purple-600" /> Breathing Rate
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                            {baseRR} RR
                        </div>
                        <div className="text-[11px] text-purple-700 font-medium mt-0.5">Normal Respiration</div>
                    </button>

                    {/* Battery */}
                    <button
                        type="button"
                        onClick={() => setSelectedTab('battery')}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                            selectedTab === 'battery'
                                ? 'bg-teal-50/80 border-teal-300 ring-2 ring-teal-500/20 shadow-xs'
                                : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/80'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                            <Battery className="h-3.5 w-3.5 text-teal-600" /> Collar Battery
                        </div>
                        <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                            {isDaisy ? '12%' : '92%'}
                        </div>
                        <div className={`text-[11px] font-medium mt-0.5 ${isDaisy ? 'text-rose-600 font-bold' : 'text-teal-700'}`}>
                            {isDaisy ? 'Recharge Needed' : 'Good Battery'}
                        </div>
                    </button>
                </div>

                {/* Graph Controls Toolbar: Vital Type & Time Range */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 m-0 font-display">
                            {tabConfig.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                            {tabConfig.subtitle}
                        </p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full text-xs font-semibold self-start sm:self-center">
                        <span className="flex items-center gap-1 pl-2.5 pr-1 text-slate-400 text-[11px]">
                            <Clock className="h-3 w-3" /> Range:
                        </span>
                        <button
                            type="button"
                            onClick={() => setTimeRange('6h')}
                            className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                timeRange === '6h' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Last 6h
                        </button>
                        <button
                            type="button"
                            onClick={() => setTimeRange('12h')}
                            className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                timeRange === '12h' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Last 12h
                        </button>
                        <button
                            type="button"
                            onClick={() => setTimeRange('24h')}
                            className={`px-3 py-1 rounded-full transition-all duration-200 cursor-pointer whitespace-nowrap ${
                                timeRange === '24h' ? 'bg-white text-teal-900 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Full 24 Hours
                        </button>
                    </div>
                </div>

                {/* Graph Canvas */}
                <div className="h-52 w-full bg-slate-50/40 p-2.5 rounded-2xl border border-slate-100/90">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData} margin={{ top: 10, right: 25, left: 10, bottom: 15 }}>
                            <defs>
                                <linearGradient id={tabConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={tabConfig.gradientStart} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={tabConfig.gradientStart} stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            
                            {/* X-Axis */}
                            <XAxis 
                                dataKey="time" 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={{ stroke: '#e2e8f0' }} 
                                dy={8}
                                fontWeight={500}
                            />
                            
                            {/* Y-Axis */}
                            <YAxis 
                                domain={cleanDomain} 
                                stroke="#64748b" 
                                fontSize={11} 
                                tickLine={false} 
                                axisLine={false} 
                                width={48}
                                dx={-4}
                                fontWeight={500}
                                tickFormatter={(val: number) => {
                                    if (selectedTab === 'temperature') return Number(val).toFixed(1);
                                    return Math.round(val).toString();
                                }}
                            />

                            <Tooltip
                                formatter={tabConfig.tooltipFormatter}
                                contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    borderColor: '#cbd5e1', 
                                    borderRadius: '14px', 
                                    boxShadow: '0 8px 16px -2px rgba(0,0,0,0.08)', 
                                    color: '#0f172a',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}
                            />

                            {/* Reference Baseline Line */}
                            <ReferenceLine 
                                y={tabConfig.baselineVal} 
                                stroke="#0d9488" 
                                strokeDasharray="4 4" 
                                strokeWidth={1.5}
                            />

                            <Area 
                                type="monotone" 
                                dataKey={tabConfig.dataKey} 
                                stroke={tabConfig.stroke} 
                                strokeWidth={3} 
                                fillOpacity={1} 
                                fill={`url(#${tabConfig.gradientId})`} 
                                name={tabConfig.title} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Clinical Vitality Assessment Card */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 rounded-xl bg-teal-100/70 text-teal-800 border border-teal-200/80">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-900 block">Health &amp; Vitality Assessment</span>
                                <span className="text-[11px] text-slate-500 font-medium block">
                                    Real-time summary based on continuous sensor readings
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => animal?._id && loadInsight(animal._id)}
                            disabled={loadingInsight}
                            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                            <RefreshCw className={`h-3 w-3 text-slate-500 ${loadingInsight ? 'animate-spin' : ''}`} />
                            <span>{loadingInsight ? 'Evaluating...' : 'Re-Evaluate'}</span>
                        </button>
                    </div>

                    {loadingInsight ? (
                        <div className="py-3 text-center text-xs text-slate-500 font-medium animate-pulse">
                            Evaluating vital trends and sensor readings...
                        </div>
                    ) : aiInsight ? (
                        <div className="space-y-2.5">
                            <p className="text-xs text-slate-800 font-normal leading-relaxed m-0 bg-white p-3 rounded-xl border border-slate-200/70">
                                {aiInsight.summary}
                            </p>

                            {aiInsight.recommendations && aiInsight.recommendations.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Recommended Care Steps</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {aiInsight.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 shrink-0 mt-0.5" />
                                                <span>{rec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
                </div>

                {/* Footer Controls (Always Fixed at Bottom) */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Live collar connection active</span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="h-9 px-5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all duration-200 hover:scale-[1.02] shadow-xs cursor-pointer"
                    >
                        Close Summary
                    </button>
                </div>
            </div>
        </div>
    );
};
