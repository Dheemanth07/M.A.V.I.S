import React from 'react';
import { UserCheck, Shield, Radio } from 'lucide-react';

interface RoleHeaderProps {
    role: 'user' | 'admin';
    setRole: (role: 'user' | 'admin') => void;
    connected: boolean;
}

export const RoleHeader: React.FC<RoleHeaderProps> = ({ role, setRole, connected }) => {
    return (
        <div className="bg-slate-900 text-slate-100 px-4 sm:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-400">Testing Environment Control:</span>
                <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
                    <button
                        onClick={() => setRole('user')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                            role === 'user'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <UserCheck className="h-3.5 w-3.5" /> Farmer / Owner View
                    </button>
                    <button
                        onClick={() => setRole('admin')}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
                            role === 'admin'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Shield className="h-3.5 w-3.5" /> Admin / Vet Control
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
                <Radio className={`h-3.5 w-3.5 ${connected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                <span className="font-medium">{connected ? 'Hardware Stream Active' : 'Connecting Server...'}</span>
            </div>
        </div>
    );
};
