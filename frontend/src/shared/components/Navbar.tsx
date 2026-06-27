import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, Bell, Layers, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { UserSettingsModal } from '../../features/auth/components/UserSettingsModal';

interface NavbarProps {
    activeAlertCount: number;
    role: 'user' | 'admin';
}

interface NavItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeAlertCount, role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showSettings, setShowSettings] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems: NavItem[] = [
        { path: '/dashboard', label: role === 'admin' ? 'Command Overview' : 'Dashboard', icon: Layers },
        { path: '/animals', label: role === 'admin' ? 'Subject Registry' : 'My Animals', icon: ShieldCheck },
        { path: '/analytics', label: 'Analytics', icon: Activity },
        { path: '/twin', label: role === 'admin' ? 'Digital Twin Engine' : 'AI Health Profile', icon: Cpu },
        { path: '/alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount },
    ];

    return (
        <>
            <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
                            <Activity className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-black tracking-tight text-slate-900 m-0">M.A.V.I.S</h1>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    {role === 'admin' ? 'Admin Mode' : 'Pet Care View'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium m-0">Multi Model Animal Vitality Intelligence System</p>
                        </div>
                    </div>

                    {/* Navigation & User Profile Control */}
                    <div className="flex flex-wrap items-center gap-3">
                        <nav className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                                                isActive
                                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                                                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                <span>{item.label}</span>
                                                {item.badge !== undefined && item.badge > 0 && (
                                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>

                        {/* Separated User Name Pill, Settings Hamburger Button, and Circular Logout Button */}
                        {user && (
                            <div className="flex items-center gap-2 shrink-0">
                                {/* Username Pill with Hamburger Settings Icon */}
                                <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-200 text-xs font-semibold">
                                    <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                        <UserIcon className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>{user.name.split(' ')[0]}</span>
                                    </div>
                                    <button
                                        onClick={() => setShowSettings(true)}
                                        className="p-1 rounded-lg hover:bg-slate-200/80 text-slate-500 hover:text-slate-900 transition cursor-pointer ml-1"
                                        title="Workspace & Telemetry Settings"
                                    >
                                        <Settings className="h-3.5 w-3.5 text-slate-600" />
                                    </button>
                                </div>

                                {/* Circular Standalone Logout Button */}
                                <button
                                    onClick={handleLogout}
                                    className="p-2.5 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 transition cursor-pointer shadow-2xs"
                                    title="Log Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Settings Modal Popup */}
            {showSettings && (
                <UserSettingsModal onClose={() => setShowSettings(false)} />
            )}
        </>
    );
};
