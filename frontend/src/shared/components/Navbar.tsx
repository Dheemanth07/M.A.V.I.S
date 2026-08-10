import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Cpu, Bell, Layers, LogOut, User as UserIcon, Settings, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { UserSettingsModal } from '../../features/auth/UserSettingsModal';
import { useToast } from '../context/ToastContext';

interface NavbarProps {
    activeAlertCount: number;
    role: 'user' | 'admin';
    accountRole: 'user' | 'admin';
    setRole: (role: 'user' | 'admin') => void;
    connected: boolean;
}

interface NavItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeAlertCount, role, accountRole, setRole }) => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [showSettings, setShowSettings] = useState(false);

    const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});
    const [pillStyle, setPillStyle] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

    const handleLogout = () => {
        logout();
        showToast('Logged out successfully. Session ended.', 'info');
        navigate('/');
    };

    const navItems: NavItem[] = [
        { path: '/dashboard', label: role === 'admin' ? 'Overview' : 'Dashboard', icon: Layers },
        { path: '/animals', label: role === 'admin' ? 'Subject Registry' : 'My Animals', icon: ShieldCheck },
        { path: '/analytics', label: 'Analytics', icon: Activity },
        { path: '/twin', label: role === 'admin' ? 'Digital Twin' : 'Health Profile', icon: Cpu },
        { path: '/alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount },
    ];

    const updatePill = () => {
        const currentPath = location.pathname;
        const activeEl = itemRefs.current[currentPath] || Object.values(itemRefs.current).find(el => el && el.getAttribute('href') === currentPath);
        if (activeEl) {
            setPillStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
                opacity: 1,
            });
        }
    };

    useEffect(() => {
        updatePill();
        window.addEventListener('resize', updatePill);
        return () => window.removeEventListener('resize', updatePill);
    }, [location.pathname, role]);

    return (
        <>
            <div className="sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-4 sm:px-8 w-full">
                <header className="bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-6 py-2.5 flex items-center justify-between gap-6 transition-all duration-300">
                    
                    {/* Left: Logo & App Name */}
                    <div className="flex items-center gap-2.5 shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img 
                            src="/logo.svg" 
                            alt="MAVIS Logo" 
                            className="h-9 w-9 rounded-full shadow-md shadow-teal-700/20 shrink-0 transition-transform duration-300 hover:scale-105" 
                        />
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 m-0 font-display">
                            M.A.V.I.S
                        </h1>
                    </div>

                    {/* Middle: Selection of Pages (Smooth Sliding Window Capsule) */}
                    <nav className="relative hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/80">
                        {/* Smooth Sliding Active Highlight Window */}
                        <div
                            className="absolute h-[calc(100%-8px)] rounded-full bg-white shadow-sm border border-slate-200/90 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none"
                            style={{
                                left: `${pillStyle.left}px`,
                                width: `${pillStyle.width}px`,
                                opacity: pillStyle.opacity,
                            }}
                        />

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    ref={(el) => { itemRefs.current[item.path] = el; }}
                                    className={({ isActive }) =>
                                        `relative z-10 flex items-center gap-2 px-4 py-2 rounded-full text-xs transition-colors duration-300 whitespace-nowrap ${
                                            isActive
                                                ? 'text-slate-900 font-bold'
                                                : 'text-slate-600 hover:text-slate-900 font-medium'
                                        }`
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <Icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? 'text-teal-700 font-semibold' : 'text-slate-400'}`} />
                                            <span>{item.label}</span>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white shadow-xs">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Right: Role Switcher & User Profile Controls (Circular Stadium Align) */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* Admin / Owner Role Switcher Toggle */}
                        {accountRole === 'admin' && (
                            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200 text-xs">
                                <button
                                    onClick={() => setRole('user')}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                                        role === 'user'
                                            ? 'bg-white text-emerald-800 shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Owner
                                </button>
                                <button
                                    onClick={() => setRole('admin')}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer ${
                                        role === 'admin'
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Shield className="h-3.5 w-3.5" /> Vet Admin
                                </button>
                            </div>
                        )}

                        {/* User Profile Avatar & Controls */}
                        {user && (
                            <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-full border border-slate-200">
                                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 text-xs font-semibold text-slate-800 shadow-2xs">
                                    <UserIcon className="h-3.5 w-3.5 text-teal-700" />
                                    <span>{user.name.split(' ')[0]}</span>
                                </div>

                                <button
                                    onClick={() => setShowSettings(true)}
                                    className="p-2 rounded-full hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-all duration-200 cursor-pointer hover:scale-105"
                                    title="Settings"
                                >
                                    <Settings className="h-4 w-4" />
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="p-2 rounded-full hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all duration-200 hover:scale-105 cursor-pointer"
                                    title="Log Out"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Mobile Navigation Drawer for small screens */}
                <nav className="md:hidden flex items-center justify-around bg-white/90 backdrop-blur-xl border border-slate-200/90 shadow-sm rounded-full p-2 mt-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1 p-2 rounded-full text-[10px] font-bold transition-all ${
                                        isActive ? 'text-teal-700 bg-teal-50' : 'text-slate-500'
                                    }`
                                }
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Settings Modal Popup */}
            {showSettings && (
                <UserSettingsModal onClose={() => setShowSettings(false)} />
            )}
        </>
    );
};
