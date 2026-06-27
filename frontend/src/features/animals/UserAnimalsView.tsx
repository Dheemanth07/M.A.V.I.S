import React, { useState, useEffect } from 'react';
import type { Animal } from '../../shared/types';
import { createAnimal } from '../../shared/services/api';
import { AnimalCard } from './AnimalCard';
import { VitalsModal } from './VitalsModal';
import { VeterinaryReportModal } from '../reports/VeterinaryReportModal';
import { useToast } from '../../shared/context/ToastContext';
import { ShieldCheck, Search, ChevronLeft, ChevronRight, Plus, X, FileText } from 'lucide-react';

interface UserAnimalsViewProps {
    animals: Animal[];
    onRefresh?: () => void;
}

export const UserAnimalsView: React.FC<UserAnimalsViewProps> = ({ animals, onRefresh }) => {
    const { showToast } = useToast();
    const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
    const [reportAnimal, setReportAnimal] = useState<Animal | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
    const [selectedBreed, setSelectedBreed] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(6);

    // Modal state for adding a new pet/animal
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', species: 'Dog', breed: 'Labrador', age: 2, weight: 15 });
    const [submitting, setSubmitting] = useState(false);

    const handleAddAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAnimal(formData);
            showToast(`Subject '${formData.name}' registered & linked to telemetry mesh.`, 'success');
            setFormData({ name: '', species: 'Dog', breed: 'Labrador', age: 2, weight: 15 });
            setShowAddModal(false);
            if (onRefresh) onRefresh();
        } catch (err: any) {
            console.error('Failed to add animal:', err);
            showToast(err.message || 'Failed to register animal profile.', 'error');
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
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">My Animals & Care Glance</h2>
                        <p className="text-xs text-slate-500 font-normal m-0">Manage your pets or herd, track live vitals, and add new animals</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or breed..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-emerald-600"
                            />
                        </div>

                        {/* Add Animal Button for Owners & Farmers */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" /> Add New Animal
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Animal Type:</span>
                        <select
                            value={selectedSpecies}
                            onChange={(e) => handleSpeciesChange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                            <option value="all">All Animals</option>
                            {uniqueSpecies.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Breed:</span>
                        <select
                            value={selectedBreed}
                            onChange={(e) => setSelectedBreed(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                            <option value="all">All Breeds</option>
                            {availableBreeds.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-medium">Health Status:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="healthy">Healthy Only</option>
                            <option value="warning">Warning Only</option>
                            <option value="critical">Critical Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {paginatedAnimals.length === 0 ? (
                <div className="bento-card p-12 text-center text-slate-500 bg-white">
                    <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-800 m-0">No animals matching filters</h3>
                    <p className="text-xs text-slate-500 mt-1 font-normal">Try clearing search filters or add a new profile above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedAnimals.map(animal => (
                        <div key={animal._id} className="space-y-2">
                            <AnimalCard
                                animal={animal}
                                onViewVitals={(a) => setSelectedAnimal(a)}
                            />
                            <button
                                onClick={() => setReportAnimal(animal)}
                                className="w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                                <FileText className="h-3.5 w-3.5 text-emerald-600" /> Export Clinical PDF Report
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bento-card p-4 flex items-center justify-between bg-white text-xs font-medium text-slate-600">
                    <div>
                        Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredAnimals.length)} of {filteredAnimals.length} subjects
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Vitals Modal */}
            <VitalsModal
                animal={selectedAnimal}
                onClose={() => setSelectedAnimal(null)}
            />

            {/* Clinical Report Modal */}
            <VeterinaryReportModal
                animal={reportAnimal}
                onClose={() => setReportAnimal(null)}
            />

            {/* Add Animal Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold tracking-tight text-slate-900 m-0">Register New Animal</h3>
                                    <p className="text-xs text-slate-500 font-normal m-0">Link a new pet or livestock profile</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleAddAnimal} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-700 mb-1 block">Animal Name / Identifier</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Buddy, Bella, Cow #12"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-emerald-600"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Species</label>
                                    <select
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                                    >
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Cow">Cow / Dairy</option>
                                        <option value="Horse">Horse</option>
                                        <option value="Sheep">Sheep</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Breed</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        placeholder="e.g. Golden Retriever"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer disabled:opacity-50"
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
