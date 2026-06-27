import React from 'react';
import { Activity, ShieldCheck, Cpu, Bell, Layers, Radio } from 'lucide-react';

interface NavbarProps {
    activeTab: 'overview' | 'herd' | 'analytics' | 'twin' | 'alerts';
    setActiveTab: (tab: 'overview' | 'herd' | 'analytics' | 'twin' | 'alerts') => void;
    connected: boolean;
    activeAlertCount: number;
}

interface NavItem {
    id: 'overview' | 'herd' | 'analytics' | 'twin' | 'alerts';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
    activeTab,
    setActiveTab,
    connected,
    activeAlertCount
}) => {
    const navItems: NavItem[] = [
        { id: 'overview', label: 'Overview', icon: Layers },
        { id: 'herd', label: 'Herd Registry', icon: ShieldCheck },
        { id: 'analytics', label: 'Analytics & Trends', icon: Activity },
        { id: 'twin', label: 'Digital Twin', icon: Cpu },
        { id: 'alerts', label: 'Live Alerts', icon: Bell, badge: activeAlertCount },
    ];

    return (
        <header className="sticky top-0 z-50 bg-[#0b0f17]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Brand Logo & Connection State */}
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0d6b5f] to-[#14b8a6] flex items-center justify-center shadow-lg shadow-[#0d6b5f]/20">
                        <Activity className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight text-white m-0">M.A.V.I.S</h1>
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">v2.0 Twin</span>
                        </div>
                        <p className="text-xs text-slate-400 m-0">Autonomous Livestock Telemetry</p>
                    </div>
                </div>

                {/* Navigation Tabs (InsightPay TopNav style) */}
                <nav className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                                    isActive
                                        ? 'bg-[#0d6b5f] text-white shadow-md shadow-[#0d6b5f]/30'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                                {item.badge !== undefined && item.badge > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500 text-white">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Socket Status Pulse */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <Radio className={`h-3.5 w-3.5 ${connected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className="font-medium">{connected ? 'Live Stream Active' : 'Connecting Server...'}</span>
                </div>
            </div>
        </header>
    );
};
