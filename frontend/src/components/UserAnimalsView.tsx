import React, { useState } from 'react';
import type { Animal } from '../types';
import { AnimalCard } from './AnimalCard';
import { VitalsModal } from './VitalsModal';
import { ShieldCheck, Search, Filter } from 'lucide-react';

interface UserAnimalsViewProps {
    animals: Animal[];
}

export const UserAnimalsView: React.FC<UserAnimalsViewProps> = ({ animals }) => {
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const filteredAnimals = animals.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.species.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || a.healthStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Control & Filter Bar */}
            <div className="bento-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
                <div>
                    <h2 className="text-xl font-black text-slate-900 m-0">My Animals & Vitals Glance</h2>
                    <p className="text-xs text-slate-500 font-medium m-0">Friendly health status cards and individual vital summaries</p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search animal name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-emerald-600"
                        >
                            <option value="all">All Statuses</option>
                            <option value="healthy">Healthy</option>
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Responsive Bento Box Grid (grid-cols-1 md:grid-cols-3 gap-6) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredAnimals.length === 0 ? (
                    <div className="col-span-full bento-card p-12 text-center text-slate-500 bg-white">
                        <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-900 m-0">No Animals Match Your Filter</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Try adjusting your search terms or filter settings.</p>
                    </div>
                ) : (
                    filteredAnimals.map(animal => (
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
