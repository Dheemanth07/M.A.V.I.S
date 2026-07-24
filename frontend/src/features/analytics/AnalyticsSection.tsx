import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    PieChart, Pie, Cell
} from 'recharts';
import type { Animal } from '../../shared/types';
import { BarChart3, PieChart as PieIcon, Sparkles, Download, FileSpreadsheet } from 'lucide-react';
import { exportAnimalsToCSV, exportAnimalsToJSON } from '../../shared/utils/exportUtils';
import { useToast } from '../../shared/context/ToastContext';

interface AnalyticsSectionProps {
    animals: Animal[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ animals }) => {
    const { showToast } = useToast();
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

    const handleExportCSV = () => {
        exportAnimalsToCSV(animals);
        showToast('Exported telemetry records as CSV file.', 'success');
    };

    const handleExportJSON = () => {
        exportAnimalsToJSON(animals);
        showToast('Exported telemetry stream as JSON dataset.', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">Herd Health & Baseline Analytics</h2>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-1 mb-0">Biometric telemetry trends and digital twin health risk distributions</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition border border-emerald-200 cursor-pointer shadow-2xs"
                    >
                        <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
                    </button>
                    <button
                        onClick={handleExportJSON}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer shadow-2xs"
                    >
                        <Download className="h-3.5 w-3.5" /> Export JSON
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bento-card p-6 flex flex-col justify-between bg-white border border-slate-200/90">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                            <h3 className="text-sm font-bold tracking-tight text-slate-900 m-0">Baseline Biometric Comparison</h3>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            Live Metrics
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                                <Bar dataKey="Temperature" fill="#10b981" radius={[4, 4, 0, 0]} name="Temp (°C)" />
                                <Bar dataKey="HeartRate" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Heart Rate (BPM)" />
                                <Bar dataKey="RespiratoryRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Resp Rate" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="lg:col-span-5 bento-card p-6 flex flex-col justify-between bg-white border border-slate-200/90">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <PieIcon className="h-5 w-5 text-emerald-600" />
                            <h3 className="text-sm font-bold tracking-tight text-slate-900 m-0">Health Risk Categorization</h3>
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                            Distribution
                        </span>
                    </div>

                    <div className="h-64 w-full flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={finalPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {finalPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
