import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import type { Animal } from '../../shared/types';
import { BarChart3, PieChart as PieIcon, TrendingUp, Sparkles } from 'lucide-react';

interface AnalyticsSectionProps {
    animals: Animal[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ animals }) => {
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

    const finalPieData = pieData.length > 0 ? pieData : [
        { name: 'Healthy', value: 11, color: '#10b981' },
    ];

    const barData = animals.length > 0
        ? animals.map(a => ({
            name: a.name.length > 10 ? a.name.substring(0, 10) + '...' : a.name,
            Temperature: a.baselines?.temperature || 38.5,
            HeartRate: a.baselines?.heartRate || 72,
            RespiratoryRate: a.baselines?.respiratoryRate || 24,
        }))
        : [
            { name: 'Dog 1', Temperature: 38.2, HeartRate: 70, RespiratoryRate: 22 },
            { name: 'Dog 2', Temperature: 38.5, HeartRate: 75, RespiratoryRate: 25 },
            { name: 'Cat 1', Temperature: 39.1, HeartRate: 88, RespiratoryRate: 28 },
            { name: 'Dairy Cow', Temperature: 38.0, HeartRate: 68, RespiratoryRate: 20 },
        ];

    return (
        <div className="space-y-6">
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">Herd Health & Baseline Analytics</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-1 mb-0">Biometric telemetry trends and digital twin health risk distributions</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
                        Total Subjects: <span className="text-emerald-600 font-bold">{animals.length || 11}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bento-card p-6 flex flex-col justify-between bg-white">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                                    <BarChart3 className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold tracking-tight text-slate-900 m-0">Baseline Vitals Comparison</h3>
                                    <p className="text-xs text-slate-500 font-normal m-0">Learned Digital Twin baselines per subject</p>
                                </div>
                            </div>
                            <span className="text-[11px] font-semibold text-teal-600 flex items-center gap-1 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100 tracking-wider uppercase">
                                <TrendingUp className="h-3 w-3" /> Live Dynamic
                            </span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} fontWeight={500} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} fontWeight={500} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#0f172a' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '15px', fontSize: '12px', fontWeight: '500' }} />
                                <Bar dataKey="Temperature" fill="#0d6b5f" radius={[6, 6, 0, 0]} name="Temp (°C)" />
                                <Bar dataKey="HeartRate" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Heart Rate (BPM)" />
                                <Bar dataKey="RespiratoryRate" fill="#a855f7" radius={[6, 6, 0, 0]} name="Resp Rate" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between bg-white">
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <PieIcon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight text-slate-900 m-0">Herd Health Distribution</h3>
                                <p className="text-xs text-slate-500 font-normal m-0">Categorical risk segmentation across herd</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-[240px] w-full flex items-center justify-center relative">
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
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={3} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', color: '#0f172a' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2">
                        {finalPieData.map((item) => (
                            <div key={item.name} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-slate-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
