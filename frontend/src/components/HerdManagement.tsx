import React, { useState } from 'react';
import type { Animal } from '../types';
import { createAnimal } from '../services/api';
import { Plus, Search, ShieldCheck, Filter } from 'lucide-react';

interface HerdManagementProps {
    animals: Animal[];
    onRefresh: () => void;
}

export const HerdManagement: React.FC<HerdManagementProps> = ({ animals, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', species: 'Cow', breed: 'Holstein', age: 3, weight: 500 });
    const [submitting, setSubmitting] = useState(false);

    const filteredAnimals = animals.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.species.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || a.healthStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAnimal(formData);
            setShowModal(false);
            setFormData({ name: '', species: 'Cow', breed: 'Holstein', age: 3, weight: 500 });
            onRefresh();
        } catch (err) {
            console.error('Failed to register animal:', err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="mavis-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or species..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-teal-500"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="healthy">Healthy</option>
                            <option value="warning">Warning</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl transition shadow-lg shadow-teal-600/20 text-sm"
                >
                    <Plus className="h-4 w-4" /> Register New Subject
                </button>
            </div>

            {/* Herd Table */}
            <div className="mavis-card overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <ShieldCheck className="h-5 w-5 text-teal-400" />
                        <h3 className="text-lg font-bold text-white m-0">Registered Cattle Registry</h3>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">Showing {filteredAnimals.length} of {animals.length} subjects</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                                <th className="py-4 px-6">Subject Name</th>
                                <th className="py-4 px-6">Species / Breed</th>
                                <th className="py-4 px-6">Age / Weight</th>
                                <th className="py-4 px-6">Health Status</th>
                                <th className="py-4 px-6">Digital Twin Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/80 text-sm text-slate-300">
                            {filteredAnimals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-500 text-sm">
                                        No matching subjects registered in database.
                                    </td>
                                </tr>
                            ) : (
                                filteredAnimals.map((animal) => (
                                    <tr key={animal._id} className="hover:bg-slate-800/40 transition">
                                        <td className="py-4 px-6 font-bold text-white">{animal.name}</td>
                                        <td className="py-4 px-6">{animal.species} <span className="text-xs text-slate-400">({animal.breed || 'Standard'})</span></td>
                                        <td className="py-4 px-6">{animal.age || '-'} yrs / {animal.weight || '-'} kg</td>
                                        <td className="py-4 px-6">
                                            <span className={`mavis-badge mavis-badge-${animal.healthStatus}`}>
                                                {animal.healthStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-400">{animal.baselineReadingsCount || 0}/10</span>
                                                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-teal-500" style={{ width: `${Math.min(100, ((animal.baselineReadingsCount || 0) / 10) * 100)}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Registration Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="mavis-card p-6 w-full max-w-md bg-slate-900 border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4">Register New Animal Profile</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-400 mb-1 block">Subject Name / Tag</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Holstein #104"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Species</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Breed</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-bold hover:bg-teal-500"
                                >
                                    {submitting ? 'Registering...' : 'Save Subject'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
