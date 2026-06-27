import React from 'react';
import type { AlertItem } from '../types';
import { updateAlertStatus } from '../services/api';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface AlertCenterProps {
    alerts: AlertItem[];
    onRefresh: () => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ alerts, onRefresh }) => {
    const handleAcknowledge = async (id: string) => {
        try {
            await updateAlertStatus(id, 'acknowledged');
            onRefresh();
        } catch (err) {
            console.error('Failed to acknowledge alert:', err);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await updateAlertStatus(id, 'resolved');
            onRefresh();
        } catch (err) {
            console.error('Failed to resolve alert:', err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="mavis-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white m-0">Live & Persistent Anomaly Feed</h2>
                        <p className="text-xs text-slate-400 m-0">Real-time alerts broadcast via Socket.IO and stored in MongoDB</p>
                    </div>
                </div>
                <div className="text-xs text-slate-400 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800">
                    Active Unresolved Alerts: <span className="text-red-400 font-bold">{alerts.filter(a => a.status === 'active').length}</span>
                </div>
            </div>

            <div className="space-y-4">
                {alerts.length === 0 ? (
                    <div className="mavis-card p-12 text-center text-slate-500">
                        <ShieldAlert className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold m-0">No active alerts currently recorded.</p>
                        <p className="text-xs text-slate-600 mt-1">Collar sensors and digital twin baselines are operating normally.</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        const animalName = typeof alert.animalId === 'object' ? alert.animalId.name : alert.animalId;
                        const isCritical = alert.severity === 'critical' || alert.type === 'ANOMALY';

                        return (
                            <div
                                key={alert._id}
                                className={`mavis-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 ${
                                    isCritical ? 'border-l-red-500 bg-red-950/20' : 'border-l-amber-500 bg-amber-950/20'
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isCritical ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                        {isCritical ? <AlertCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white">{animalName}</span>
                                            <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                {alert.type}
                                            </span>
                                            <span className="text-xs text-slate-500">• {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-300 m-0 leading-relaxed">{alert.message}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {alert.status === 'active' && (
                                        <button
                                            onClick={() => handleAcknowledge(alert._id)}
                                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
                                        >
                                            Acknowledge
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleResolve(alert._id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 text-xs font-bold border border-teal-500/30 transition"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark Resolved
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
