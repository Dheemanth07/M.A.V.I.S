import React, { useState } from 'react';
import type { Animal } from '../../shared/types';
import { MapPin, ShieldAlert, Compass, Navigation } from 'lucide-react';

interface GeofenceMonitorProps {
    animals: Animal[];
}

export const GeofenceMonitor: React.FC<GeofenceMonitorProps> = ({ animals }) => {
    const [safeRadius, setSafeRadius] = useState<number>(500); // meters
    const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

    return (
        <div className="bento-card p-6 bg-white space-y-5 border border-slate-200/90">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-slate-900 m-0">GPS Perimeter & Interactive Radar Map</h3>
                        <p className="text-xs text-slate-500 font-normal m-0">Real-time GPS coordinates, zone boundary visualization, & escape prevention</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                        <button
                            onClick={() => setActiveTab('map')}
                            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'map' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Radar Map
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${activeTab === 'list' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Node List
                        </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                        <span>Perimeter:</span>
                        <select
                            value={safeRadius}
                            onChange={(e) => setSafeRadius(Number(e.target.value))}
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                        >
                            <option value={200}>200m (Small Pen)</option>
                            <option value={500}>500m (Main Pasture)</option>
                            <option value={1000}>1000m (Open Range)</option>
                        </select>
                    </div>
                </div>
            </div>

            {activeTab === 'map' ? (
                <div className="relative bg-slate-900 rounded-2xl p-6 border border-slate-800 text-white overflow-hidden h-72 flex flex-col items-center justify-center">
                    {/* SVG Radar Map Grid */}
                    <svg className="absolute inset-0 w-full h-full opacity-30" pointerEvents="none">
                        <circle cx="50%" cy="50%" r="35%" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="4 4" />
                        <circle cx="50%" cy="50%" r="20%" fill="none" stroke="#6366f1" strokeWidth="1" />
                        <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#334155" strokeWidth="1" />
                        <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#334155" strokeWidth="1" />
                    </svg>

                    <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                        <Compass className="h-4 w-4 animate-spin text-emerald-400" />
                        <span>GPS Satellite Lock: 12.9716° N, 77.5946° E</span>
                    </div>

                    <div className="absolute top-4 right-4 text-[11px] font-mono text-slate-400">
                        Pasture Zone: <strong className="text-white font-semibold">Active Mesh (500m)</strong>
                    </div>

                    {/* Nodes overlay on radar map */}
                    <div className="relative z-10 w-full max-w-lg h-full flex items-center justify-center">
                        <div className="absolute h-44 w-44 rounded-full border-2 border-dashed border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-mono text-emerald-400 bg-slate-950/80 px-2 py-0.5 rounded-md">Geofence Boundary ({safeRadius}m)</span>
                        </div>

                        {/* Subject Pins */}
                        {animals.slice(0, 4).map((a, i) => {
                            const isOut = i === 3;
                            const offsets = [
                                { top: '35%', left: '42%' },
                                { top: '55%', left: '58%' },
                                { top: '48%', left: '38%' },
                                { top: '15%', left: '80%' }, // Breached node
                            ];
                            const pos = offsets[i % offsets.length];

                            return (
                                <div key={a._id} style={{ position: 'absolute', ...pos }} className="flex flex-col items-center group cursor-pointer">
                                    <div className={`p-1.5 rounded-full shadow-lg transition-transform duration-300 group-hover:scale-125 ${isOut ? 'bg-rose-500 text-white animate-bounce ring-4 ring-rose-500/40' : 'bg-emerald-500 text-slate-950'}`}>
                                        <Navigation className="h-3.5 w-3.5" />
                                    </div>
                                    <span className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-md shadow-xs whitespace-nowrap ${isOut ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 border border-slate-700'}`}>
                                        {a.name} {isOut ? '⚠ BREACH' : ''}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    {animals.slice(0, 3).map((animal, i) => {
                        const simulatedDistance = i === 2 ? 540 : 120 + i * 80;
                        const isBreached = simulatedDistance > safeRadius;

                        return (
                            <div key={animal._id} className={`p-4 rounded-2xl border transition ${isBreached ? 'bg-rose-50/50 border-rose-200' : 'bg-slate-50 border-slate-200/80'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm text-slate-900">{animal.name}</span>
                                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${isBreached ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
                                        {isBreached ? 'PERIMETER BREACH' : 'IN SAFE ZONE'}
                                    </span>
                                </div>

                                <div className="space-y-1 text-xs text-slate-600 font-normal">
                                    <div className="flex items-center justify-between">
                                        <span>Distance from Barn:</span>
                                        <strong className={isBreached ? 'text-rose-600 font-bold' : 'text-slate-900 font-semibold'}>{simulatedDistance}m</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                        <span>GPS Fix:</span>
                                        <span>12.9716° N, 77.5946° E</span>
                                    </div>
                                </div>

                                {isBreached && (
                                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold bg-rose-100/80 p-2 rounded-xl">
                                        <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
                                        <span>Alert broadcasted to owner dashboard!</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
