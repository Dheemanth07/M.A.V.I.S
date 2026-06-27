import React, { useState } from 'react';
import type { Animal } from '../types';
import { createAnimal } from '../services/api';
import { Shield, Plus, Cpu, Database, Activity, RefreshCw } from 'lucide-react';

interface AdminDashboardProps {
    animals: Animal[];
    onRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ animals, onRefresh }) => {
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
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="bento-card p-6 bg-slate-900 text-white border-none shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                        <Shield className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white m-0">Admin & Hardware Control Panel</h2>
                        <p className="text-xs text-slate-400 font-medium m-0">System configuration, baseline overriding, and raw telemetry data stream monitoring</p>
                    </div>
                </div>

                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700"
                >
                    <RefreshCw className="h-4 w-4" /> Sync Registry
                </button>
            </div>

            {/* Admin Grid (2 Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Forms for Registration & Hardware Node Pairing (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Register Subject Card */}
                    <div className="bento-card p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Plus className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 m-0">Register New Subject Profile</h3>
                                <p className="text-xs text-slate-500 font-medium m-0">Add animal to global database</p>
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-1 block">Breed</label>
                                    <input
                                        type="text"
                                        value={formData.breed}
                                        onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                            >
                                {submitting ? 'Registering...' : 'Add Animal Profile'}
                            </button>
                        </form>
                    </div>

                    {/* Hardware Node Pairing Card */}
                    <div className="bento-card p-6">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                <Cpu className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 m-0">Hardware Node Pairing</h3>
                                <p className="text-xs text-slate-500 font-medium m-0">Bind physical ESP32 collar to subject</p>
                            </div>
                        </div>

                        <form onSubmit={handlePairNode} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1 block">Select Target Animal</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500">
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
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                            >
                                Bind Hardware Collar Node
                            </button>
                            {pairSuccess && (
                                <p className="text-xs text-emerald-600 font-bold text-center m-0">✓ Hardware node paired successfully!</p>
                            )}
                        </form>
                    </div>
                </div>

                {/* Right Column: Raw Time-Series Monitoring Grids (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bento-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                                    <Database className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 m-0">Raw Telemetry Input Stream</h3>
                                    <p className="text-xs text-slate-500 font-medium m-0">Live time-series data inspection directly from MongoDB</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                                Live Ingestion
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        <th className="py-3 px-4">Subject</th>
                                        <th className="py-3 px-4">Temp (°C)</th>
                                        <th className="py-3 px-4">Heart Rate</th>
                                        <th className="py-3 px-4">Resp Rate</th>
                                        <th className="py-3 px-4">Battery</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                                    {animals.slice(0, 5).map((a) => (
                                        <tr key={a._id} className="hover:bg-slate-50 transition">
                                            <td className="py-3.5 px-4 font-bold text-slate-900">{a.name}</td>
                                            <td className="py-3.5 px-4">{a.baselines?.temperature || 38.2}°C</td>
                                            <td className="py-3.5 px-4">{a.baselines?.heartRate || 72} BPM</td>
                                            <td className="py-3.5 px-4">{a.baselines?.respiratoryRate || 22}</td>
                                            <td className="py-3.5 px-4 font-bold text-emerald-600">88%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Baseline Override Controls */}
                    <div className="bento-card p-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-lg font-bold text-slate-900 m-0">Digital Twin Baseline Override</h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium m-0 leading-relaxed">
                            System administrators and authorized vets can manual-override learned Exponential Moving Average baselines during clinical treatments.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                <span className="text-[11px] text-slate-500 block">Temp Target</span>
                                <input type="number" defaultValue={38.5} step={0.1} className="w-full text-center bg-white border border-slate-300 rounded-lg mt-1 text-sm font-bold p-1" />
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                <span className="text-[11px] text-slate-500 block">HR Target</span>
                                <input type="number" defaultValue={75} className="w-full text-center bg-white border border-slate-300 rounded-lg mt-1 text-sm font-bold p-1" />
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                <span className="text-[11px] text-slate-500 block">RR Target</span>
                                <input type="number" defaultValue={24} className="w-full text-center bg-white border border-slate-300 rounded-lg mt-1 text-sm font-bold p-1" />
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                                <span className="text-[11px] text-slate-500 block">BO Target</span>
                                <input type="number" defaultValue={98} className="w-full text-center bg-white border border-slate-300 rounded-lg mt-1 text-sm font-bold p-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
