import React from 'react';
import { Activity, ShieldCheck, Cpu, Bell, Layers } from 'lucide-react';

interface NavbarProps {
    activeTab: 'dashboard' | 'animals' | 'alerts' | 'analytics' | 'twin';
    setActiveTab: (tab: 'dashboard' | 'animals' | 'alerts' | 'analytics' | 'twin') => void;
    activeAlertCount: number;
    role: 'user' | 'admin';
}

interface NavItem {
    id: 'dashboard' | 'animals' | 'alerts' | 'analytics' | 'twin';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
    activeTab,
    setActiveTab,
    activeAlertCount,
    role
}) => {
    const navItems: NavItem[] = [
        { id: 'dashboard', label: role === 'admin' ? 'Command Overview' : 'Dashboard', icon: Layers },
        { id: 'animals', label: role === 'admin' ? 'Subject Registry' : 'My Animals', icon: ShieldCheck },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'twin', label: 'Digital Twin', icon: Cpu },
        { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount },
    ];

    return (
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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

                {/* Active Navigation Pill */}
                <nav className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto max-w-full">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                                    isActive
                                        ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span>{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
};
