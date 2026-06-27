import React, { useState } from 'react';
import type { Animal } from '../../shared/types';
import { MapPin, ShieldAlert } from 'lucide-react';

interface GeofenceMonitorProps {
    animals: Animal[];
}

export const GeofenceMonitor: React.FC<GeofenceMonitorProps> = ({ animals }) => {
    const [safeRadius, setSafeRadius] = useState<number>(500); // meters

    return (
        <div className="bento-card p-6 bg-white space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight text-slate-900 m-0">GPS Perimeter & Geofence Guard</h3>
                        <p className="text-xs text-slate-500 font-normal m-0">Real-time pasture boundary simulation & escape prevention telemetry</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                    <span>Safe Radius:</span>
                    <select
                        value={safeRadius}
                        onChange={(e) => setSafeRadius(Number(e.target.value))}
                        className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
                    >
                        <option value={200}>200 meters (Small Pen)</option>
                        <option value={500}>500 meters (Farm Pasture)</option>
                        <option value={1000}>1000 meters (Open Range)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
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
        </div>
    );
};
