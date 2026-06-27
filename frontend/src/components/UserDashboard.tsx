import React, { useState } from 'react';
import type { Animal } from '../types';
import { AnimalCard } from './AnimalCard';
import { VitalsModal } from './VitalsModal';
import { Heart, ShieldCheck, Smile } from 'lucide-react';

interface UserDashboardProps {
    animals: Animal[];
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ animals }) => {
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

    const healthyCount = animals.filter(a => (a.healthStatus || 'healthy') === 'healthy').length;

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Friendly Hero Banner */}
            <div className="bento-card p-6 sm:p-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-none shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
                            <Smile className="h-4 w-4" /> Everyday Care Dashboard
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">Welcome back!</h2>
                        <p className="text-sm text-emerald-100 max-w-xl font-medium m-0 leading-relaxed">
                            Everything looks peaceful. All your animals have active baseline collar tracking and their vitals are continuously monitored.
                        </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
                        <div className="p-3 rounded-xl bg-white/20 text-white">
                            <Heart className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="text-2xl font-black">{healthyCount} / {animals.length || 1}</div>
                            <div className="text-xs text-emerald-100 font-semibold">Doing Great Today</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-slate-900 m-0">My Animals Summary</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 m-0">Live glance at current body temperatures and resting heart rates</p>
                </div>
                <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1.5 rounded-xl">
                    {animals.length} Animals Registered
                </span>
            </div>

            {/* Responsive Bento Box Grid (grid-cols-1 md:grid-cols-3 gap-6) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {animals.length === 0 ? (
                    <div className="col-span-full bento-card p-12 text-center text-slate-500">
                        <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-800 m-0">No Animals Available</p>
                        <p className="text-xs text-slate-500 mt-1">Please wait for your veterinarian or administrator to register profiles.</p>
                    </div>
                ) : (
                    animals.map(animal => (
                        <AnimalCard
                            key={animal._id}
                            animal={animal}
                            onViewVitals={(anim) => setSelectedAnimal(anim)}
                        />
                    ))
                )}
            </div>

            {/* Vitals Trend Modal */}
            {selectedAnimal && (
                <VitalsModal
                    animal={selectedAnimal}
                    onClose={() => setSelectedAnimal(null)}
                />
            )}
        </div>
    );
};
