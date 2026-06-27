import React from 'react';
import type { AlertItem } from '../../../shared/types';
import { updateAlertStatus } from '../../../shared/services/api';
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
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">Live & Persistent Alerts</h2>
                        <p className="text-xs text-slate-500 font-normal m-0">Real-time alerts broadcast via Socket.IO and stored in MongoDB</p>
                    </div>
                </div>
                <div className="text-xs text-slate-700 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 font-medium">
                    Active Unresolved Alerts: <span className="text-rose-600 font-bold">{alerts.filter(a => a && a.status === 'active').length}</span>
                </div>
            </div>

            <div className="space-y-4">
                {(!alerts || alerts.length === 0) ? (
                    <div className="bento-card p-12 text-center text-slate-500 bg-white">
                        <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-800 m-0">No active alerts currently recorded.</p>
                        <p className="text-xs text-slate-500 mt-1 font-normal">Collar sensors and digital twin baselines are operating normally.</p>
                    </div>
                ) : (
                    alerts.map((alert) => {
                        if (!alert) return null;

                        let animalName = 'Unknown Subject';
                        if (alert.animalId && typeof alert.animalId === 'object') {
                            animalName = alert.animalId.name || 'Subject';
                        } else if (typeof alert.animalId === 'string') {
                            animalName = alert.animalId;
                        }

                        const isCritical = alert.severity === 'critical' || alert.type === 'ANOMALY';

                        return (
                            <div
                                key={alert._id || String(Math.random())}
                                className={`bento-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 ${
                                    isCritical ? 'border-l-rose-500 bg-rose-50/40' : 'border-l-amber-500 bg-amber-50/40'
                                }`}
                            >
                                <div className="flex items-start gap-3.5">
                                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${isCritical ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                        {isCritical ? <AlertCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-slate-900">{animalName}</span>
                                            <span className={`text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                                {alert.type || 'ALERT'}
                                            </span>
                                            <span className="text-xs text-slate-400 font-normal">• {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-700 font-normal m-0 leading-relaxed">{alert.message}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {alert.status === 'active' && (
                                        <button
                                            onClick={() => handleAcknowledge(alert._id)}
                                            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer"
                                        >
                                            Acknowledge
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleResolve(alert._id)}
                                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition cursor-pointer"
                                    >
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Mark Resolved
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
