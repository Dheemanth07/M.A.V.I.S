import React, { useState, useEffect } from 'react';
import type { Animal } from '../../shared/types';
import { createAnimal } from '../../shared/services/api';
import { AnimalCard } from './AnimalCard';
import { VitalsModal } from './VitalsModal';
import { VeterinaryReportModal } from '../reports/VeterinaryReportModal';
import { useToast } from '../../shared/context/ToastContext';
import { ShieldCheck, Search, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

interface UserAnimalsViewProps {
    animals: Animal[];
    onRefresh?: () => void;
}

export const SPECIES_BREED_MAP: Record<string, string[]> = {
    'Cow': ['Holstein Friesian', 'Jersey', 'Guernsey', 'Ayrshire', 'Brown Swiss', 'Angus', 'Hereford', 'Simmental'],
    'Dog': ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Husky'],
    'Cat': ['Persian', 'Maine Coon', 'Siamese', 'Bengal', 'Ragdoll', 'British Shorthair', 'Sphynx'],
    'Sheep': ['Merino', 'Dorper', 'Suffolk', 'Hampshire', 'Dorset'],
    'Goat': ['Boer', 'Nubian', 'Alpine', 'Saanen', 'Nigerian Dwarf'],
};

export const normalizeSpecies = (speciesStr: string = ''): string => {
    const s = speciesStr.toLowerCase();
    if (s.includes('cow') || s.includes('bovine') || s.includes('cattle')) return 'Cow';
    if (s.includes('dog') || s.includes('canine')) return 'Dog';
    if (s.includes('cat') || s.includes('feline')) return 'Cat';
    if (s.includes('sheep') || s.includes('ovine')) return 'Sheep';
    if (s.includes('goat') || s.includes('caprine')) return 'Goat';
    return speciesStr || 'Cow';
};

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
    const [formData, setFormData] = useState({ name: '', species: 'Dog', breed: 'Labrador Retriever', age: 2, weight: 15 });
    const [submitting, setSubmitting] = useState(false);

    const handleAddAnimal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAnimal(formData);
            showToast(`Subject '${formData.name}' registered & linked to telemetry mesh.`, 'success');
            setFormData({ name: '', species: 'Dog', breed: 'Labrador Retriever', age: 2, weight: 15 });
            setShowAddModal(false);
            if (onRefresh) onRefresh();
        } catch (err: any) {
            console.error('Failed to add animal:', err);
            showToast(err.message || 'Failed to register animal profile.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    // 2nd Dropdown: Breeds available dynamically for the selected animal category ONLY!
    const availableBreeds = React.useMemo(() => {
        if (selectedSpecies !== 'all' && SPECIES_BREED_MAP[selectedSpecies]) {
            return SPECIES_BREED_MAP[selectedSpecies];
        }
        // If "All Animals" is selected, collect unique breeds from current registered subjects
        return Array.from(new Set(animals.map(a => a.breed).filter((b): b is string => Boolean(b))));
    }, [animals, selectedSpecies]);

    const filteredAnimals = animals.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (a.breed && a.breed.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (a.species && a.species.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'all' || a.healthStatus === filterStatus;
        
        const norm = normalizeSpecies(a.species);
        const matchesSpecies = selectedSpecies === 'all' || norm === selectedSpecies;
        const matchesBreed = selectedBreed === 'all' || (a.breed && a.breed.toLowerCase() === selectedBreed.toLowerCase());
        
        return matchesSearch && matchesStatus && matchesSpecies && matchesBreed;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, selectedSpecies, selectedBreed, pageSize]);

    const handleSpeciesChange = (speciesVal: string) => {
        setSelectedSpecies(speciesVal);
        setSelectedBreed('all'); // Reset breed selection to all breeds of that animal
    };

    const totalPages = Math.ceil(filteredAnimals.length / pageSize) || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedAnimals = filteredAnimals.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bento-card p-6 flex flex-col space-y-4 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0 font-display">My Animals & Care Glance</h2>
                        <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">Manage your herd subjects, track live telemetry, and generate veterinary audits</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name or breed..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-full pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-teal-600"
                            />
                        </div>

                        {/* Add Animal Button for Owners & Farmers */}
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer whitespace-nowrap hover:scale-105"
                        >
                            <Plus className="h-4 w-4" /> Add New Animal
                        </button>
                    </div>
                </div>

                {/* Filter Toolbar: Animal Selector (Dog, Cat, Cow...), Breed Selector (breeds of that animal only) */}
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs font-semibold">
                    
                    {/* 1st Dropdown: Animal Type (Dog, Cat, Cow, Horse, Sheep, Goat) */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Animal:</span>
                        <select
                            value={selectedSpecies}
                            onChange={(e) => handleSpeciesChange(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-full px-3.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-teal-600 cursor-pointer shadow-2xs"
                        >
                            <option value="all">All Animals</option>
                            <option value="Cow">Cow</option>
                            <option value="Dog">Dog</option>
                            <option value="Cat">Cat</option>
                            <option value="Sheep">Sheep</option>
                            <option value="Goat">Goat</option>
                        </select>
                    </div>

                    {/* 2nd Dropdown: Breeds of ONLY the selected animal */}
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Breed:</span>
                        <select
                            value={selectedBreed}
                            onChange={(e) => setSelectedBreed(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-full px-3.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-teal-600 cursor-pointer shadow-2xs"
                        >
                            <option value="all">
                                {selectedSpecies !== 'all' ? `All ${selectedSpecies} Breeds` : 'All Breeds'}
                            </option>
                            {availableBreeds.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Health Status:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-full px-3.5 py-1.5 text-xs font-semibold focus:outline-none focus:border-teal-600 cursor-pointer shadow-2xs"
                        >
                            <option value="all">All Statuses</option>
                            <option value="healthy">Healthy Only</option>
                            <option value="warning">Warning Only</option>
                            <option value="critical">Critical Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {animals.length === 0 ? (
                <div className="bento-card p-12 text-center text-slate-500 bg-white space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 m-0 font-display">No Animals Registered Yet</h3>
                        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto font-normal leading-relaxed">
                            Your account is ready. Register your first cattle, canine, or herd subject to connect ESP32 collar telemetry, view continuous vitals, and monitor real-time digital twins.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition shadow-sm inline-flex items-center gap-2 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Register Your First Subject</span>
                    </button>
                </div>
            ) : paginatedAnimals.length === 0 ? (
                <div className="bento-card p-12 text-center text-slate-500 bg-white">
                    <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-slate-800 m-0 font-display">No animals matching filters</h3>
                    <p className="text-xs text-slate-500 mt-1 font-normal">Try clearing search filters or select a different subject above.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                    {paginatedAnimals.map(animal => (
                        <div key={animal._id} className="h-full">
                            <AnimalCard
                                animal={animal}
                                onViewVitals={(a) => setSelectedAnimal(a)}
                                onExportReport={(a) => setReportAnimal(a)}
                            />
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
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Animal Type</label>
                                    <select
                                        value={formData.species}
                                        onChange={(e) => {
                                            const sp = e.target.value;
                                            const defaultBreed = SPECIES_BREED_MAP[sp] ? SPECIES_BREED_MAP[sp][0] : 'Standard';
                                            setFormData({ ...formData, species: sp, breed: defaultBreed });
                                        }}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-full px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-teal-600 cursor-pointer shadow-2xs"
                                    >
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Cow">Cow</option>
                                        <option value="Sheep">Sheep</option>
                                        <option value="Goat">Goat</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Breed ({formData.species} only)</label>
                                    <select
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-full px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-teal-600 cursor-pointer shadow-2xs"
                                    >
                                        {(SPECIES_BREED_MAP[formData.species] || ['Standard Breed']).map((b) => (
                                            <option key={b} value={b}>{b}</option>
                                        ))}
                                    </select>
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
