import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Bell, Cpu, Lock, CheckCircle2, Phone, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';

interface UserSettingsModalProps {
    onClose: () => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ onClose }) => {
    const { user, updateUser, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'alerts' | 'mesh' | 'security'>('profile');

    // Profile Settings State
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [vetPhone, setVetPhone] = useState(user?.vetContact || '');

    // Alert Settings State
    const [soundAlerts, setSoundAlerts] = useState(user?.alertSettings?.soundAlerts ?? true);
    const [tempSensitivity, setTempSensitivity] = useState(String(user?.alertSettings?.tempSensitivity ?? '1.0'));
    const [hrThreshold, setHrThreshold] = useState(String(user?.alertSettings?.hrThreshold ?? '100'));

    // Collar Mesh State
    const [syncInterval, setSyncInterval] = useState(String(user?.collarSettings?.syncInterval ?? '5'));
    const [motionSensitivity, setMotionSensitivity] = useState(user?.collarSettings?.motionSensitivity ?? 'standard');

    // Password State
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');

    // Status State
    const [saving, setSaving] = useState(false);
    const [savedNotice, setSavedNotice] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setVetPhone(user.vetContact || '');
            if (user.alertSettings) {
                setSoundAlerts(user.alertSettings.soundAlerts ?? true);
                setTempSensitivity(String(user.alertSettings.tempSensitivity ?? '1.0'));
                setHrThreshold(String(user.alertSettings.hrThreshold ?? '100'));
            }
            if (user.collarSettings) {
                setSyncInterval(String(user.collarSettings.syncInterval ?? '5'));
                setMotionSensitivity(user.collarSettings.motionSensitivity ?? 'standard');
            }
        }
    }, [user]);

    const handleSaveProfileAndPreferences = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        setErrorMessage(null);
        setSavedNotice(null);

        try {
            if (activeTab === 'security') {
                if (!currentPass || !newPass) {
                    setErrorMessage('Please provide both current and new password');
                    setSaving(false);
                    return;
                }
                const res = await fetch(`http://localhost:5000/api/auth/password/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Failed to update password');

                setCurrentPass('');
                setNewPass('');
                setSavedNotice('Password updated securely in database.');
            } else {
                const payload = {
                    name,
                    email,
                    vetContact: vetPhone.trim(),
                    alertSettings: {
                        soundAlerts,
                        tempSensitivity: parseFloat(tempSensitivity),
                        hrThreshold: parseInt(hrThreshold, 10),
                    },
                    collarSettings: {
                        syncInterval: parseInt(syncInterval, 10),
                        motionSensitivity,
                    },
                };

                const res = await fetch(`http://localhost:5000/api/auth/profile/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.message || 'Failed to update settings');

                if (json.data?.user) {
                    updateUser(json.data.user);
                } else {
                    updateUser(payload);
                }
                await refreshProfile();
                setSavedNotice('Preferences saved to MongoDB database.');
            }

            setTimeout(() => setSavedNotice(null), 3500);
        } catch (err: any) {
            setErrorMessage(err.message || 'An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bento-card w-full max-w-2xl bg-white p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in duration-200">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 m-0 font-display">Workspace &amp; Collar Settings</h3>
                        <p className="text-xs text-slate-500 font-medium m-0 mt-0.5">
                            Manage telemetry preferences, alert sensitivity, and profile credentials
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Settings Sub-Navigation Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => { setActiveTab('profile'); setErrorMessage(null); setSavedNotice(null); }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <UserIcon className="h-3.5 w-3.5 text-teal-600" /> Account &amp; Vet
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('alerts'); setErrorMessage(null); setSavedNotice(null); }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'alerts' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Bell className="h-3.5 w-3.5 text-amber-600" /> Telemetry Alerts
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('mesh'); setErrorMessage(null); setSavedNotice(null); }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'mesh' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Cpu className="h-3.5 w-3.5 text-emerald-600" /> Collar Mesh &amp; Polling
                    </button>
                    <button
                        type="button"
                        onClick={() => { setActiveTab('security'); setErrorMessage(null); setSavedNotice(null); }}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                            activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Lock className="h-3.5 w-3.5 text-indigo-600" /> Security
                    </button>
                </div>

                <form onSubmit={handleSaveProfileAndPreferences} className="space-y-4">
                    {/* TAB 1: PROFILE & VET CONTACT */}
                    {activeTab === 'profile' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-teal-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@mavis.local"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-teal-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-teal-600" /> Emergency Veterinary Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={vetPhone}
                                    onChange={(e) => setVetPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000 or +91 9876543210"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-teal-600"
                                />
                                <p className="text-[11px] text-slate-500 mt-1 m-0">
                                    Used for 1-click offline SMS dispatch &amp; emergency dialing when critical vital anomalies are detected.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: TELEMETRY ALERTS */}
                    {activeTab === 'alerts' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 block">Audio Warning Chime</span>
                                        <span className="text-[11px] text-slate-500 block">Play an audible chime when an animal triggers critical clinical deviations</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={soundAlerts}
                                        onChange={(e) => setSoundAlerts(e.target.checked)}
                                        className="h-4 w-4 accent-teal-600 rounded cursor-pointer"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60">
                                    <div>
                                        <span className="text-xs font-bold text-slate-900 block">Browser Desktop Notifications</span>
                                        <span className="text-[11px] text-slate-500 block">Receive native OS popup notifications for urgent anomalies</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if ('Notification' in window) {
                                                const perm = await Notification.requestPermission();
                                                if (perm === 'granted') {
                                                    setSavedNotice('Browser notifications enabled.');
                                                    setTimeout(() => setSavedNotice(null), 3000);
                                                }
                                            }
                                        }}
                                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-teal-800 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                                    >
                                        {'Notification' in window && Notification.permission === 'granted' ? 'Enabled' : 'Allow Access'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Temperature Alert Trigger</label>
                                    <select
                                        value={tempSensitivity}
                                        onChange={(e) => setTempSensitivity(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
                                    >
                                        <option value="0.8">High Sensitivity (&gt;0.8°C deviation)</option>
                                        <option value="1.0">Standard (&gt;1.0°C deviation)</option>
                                        <option value="1.5">Moderate (&gt;1.5°C deviation)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-700 mb-1 block">Heart Rate Alert Trigger</label>
                                    <select
                                        value={hrThreshold}
                                        onChange={(e) => setHrThreshold(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
                                    >
                                        <option value="90">Resting High (&gt;90 BPM)</option>
                                        <option value="100">Standard (&gt;100 BPM)</option>
                                        <option value="120">Exertion Spike (&gt;120 BPM)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 3: COLLAR MESH & POLLING */}
                    {activeTab === 'mesh' && (
                        <div className="space-y-4 animate-in fade-in duration-200">
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">Live Telemetry Sync Interval</label>
                                <select
                                    value={syncInterval}
                                    onChange={(e) => setSyncInterval(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
                                >
                                    <option value="3">Fast Polling (Every 3 seconds)</option>
                                    <option value="5">Standard IoT Stream (Every 5 seconds)</option>
                                    <option value="10">Balanced (Every 10 seconds)</option>
                                    <option value="30">Low Overhead (Every 30 seconds)</option>
                                </select>
                                <p className="text-[11px] text-slate-500 mt-1 m-0">Controls how frequently the frontend polls collar telemetry from the backend.</p>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">MPU6050 Motion Activity Sensitivity</label>
                                <select
                                    value={motionSensitivity}
                                    onChange={(e) => setMotionSensitivity(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:border-teal-600 cursor-pointer"
                                >
                                    <option value="high">High Sensitivity (Detects subtle head and neck twitching)</option>
                                    <option value="standard">Standard (Detects standing, walking, lying down)</option>
                                    <option value="low">Low Noise Filter (Only major posture changes)</option>
                                </select>
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
                                    placeholder="Enter current password"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-700 mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    placeholder="Enter new password (min. 6 characters)"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:border-indigo-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Status Messages */}
                    {savedNotice && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" /> {savedNotice}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" /> {errorMessage}
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                        >
                            Close
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-3.5 w-3.5" /> Save Preferences
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
