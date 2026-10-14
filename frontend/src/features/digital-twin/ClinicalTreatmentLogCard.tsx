import React, { useState, useEffect } from 'react';
import { 
    ClipboardList, Plus, CheckCircle2, Clock, ShieldAlert, 
    Pill, Droplets, Stethoscope, Radio, Trash2, User
} from 'lucide-react';
import type { Animal } from '../../shared/types';

export interface TreatmentAction {
    id: string;
    timestamp: string;
    category: 'Pen Separation' | 'Medication' | 'Hydration' | 'Physical Exam' | 'Collar Fit';
    title: string;
    notes: string;
    operator: string;
    status: 'Completed' | 'In Progress' | 'Scheduled';
}

interface ClinicalTreatmentLogCardProps {
    animal: Animal;
    healthStatus?: 'healthy' | 'warning' | 'critical' | 'unknown';
}

const CATEGORY_PRESETS = [
    { label: 'Pen Separation', icon: ShieldAlert, color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Medication', icon: Pill, color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { label: 'Hydration', icon: Droplets, color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Physical Exam', icon: Stethoscope, color: 'text-teal-700 bg-teal-50 border-teal-200' },
    { label: 'Collar Fit', icon: Radio, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
] as const;

export const ClinicalTreatmentLogCard: React.FC<ClinicalTreatmentLogCardProps> = ({
    animal,
    healthStatus = 'healthy'
}) => {
    const [actions, setActions] = useState<TreatmentAction[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Form state
    const [category, setCategory] = useState<TreatmentAction['category']>('Pen Separation');
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [operator, setOperator] = useState('Dr. Reynolds (Field Vet)');
    const [status, setStatus] = useState<TreatmentAction['status']>('Completed');

    const storageKey = `mavis_treatment_actions_${animal._id}`;

    // Load from localStorage or initialize realistic defaults
    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setActions(parsed);
                    return;
                }
            }
        } catch (err) {
            console.error('Failed reading treatment log from storage:', err);
        }

        // Generate realistic initial entries based on the animal's status
        const isUrgent = healthStatus === 'critical' || healthStatus === 'warning';
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 3600 * 1000);
        const fourHoursAgo = new Date(now.getTime() - 4 * 3600 * 1000);
        const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);

        const initial: TreatmentAction[] = isUrgent ? [
            {
                id: 'act-1',
                timestamp: fourHoursAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
                category: 'Pen Separation',
                title: 'Quarantine & Isolation Transfer',
                notes: `Moved ${animal.name} to isolation stall Beta to prevent potential herd contagion spread.`,
                operator: 'Caregiver Team',
                status: 'Completed'
            },
            {
                id: 'act-2',
                timestamp: twoHoursAgo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
                category: 'Hydration',
                title: 'Oral Electrolyte Fluid Therapy',
                notes: 'Administered 2L oral rehydration solution. Core vitals monitoring ongoing.',
                operator: 'Dr. Reynolds (Field Vet)',
                status: 'In Progress'
            }
        ] : [
            {
                id: 'act-init',
                timestamp: yesterday.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' 09:30 AM',
                category: 'Physical Exam',
                title: 'Routine Health & Collar Inspection',
                notes: 'Collar sensor fit inspected. Vitals within normal physiological range, zero contact abrasion.',
                operator: 'Farm Operator',
                status: 'Completed'
            }
        ];

        setActions(initial);
        try {
            localStorage.setItem(storageKey, JSON.stringify(initial));
        } catch {}
    }, [animal._id, animal.name, healthStatus, storageKey]);

    const handleSaveAction = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const now = new Date();
        const newAction: TreatmentAction = {
            id: 'act-' + Date.now(),
            timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
            category,
            title: title.trim(),
            notes: notes.trim() || 'No additional notes provided.',
            operator: operator.trim() || 'Staff Caregiver',
            status
        };

        const updated = [newAction, ...actions];
        setActions(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}

        // Reset form
        setTitle('');
        setNotes('');
        setShowAddForm(false);
    };

    const handleToggleStatus = (id: string) => {
        const updated = actions.map(act => {
            if (act.id === id) {
                const nextStatus: TreatmentAction['status'] = 
                    act.status === 'Completed' ? 'In Progress' : 'Completed';
                return { ...act, status: nextStatus };
            }
            return act;
        });
        setActions(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
    };

    const handleDeleteAction = (id: string) => {
        const updated = actions.filter(act => act.id !== id);
        setActions(updated);
        try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
    };

    return (
        <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-2xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-5 w-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-base tracking-tight m-0 font-display">
                            Clinical Action &amp; Treatment Log
                        </h4>
                        <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                            Audit trail of veterinary interventions, herd separations, and treatments
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs hover:scale-102"
                >
                    <Plus className="h-4 w-4" />
                    <span>{showAddForm ? 'Close Form' : 'Log Clinical Action'}</span>
                </button>
            </div>

            {/* Quick Add Form */}
            {showAddForm && (
                <form onSubmit={handleSaveAction} className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            Record New Care Event for {animal.name}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Recorded with local audit timestamp</span>
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">Action Category</label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORY_PRESETS.map((p) => {
                                const Icon = p.icon;
                                const isSelected = category === p.label;
                                return (
                                    <button
                                        key={p.label}
                                        type="button"
                                        onClick={() => {
                                            setCategory(p.label as TreatmentAction['category']);
                                            if (!title) {
                                                if (p.label === 'Pen Separation') setTitle('Separated into isolation pen');
                                                if (p.label === 'Medication') setTitle('Administered antipyretic medication');
                                                if (p.label === 'Hydration') setTitle('Oral fluid & electrolyte therapy');
                                                if (p.label === 'Physical Exam') setTitle('Stethoscope & rectal temperature check');
                                                if (p.label === 'Collar Fit') setTitle('Sensor readjustment & battery check');
                                            }
                                        }}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                            isSelected 
                                                ? `${p.color} ring-2 ring-teal-600/30 font-bold shadow-xs` 
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                        <span>{p.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title & Operator */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">Action Description / Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Moved to Quarantine Stall 2"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">Staff / Attending Veterinarian</label>
                            <input
                                type="text"
                                value={operator}
                                onChange={(e) => setOperator(e.target.value)}
                                placeholder="e.g. Dr. Reynolds or Caregiver Team"
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                            />
                        </div>
                    </div>

                    {/* Notes & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-700 block mb-1">Clinical Observations &amp; Notes</label>
                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Details: dosage, pen number, post-treatment response..."
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-teal-600"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-700 block mb-1">Initial Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value as TreatmentAction['status'])}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-600 cursor-pointer"
                            >
                                <option value="Completed">Completed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Scheduled">Scheduled</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                        >
                            Save Clinical Action
                        </button>
                    </div>
                </form>
            )}

            {/* Treatment Timeline List */}
            <div className="space-y-3">
                {actions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs font-medium m-0">No recorded clinical interventions yet.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Use the 'Log Clinical Action' button to record treatments, pen transfers, or vitals checks.</p>
                    </div>
                ) : (
                    actions.map((act) => {
                        const isCompleted = act.status === 'Completed';
                        const preset = CATEGORY_PRESETS.find(p => p.label === act.category) || CATEGORY_PRESETS[0];
                        const Icon = preset.icon;

                        return (
                            <div 
                                key={act.id} 
                                className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs"
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 border ${preset.color}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    <div className="space-y-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-900 tracking-tight">
                                                {act.title}
                                            </span>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                                {act.category}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-600 m-0 leading-relaxed">
                                            {act.notes}
                                        </p>

                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium pt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> {act.timestamp}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1 text-slate-500">
                                                <User className="h-3 w-3" /> {act.operator}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleStatus(act.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${
                                            isCompleted
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                        }`}
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        <span>{act.status}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteAction(act.id)}
                                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                        title="Delete Log Entry"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
