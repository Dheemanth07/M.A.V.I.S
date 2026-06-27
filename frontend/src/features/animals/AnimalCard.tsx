import React from 'react';
import { Thermometer, Heart, Activity } from 'lucide-react';
import type { Animal } from '../../shared/types';

interface AnimalCardProps {
    animal: Animal;
    onViewVitals: (animal: Animal) => void;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onViewVitals }) => {
    const status = animal.healthStatus || 'healthy';

    const statusConfig = {
        healthy: {
            text: `${animal.name} is doing great!`,
            badgeClass: 'status-pill-healthy',
        },
        warning: {
            text: `${animal.name} needs observation`,
            badgeClass: 'status-pill-warning',
        },
        critical: {
            text: `${animal.name} requires attention`,
            badgeClass: 'status-pill-critical',
        },
    }[status];

    return (
        <div className="bento-card p-6 flex flex-col justify-between hover:border-slate-300 transition bg-white">
            <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badgeClass}`}>
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {statusConfig.text}
                    </span>
                    <span className="text-xs text-slate-400 font-mono font-normal">#{animal._id.substring(0, 5)}</span>
                </div>

                <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">{animal.name}</h3>
                <p className="text-xs text-slate-500 font-normal mb-6">{animal.species} • {animal.breed || 'Standard Breed'}</p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                            <Thermometer className="h-3.5 w-3.5 text-emerald-600" /> Temperature
                        </div>
                        <div className="text-xl font-bold tracking-tight text-slate-900">
                            {Number(animal.baselines?.temperature || 38.2).toFixed(1)}<span className="text-xs text-slate-500 font-normal">°C</span>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                            <Heart className="h-3.5 w-3.5 text-rose-500" /> Heart Rate
                        </div>
                        <div className="text-xl font-bold tracking-tight text-slate-900">
                            {animal.baselines?.heartRate || 72}<span className="text-xs text-slate-500 font-normal"> BPM</span>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onViewVitals(animal)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer"
            >
                <Activity className="h-4 w-4 text-emerald-600" /> View Detailed Vitals
            </button>
        </div>
    );
};
