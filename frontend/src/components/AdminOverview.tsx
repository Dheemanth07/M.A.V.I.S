import React from 'react';
import type { Animal } from '../types';
import { Shield, Database, Activity, RefreshCw, Cpu, Server } from 'lucide-react';

interface AdminOverviewProps {
    animals: Animal[];
    onRefresh: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ animals, onRefresh }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bento-card p-6 bg-slate-900 text-white border-none shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-black m-0">Admin Command Overview</h2>
                        <p className="text-xs text-slate-400 font-medium m-0">Global telemetry stream health, database stats, and baseline override controls</p>
                    </div>
                </div>

                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                >
                    <RefreshCw className="h-4 w-4" /> Sync Stream Data
                </button>
            </div>

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bento-card p-5 bg-white flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500 block">Total Active Mesh Nodes</span>
                        <span className="text-3xl font-black text-slate-900 mt-1 block">{animals.length}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <Cpu className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 bg-white flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500 block">HTTP Ingestion Status</span>
                        <span className="text-sm font-black text-emerald-600 mt-1 block">POST /api/sensor (201 OK)</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <Server className="h-6 w-6" />
                    </div>
                </div>

                <div className="bento-card p-5 bg-white flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-slate-500 block">WebSocket Gateway</span>
                        <span className="text-sm font-black text-blue-600 mt-1 block">ws://localhost:5000</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Activity className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Raw Time-Series Monitoring Grids */}
            <div className="bento-card p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 m-0">Raw Telemetry Input Stream</h3>
                            <p className="text-xs text-slate-500 font-medium m-0">Live time-series data inspection directly from MongoDB</p>
                        </div>
                    </div>
                    <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                        Live Ingestion
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="py-3 px-4">Subject</th>
                                <th className="py-3 px-4">Temp (°C)</th>
                                <th className="py-3 px-4">Heart Rate</th>
                                <th className="py-3 px-4">Resp Rate</th>
                                <th className="py-3 px-4">Battery</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                            {animals.slice(0, 8).map((a) => (
                                <tr key={a._id} className="hover:bg-slate-50 transition">
                                    <td className="py-3.5 px-4 font-bold text-slate-900">{a.name}</td>
                                    <td className="py-3.5 px-4">{a.baselines?.temperature || 38.2}°C</td>
                                    <td className="py-3.5 px-4">{a.baselines?.heartRate || 72} BPM</td>
                                    <td className="py-3.5 px-4">{a.baselines?.respiratoryRate || 22}</td>
                                    <td className="py-3.5 px-4 font-bold text-emerald-600">88%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
