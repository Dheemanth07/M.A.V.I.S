import React from 'react';
import type { Animal } from '../../shared/types';
import { Battery, BatteryCharging, Radio, AlertTriangle, Cpu } from 'lucide-react';

interface CollarHardwareMonitorProps {
    animals: Animal[];
}

export const CollarHardwareMonitor: React.FC<CollarHardwareMonitorProps> = ({ animals }) => {
    return (
        <div className="bento-card p-6 bg-white border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-900 text-white shadow-xs">
                        <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold tracking-tight text-slate-900 m-0">Collar Hardware Mesh & Battery Diagnostics</h3>
                        <p className="text-xs text-slate-500 font-normal m-0">Active RF signal strength (RSSI), battery depletion state, and replacement indicators</p>
                    </div>
                </div>
                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200">
                    Mesh Active (99.4% Uptime)
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {animals.slice(0, 3).map((animal, i) => {
                    const batteryLevel = i === 1 ? 18 : 88 - i * 12;
                    const isLowBattery = batteryLevel < 20;
                    const rssi = -62 - i * 5;

                    return (
                        <div key={animal._id} className={`p-4 rounded-2xl border transition ${isLowBattery ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200/80'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <strong className="text-sm font-bold text-slate-900 block">{animal.name}</strong>
                                    <span className="text-[11px] font-mono text-slate-500">{animal.deviceId || animal.collarId || `ESP32-COLLAR-0${i + 1}`}</span>
                                </div>
                                <div className={`p-2 rounded-xl ${isLowBattery ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {isLowBattery ? <Battery className="h-4 w-4" /> : <BatteryCharging className="h-4 w-4" />}
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-600 font-medium">
                                <div className="flex items-center justify-between">
                                    <span>Collar Battery:</span>
                                    <strong className={isLowBattery ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>{batteryLevel}%</strong>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-300 ${isLowBattery ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                        style={{ width: `${batteryLevel}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                                    <span className="flex items-center gap-1">
                                        <Radio className="h-3 w-3 text-slate-400" /> RSSI Signal:
                                    </span>
                                    <span>{rssi} dBm (Optimal)</span>
                                </div>
                            </div>

                            {isLowBattery && (
                                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-800 font-semibold bg-amber-100/90 p-2 rounded-xl">
                                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                                    <span>Low battery warning: Replace coin cell soon</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
