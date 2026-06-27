import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import type { Animal } from '../types';
import { BarChart3, PieChart as PieIcon, TrendingUp, Sparkles } from 'lucide-react';

interface AnalyticsSectionProps {
    animals: Animal[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ animals }) => {
    // Calculate Pie Chart Data (Herd Health Distribution)
    const healthCounts = { healthy: 0, warning: 0, critical: 0 };
    animals.forEach(a => {
        const status = a.healthStatus || 'healthy';
        if (healthCounts[status] !== undefined) {
            healthCounts[status]++;
        }
    });

    const pieData = [
        { name: 'Healthy', value: healthCounts.healthy, color: '#10b981' },
        { name: 'Warning', value: healthCounts.warning, color: '#f59e0b' },
        { name: 'Critical', value: healthCounts.critical, color: '#ef4444' },
    ].filter(item => item.value > 0 || animals.length === 0);

    // If no real data yet, provide clean placeholder counts for demonstration
    const finalPieData = pieData.length > 0 ? pieData : [
        { name: 'Healthy', value: 8, color: '#10b981' },
        { name: 'Warning', value: 3, color: '#f59e0b' },
        { name: 'Critical', value: 1, color: '#ef4444' },
    ];

    // Calculate Bar Chart Data (Baseline Vitals Comparison per Animal)
    const barData = animals.length > 0
        ? animals.map(a => ({
            name: a.name.length > 10 ? a.name.substring(0, 10) + '...' : a.name,
            Temperature: a.baselines?.temperature || 38.5,
            HeartRate: a.baselines?.heartRate || 72,
            RespiratoryRate: a.baselines?.respiratoryRate || 24,
        }))
        : [
            { name: 'Cow 101', Temperature: 38.2, HeartRate: 70, RespiratoryRate: 22 },
            { name: 'Holstein #4', Temperature: 38.5, HeartRate: 75, RespiratoryRate: 25 },
            { name: 'Angus B2', Temperature: 39.1, HeartRate: 88, RespiratoryRate: 28 },
            { name: 'Dairy Queen', Temperature: 38.0, HeartRate: 68, RespiratoryRate: 20 },
        ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-teal-400" />
                        <h2 className="text-2xl font-extrabold tracking-tight text-white m-0">Herd Health & Baseline Analytics</h2>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 mb-0">Cross-sectional biometric telemetry and digital twin health risk distributions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700">
                        Total Subjects: <span className="text-teal-400 font-bold">{animals.length || 12}</span>
                    </div>
                </div>
            </div>

            {/* Bento Grid Analytics Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visualization 1: Bar Chart (Left Column - 7 cols) */}
                <div className="lg:col-span-7 mavis-card p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white m-0">Baseline Vitals Comparison</h3>
                                    <p className="text-xs text-slate-400 m-0">Learned Digital Twin baselines per subject</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                                <TrendingUp className="h-3.5 w-3.5 text-teal-400" /> Live Dynamic
                            </span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px' }} />
                                <Bar dataKey="Temperature" fill="#14b8a6" radius={[6, 6, 0, 0]} name="Temp (°C)" />
                                <Bar dataKey="HeartRate" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Heart Rate (BPM)" />
                                <Bar dataKey="RespiratoryRate" fill="#a855f7" radius={[6, 6, 0, 0]} name="Resp Rate" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visualization 2: Pie Chart (Right Column - 5 cols) */}
                <div className="lg:col-span-5 mavis-card p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <PieIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white m-0">Herd Health Distribution</h3>
                                <p className="text-xs text-slate-400 m-0">Categorical risk segmentation across herd</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[260px] w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={finalPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {finalPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={3} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend Badges */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {finalPieData.map((item) => (
                            <div key={item.name} className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                                </div>
                                <span className="text-base font-extrabold text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
