import React, { useState, useEffect } from 'react';
import type { Animal } from '../../../shared/types';
import { createAnimal } from '../../../shared/services/api';
import { AnimalCard } from './AnimalCard';
import { VitalsModal } from './VitalsModal';
import { ShieldCheck, Search, Filter, ChevronLeft, ChevronRight, LayoutGrid, Tag, Plus, X, Sparkles } from 'lucide-react';

interface UserAnimalsViewProps {
    animals: Animal[];
    onRefresh?: () => void;
}

export const UserAnimalsView: React.FC<UserAnimalsViewProps> = ({ animals, onRefresh }) => {
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
    const [selectedBreed, setSelectedBreed] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(6);

    // Modal state for adding a new pet/animal
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', species: 'Dog', breed: 'Labrador', age: 2, weight: 15 });
    const [submitting, setSubmitting] = useState(false);

    const handleAddAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAnimal(formData);
            setFormData({ name: '', species: 'Dog', breed: 'Labrador', age: 2, weight: 15 });
            setShowAddModal(false);
            if (onRefresh) onRefresh();
        } catch (err) {
            console.error('Failed to add animal:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const uniqueSpecies = Array.from(
        new Set(animals.map(a => a.species).filter(Boolean))
    );

    const availableBreeds = Array.from(
        new Set(
            animals
                .filter(a => selectedSpecies === 'all' || a.species.toLowerCase() === selectedSpecies.toLowerCase())
                .map(a => a.breed)
                .filter((b): b is string => Boolean(b))
        )
    );

    const filteredAnimals = animals.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || (a.breed && a.breed.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || a.healthStatus === filterStatus;
        const matchesSpecies = selectedSpecies === 'all' || a.species.toLowerCase() === selectedSpecies.toLowerCase();
        const matchesBreed = selectedBreed === 'all' || (a.breed && a.breed.toLowerCase() === selectedBreed.toLowerCase());
        return matchesSearch && matchesStatus && matchesSpecies && matchesBreed;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, selectedSpecies, selectedBreed, pageSize]);

    const handleSpeciesChange = (speciesVal: string) => {
        setSelectedSpecies(speciesVal);
        setSelectedBreed('all');
    };

    const totalPages = Math.ceil(filteredAnimals.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedAnimals = filteredAnimals.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bento-card p-6 flex flex-col space-y-4 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 m-0">My Animals & Care Glance</h2>
                        <p className="text-xs text-slate-500 font-medium m-0">Manage your pets or herd, track live vitals, and add new animals</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or breed..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        {/* Add Animal Button for Owners & Farmers */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" /> Add New Animal
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-semibold">Animal Type:</span>
                        <select
                            value={selectedSpecies}
                            onChange={(e) => handleSpeciesChange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                            <option value="all">All Animals</option>
                            {uniqueSpecies.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {selectedSpecies !== 'all' && availableBreeds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <Tag className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-slate-400 font-semibold">Breed:</span>
                            <select
                                value={selectedBreed}
                                onChange={(e) => setSelectedBreed(e.target.value)}
                                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                            >
                                <option value="all">All Breeds</option>
                                {availableBreeds.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                        <Filter className="h-3.5 w-3.5 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                            <option value="all">All Health Statuses</option>
                            <option value="healthy">Healthy Only</option>
                            <option value="warning">Warning Only</option>
                            <option value="critical">Critical Only</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {paginatedAnimals.length === 0 ? (
                    <div className="col-span-full bento-card p-12 text-center text-slate-500 bg-white">
                        <ShieldCheck className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-900 m-0">No Animals Match Your Filter</p>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Try adjusting your animal type, breed, or health status filter.</p>
                    </div>
                ) : (
                    paginatedAnimals.map(animal => (
                        <AnimalCard
                            key={animal._id}
                            animal={animal}
                            onViewVitals={(anim) => setSelectedAnimal(anim)}
                        />
                    ))
                )}
            </div>

            {filteredAnimals.length > 0 && (
                <div className="bento-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4 text-slate-400" />
                        <span>Showing <strong className="text-slate-900">{Math.min(startIndex + 1, filteredAnimals.length)}–{Math.min(startIndex + pageSize, filteredAnimals.length)}</strong> of <strong className="text-slate-900">{filteredAnimals.length}</strong> subjects</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400">Cards per page:</span>
                            <select
                                value={pageSize}
                                onChange={(e) => setPageSize(Number(e.target.value))}
                                className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-2.5 py-1.5 font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                            >
                                <option value={6}>6 per page</option>
                                <option value={12}>12 per page</option>
                                <option value={24}>24 per page</option>
                                <option value={999}>Show All</option>
                            </select>
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    title="Previous Page"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <span className="px-3 py-1 bg-slate-100 rounded-xl text-slate-900 font-bold">
                                    {currentPage} / {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    title="Next Page"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Vitals Trend Modal */}
            {selectedAnimal && (
                <VitalsModal
                    animal={selectedAnimal}
                    onClose={() => setSelectedAnimal(null)}
                />
            )}

            {/* Add New Animal Modal for Pet Owners & Farmers */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bento-card w-full max-w-lg bg-white p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                                    <Sparkles className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 m-0">Register New Animal</h3>
                                    <p className="text-xs text-slate-500 font-medium m-0">Add a pet or livestock subject to your care profile</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAnimal} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Animal Name / Tag</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Buddy, Cooper, or Cow #402"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Species / Type</label>
                                    <select
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                                    >
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Cow">Cow</option>
                                        <option value="Horse">Horse</option>
                                        <option value="Sheep">Sheep</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Breed</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        placeholder="e.g. Golden Retriever"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {submitting ? 'Registering...' : 'Register Animal Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
