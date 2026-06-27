import React from 'react';
import { X, Thermometer, Heart, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { Animal } from '../../../shared/types';

interface VitalsModalProps {
    animal: Animal | null;
    onClose: () => void;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({ animal, onClose }) => {
    if (!animal) return null;

    const tempVal = animal.baselines?.temperature || 38.2;
    const trendData = [
        { time: '08:00 AM', temp: Number((tempVal - 0.2).toFixed(1)), heartRate: (animal.baselines?.heartRate || 72) - 2 },
        { time: '10:00 AM', temp: Number((tempVal).toFixed(1)), heartRate: (animal.baselines?.heartRate || 72) },
        { time: '12:00 PM', temp: Number((tempVal + 0.1).toFixed(1)), heartRate: (animal.baselines?.heartRate || 72) + 4 },
        { time: '02:00 PM', temp: Number((tempVal + 0.3).toFixed(1)), heartRate: (animal.baselines?.heartRate || 72) + 6 },
        { time: '04:00 PM', temp: Number((tempVal + 0.1).toFixed(1)), heartRate: (animal.baselines?.heartRate || 72) + 1 },
        { time: '06:00 PM', temp: Number((tempVal).toFixed(1)), heartRate: (animal.baselines?.heartRate || 72) - 1 },
    ];

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bento-card w-full max-w-2xl bg-white p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 m-0">{animal.name}'s Vitals Trend</h3>
                            <p className="text-xs text-slate-500 font-medium m-0">{animal.species} • {animal.breed || 'Standard'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                            <Thermometer className="h-4 w-4 text-emerald-600" /> Average Temperature
                        </div>
                        <div className="text-2xl font-black text-slate-900">{Number(tempVal).toFixed(1)}°C</div>
                        <div className="text-[11px] text-emerald-600 font-medium mt-1">Normal pattern confirmed</div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                            <Heart className="h-4 w-4 text-rose-500" /> Average Resting Heart Rate
                        </div>
                        <div className="text-2xl font-black text-slate-900">{animal.baselines?.heartRate || 72} BPM</div>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">Steady heart rhythm</div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Today's Body Temperature Trend (°C)</h4>
                    <div className="h-56 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    formatter={(val: any) => [`${Number(val).toFixed(1)}°C`, 'Temperature']}
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', color: '#0f172a' }}
                                />
                                <Area type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" name="Temperature (°C)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition cursor-pointer"
                    >
                        Close Summary
                    </button>
                </div>
            </div>
        </div>
    );
};
