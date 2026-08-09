import React from 'react';
import { MapPin, Cpu, Signal, Lock } from 'lucide-react';

export const GeofenceMonitor: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                        <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">GPS Perimeter &amp; Geofence Guard</h2>
                        <p className="text-xs text-slate-500 font-normal m-0">Real-time pasture boundary monitoring &amp; escape prevention</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
                    Coming Soon
                </span>
            </div>

            {/* Coming Soon Card */}
            <div className="bento-card bg-white border border-slate-200/90 overflow-hidden">
                {/* Top accent strip */}
                <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400" />

                <div className="p-10 sm:p-14 flex flex-col items-center text-center gap-6">
                    {/* Icon cluster */}
                    <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                            <MapPin className="h-9 w-9 text-indigo-400" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <Lock className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                    </div>

                    <div className="space-y-2 max-w-md">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight m-0">
                            GPS Hardware Required
                        </h3>
                        <p className="text-sm text-slate-500 font-normal leading-relaxed m-0">
                            This feature requires GPS-enabled collar hardware to transmit real-time coordinates.
                            Once collars with GPS support are paired, live location tracking, perimeter alerts,
                            and escape detection will activate automatically here.
                        </p>
                    </div>

                    {/* What will be available */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl mt-2">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-2xs">
                                <MapPin className="h-4 w-4 text-indigo-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 m-0">Live Location</p>
                            <p className="text-[11px] text-slate-400 font-normal m-0">Real GPS coordinates per animal, updated every few seconds</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-2xs">
                                <Signal className="h-4 w-4 text-emerald-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 m-0">Perimeter Guard</p>
                            <p className="text-[11px] text-slate-400 font-normal m-0">Configurable safe radius with instant breach alerts</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-2">
                            <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto shadow-2xs">
                                <Cpu className="h-4 w-4 text-amber-500" />
                            </div>
                            <p className="text-xs font-bold text-slate-700 m-0">Escape Detection</p>
                            <p className="text-[11px] text-slate-400 font-normal m-0">Automatic alerts when animals leave the designated zone</p>
                        </div>
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium mt-2">
                        No data is displayed here until GPS-capable collar hardware is connected and transmitting.
                    </p>
                </div>
            </div>
        </div>
    );
};
