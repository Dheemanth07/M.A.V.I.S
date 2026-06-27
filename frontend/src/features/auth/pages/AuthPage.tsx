import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, UserCheck, Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

export const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRoleState] = useState<'user' | 'admin'>('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password, role);
            }
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
            <div className="w-full max-w-md space-y-6 animate-in fade-in zoom-in duration-300">
                {/* Brand Logo Header */}
                <div className="text-center space-y-2">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white mx-auto">
                        <Activity className="h-7 w-7" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight m-0">M.A.V.I.S</h1>
                    <p className="text-xs text-slate-500 font-semibold m-0">Multi Model Animal Vitality Intelligence System</p>
                </div>

                {/* Main Auth Card */}
                <div className="bento-card p-6 sm:p-8 bg-white shadow-xl space-y-6">
                    {/* Toggle Tabs (Login / Register) */}
                    <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`py-2 rounded-xl transition cursor-pointer ${
                                isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Log In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`py-2 rounded-xl transition cursor-pointer ${
                                !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                            }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Alex Morgan"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="alex@mavis.care"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Account Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setRoleState('user')}
                                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                            role === 'user' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Pet Owner
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRoleState('admin')}
                                        className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                            role === 'admin' ? 'border-indigo-500 bg-indigo-50 text-indigo-800' : 'border-slate-200 bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Admin / Vet
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                        >
                            {loading ? (
                                'Authenticating...'
                            ) : (
                                <>
                                    {isLogin ? 'Log In to Workspace' : 'Create Account'}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-slate-400 font-semibold m-0">
                    Protected by MAVIS Encrypted Workspace Auth
                </p>
            </div>
        </div>
    );
};
