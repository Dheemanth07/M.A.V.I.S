import React from 'react';
import { Thermometer, Heart, Activity, FileText } from 'lucide-react';
import type { Animal } from '../../shared/types';

interface AnimalCardProps {
    animal: Animal;
    onViewVitals: (animal: Animal) => void;
    onExportReport?: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onViewVitals, onExportReport }) => {
    const status = animal.healthStatus || 'healthy';

    const statusConfig = {
        healthy: {
            text: 'Normal Baseline (Healthy)',
            badgeClass: 'status-pill-healthy',
            dotClass: 'bg-emerald-500',
        },
        warning: {
            text: 'Under Observation',
            badgeClass: 'status-pill-warning',
            dotClass: 'bg-amber-500',
        },
        critical: {
            text: 'Critical Attention Required',
            badgeClass: 'status-pill-critical',
            dotClass: 'bg-rose-500',
        },
    }[status] || {
        text: 'Normal Baseline',
        badgeClass: 'status-pill-healthy',
        dotClass: 'bg-emerald-500',
    };

    // Clean species and breed display (e.g. "Bovine • Holstein Friesian")
    const cleanSpecies = (animal.species || 'Bovine').replace(/ - .*$/, '').trim();
    const cleanBreed = animal.breed || 'Standard Breed';

    return (
        <div className="bento-card p-6 h-full flex flex-col justify-between bg-white border border-slate-200/90 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300">
            {/* Top Section */}
            <div>
                {/* Status Badge & Device Identifier */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shadow-2xs ${statusConfig.badgeClass}`}>
                        <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                        <span>{statusConfig.text}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-semibold">#{animal.deviceId || animal._id.substring(0, 6).toUpperCase()}</span>
                </div>

                {/* Animal Name & Clean Breed Subtitle */}
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mb-1 font-display">
                    {animal.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium mb-5">
                    {cleanSpecies} • <span className="text-slate-700 font-semibold">{cleanBreed}</span>
                </p>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-100/90">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                            <Thermometer className="h-3.5 w-3.5 text-teal-600" />
                            <span>Temperature</span>
                        </div>
                        <div className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                            {animal.baselines?.temperature ? (
                                <>{Number(animal.baselines.temperature).toFixed(1)}<span className="text-xs text-slate-500 font-normal">°C</span></>
                            ) : (
                                <span className="text-slate-400 font-normal text-sm">38.5°C</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-50/90 p-3.5 rounded-2xl border border-slate-100/90">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                            <Heart className="h-3.5 w-3.5 text-rose-600" />
                            <span>Heart Rate</span>
                        </div>
                        <div className="text-xl font-bold tracking-tight text-slate-900 font-mono">
                            {animal.baselines?.heartRate ? (
                                <>{animal.baselines.heartRate}<span className="text-xs text-slate-500 font-normal"> BPM</span></>
                            ) : (
                                <span className="text-slate-400 font-normal text-sm">72 BPM</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Actions: Both Symmetrically Aligned & Clearly Visible */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                    onClick={() => onViewVitals(animal)}
                    className="w-full h-10 flex items-center justify-center gap-2 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all duration-200 hover:scale-[1.01] cursor-pointer"
                >
                    <Activity className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                    <span>View Detailed Vitals</span>
                </button>

                {onExportReport && (
                    <button
                        onClick={() => onExportReport(animal)}
                        className="w-full h-10 flex items-center justify-center gap-2 px-4 rounded-full bg-teal-50/90 hover:bg-teal-600 hover:text-white border border-teal-300 text-teal-800 text-xs font-bold transition-all duration-200 hover:scale-[1.01] shadow-2xs cursor-pointer group"
                    >
                        <FileText className="h-3.5 w-3.5 text-teal-700 group-hover:text-white transition-colors shrink-0" />
                        <span>Export Clinical PDF Report</span>
                    </button>
                )}
            </div>
        </div>
    );
};
