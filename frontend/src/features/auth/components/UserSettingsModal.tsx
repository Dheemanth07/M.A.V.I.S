import React, { useState } from 'react';
import { X, User as UserIcon, Bell, Cpu, Lock, CheckCircle2, Phone, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserSettingsModalProps {
    onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ onClose }) => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'alerts' | 'mesh' | 'security'>('profile');

    // Profile Settings State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [vetPhone, setVetPhone] = useState('+1 (555) 234-5678');

    // Alert Settings State
    const [enableSms, setEnableSms] = useState(true);
    const [enableEmail, setEnableEmail] = useState(true);
    const [tempSensitivity, setTempSensitivity] = useState('1.0');
    const [hrThreshold, setHrThreshold] = useState('100');

    // Collar Mesh State
    const [syncInterval, setSyncInterval] = useState('5');
    const [batterySaver, setBatterySaver] = useState(false);

    // Password State
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [savedNotice, setSavedNotice] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSavedNotice(true);
        setTimeout(() => setSavedNotice(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bento-card w-full max-w-2xl bg-white p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 m-0">Workspace & Collar Settings</h3>
                        <p className="text-xs text-slate-500 font-medium m-0">Manage telemetry preferences, alert sensitivity, and profile credentials</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Settings Sub-Navigation Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <UserIcon className="h-3.5 w-3.5 text-emerald-600" /> Account & Vet
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('alerts')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Bell className="h-3.5 w-3.5 text-amber-600" /> Telemetry Alerts
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('mesh')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'mesh' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Cpu className="h-3.5 w-3.5 text-teal-600" /> Collar Mesh
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Lock className="h-3.5 w-3.5 text-indigo-600" /> Security
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    {/* TAB 1: PROFILE & VET CONTACT */}
                    {activeTab === 'profile' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-emerald-600" /> Emergency Veterinary Contact
                                </label>
                                <input
                                    type="text"
                                    value={vetPhone}
                                    onChange={(e) => setVetPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-emerald-600"
                                />
                                <p className="text-[11px] text-slate-400 mt-1 m-0">Auto-dialed when critical temperature anomalies persist over 15 minutes.</p>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TELEMETRY ALERTS */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 block">SMS Urgent Dispatch</span>
                                        <span className="text-[11px] text-slate-500 block">Receive instant text messages during critical fever spikes</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={enableSms}
                                        onChange={(e) => setEnableSms(e.target.checked)}
                                        className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                                    />
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 block">Email Daily Digest</span>
                                        <span className="text-[11px] text-slate-500 block">Summary report of learned baselines and vital stability</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={enableEmail}
                                        onChange={(e) => setEnableEmail(e.target.checked)}
                                        className="h-4 w-4 accent-emerald-600 rounded cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Temperature Alert Sensitivity</label>
                                    <select
                                        value={tempSensitivity}
                                        onChange={(e) => setTempSensitivity(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                                    >
                                        <option value="0.8">High (&gt;0.8°C deviation)</option>
                                        <option value="1.0">Standard (&gt;1.0°C deviation)</option>
                                        <option value="1.5">Moderate (&gt;1.5°C deviation)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Heart Rate Alert Trigger</label>
                                    <select
                                        value={hrThreshold}
                                        onChange={(e) => setHrThreshold(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                                    >
                                        <option value="90">High Rest (&gt;90 BPM)</option>
                                        <option value="100">Standard (&gt;100 BPM)</option>
                                        <option value="120">Heavy Exercise (&gt;120 BPM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: COLLAR MESH */}
                    {activeTab === 'mesh' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Live Stream Sync Interval</label>
                                <select
                                    value={syncInterval}
                                    onChange={(e) => setSyncInterval(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
                                >
                                    <option value="3">Ultra Fast (Every 3 seconds)</option>
                                    <option value="5">Standard IoT Stream (Every 5 seconds)</option>
                                    <option value="15">Balanced (Every 15 seconds)</option>
                                    <option value="30">Eco Mode (Every 30 seconds)</option>
                                </select>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                                <div>
                                    <span className="text-xs font-bold text-slate-900 block">Collar Battery Saver Mode</span>
                                    <span className="text-[11px] text-slate-500 block">Reduces GPS sampling frequency when animal is resting or lying down</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={batterySaver}
                                    onChange={(e) => setBatterySaver(e.target.checked)}
                                    className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                                />
                            </div>
                        </div>
                    )}

                    {/* TAB 4: SECURITY */}
                    {activeTab === 'security' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Current Password</label>
                                <input
                                    type="password"
                                    value={currentPass}
                                    onChange={(e) => setCurrentPass(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>
                    )}

                    {savedNotice && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Settings updated successfully!
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                            <Save className="h-3.5 w-3.5" /> Save Preferences
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
