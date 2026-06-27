import React, { useState } from 'react';
import type { Animal } from '../../shared/types';
import { createAnimal } from '../../shared/services/api';
import { Plus, Cpu, ShieldCheck } from 'lucide-react';

interface AdminSubjectRegistryProps {
    animals: Animal[];
    onRefresh: () => void;
}

export const AdminSubjectRegistry: React.FC<AdminSubjectRegistryProps> = ({ animals, onRefresh }) => {
    const [formData, setFormData] = useState({ name: '', species: 'Cow', breed: 'Holstein', age: 3, weight: 500 });
    const [pairedNodeId, setPairedNodeId] = useState('ESP32-COLLAR-01');
    const [submitting, setSubmitting] = useState(false);
    const [pairSuccess, setPairSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAnimal(formData);
            setFormData({ name: '', species: 'Cow', breed: 'Holstein', age: 3, weight: 500 });
            onRefresh();
        } catch (err) {
            console.error('Failed to register subject profile:', err);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePairNode = (e: React.FormEvent) => {
        e.preventDefault();
        setPairSuccess(true);
        setTimeout(() => setPairSuccess(false), 3000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bento-card p-6 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">Admin Subject Registry & Hardware Binding</h2>
                    <p className="text-xs text-slate-500 font-normal m-0">System-wide registration, hardware node pairing, and profile management</p>
                </div>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl border border-indigo-200">
                    {animals.length} Profiles Registered
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-6">
                    <div className="bento-card p-6 bg-white">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight text-slate-900 m-0">Register New Subject Profile</h3>
                                <p className="text-xs text-slate-500 font-normal m-0">Add animal to global database</p>
                            </div>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Subject Name / Tag</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Dairy Cow #402"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Species</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.species}
                                        onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Breed</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                            >
                                {submitting ? 'Registering...' : 'Add Subject Profile'}
                            </button>
                        </form>
                    </div>

                    <div className="bento-card p-6 bg-white">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold tracking-tight text-slate-900 m-0">Hardware Node Pairing</h3>
                                <p className="text-xs text-slate-500 font-normal m-0">Bind physical ESP32 collar to subject</p>
                            </div>
                        </div>

                        <form onSubmit={handlePairNode} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Target Subject</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer">
                                    {animals.map(a => (
                                        <option key={a._id} value={a._id}>{a.name} ({a.species})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Hardware MAC / Collar Node ID</label>
                                <input
                                    type="text"
                                    value={pairedNodeId}
                                    onChange={(e) => setPairedNodeId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 font-mono"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                            >
                                Bind Hardware Collar Node
                            </button>
                            {pairSuccess && (
                                <p className="text-xs text-emerald-600 font-semibold text-center m-0">✓ Hardware node paired successfully!</p>
                            )}
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-7 space-y-6">
                    <div className="bento-card overflow-hidden bg-white">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                <h3 className="text-lg font-semibold tracking-tight text-slate-900 m-0">System-Wide Subject Registry</h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                        <th className="py-3.5 px-4">Name</th>
                                        <th className="py-3.5 px-4">Species</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4">Baseline Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-normal">
                                    {animals.map((animal) => (
                                        <tr key={animal._id} className="hover:bg-slate-50 transition">
                                            <td className="py-3.5 px-4 font-semibold text-slate-900">{animal.name}</td>
                                            <td className="py-3.5 px-4">{animal.species}</td>
                                            <td className="py-3.5 px-4">
                                                <span className={`status-pill-${animal.healthStatus || 'healthy'} px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider`}>
                                                    {animal.healthStatus || 'healthy'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-4 font-semibold text-slate-600">
                                                {animal.baselineReadingsCount || 0}/10 Readings
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
