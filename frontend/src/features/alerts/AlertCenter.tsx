import React, { useState } from 'react';
import type { AlertItem } from '../../shared/types';
import { updateAlertStatus } from '../../shared/services/api';
import { useToast } from '../../shared/context/ToastContext';
import { useAuth } from '../auth/context/AuthContext';
import { EmergencyDispatchModal } from './EmergencyDispatchModal';
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert, Clock, Eye, Phone, MessageSquare } from 'lucide-react';

interface AlertCenterProps {
    alerts: AlertItem[];
    onRefresh: () => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ alerts, onRefresh }) => {
    const { showToast } = useToast();
    const { user } = useAuth();
    const [dispatchModal, setDispatchModal] = useState<{ mode: 'sms' | 'call'; animalName: string; alertMessage: string } | null>(null);

    const handleAcknowledge = async (id: string) => {
        try {
            await updateAlertStatus(id, 'acknowledged');
            showToast('Alert acknowledged — moved to Under Review.', 'info');
            onRefresh();
        } catch (err) {
            console.error('Failed to acknowledge alert:', err);
            showToast('Failed to acknowledge alert.', 'error');
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await updateAlertStatus(id, 'resolved');
            showToast('Alert marked resolved and removed from the queue.', 'success');
            onRefresh();
        } catch (err) {
            console.error('Failed to resolve alert:', err);
            showToast('Failed to resolve alert.', 'error');
        }
    };

    const activeAlerts       = alerts.filter(a => a?.status === 'active');
    const acknowledgedAlerts = alerts.filter(a => a?.status === 'acknowledged');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bento-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">Live &amp; Persistent Alerts</h2>
                        <p className="text-xs text-slate-500 font-normal m-0">Real-time alerts broadcast via Socket.IO and stored in MongoDB</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="text-xs text-slate-700 bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 font-semibold">
                        Unreviewed: <span className="text-rose-600 font-bold">{activeAlerts.length}</span>
                    </div>
                    {acknowledgedAlerts.length > 0 && (
                        <div className="text-xs text-slate-700 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-200 font-semibold">
                            Under Review: <span className="text-blue-600 font-bold">{acknowledgedAlerts.length}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert List */}
            <div className="space-y-4">
                {(!alerts || alerts.length === 0) ? (
                    <div className="bento-card p-12 text-center text-slate-500 bg-white">
                        <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-800 m-0">No active alerts currently recorded.</p>
                        <p className="text-xs text-slate-500 mt-1 font-normal">Collar sensors and digital twin baselines are operating normally.</p>
                    </div>
                ) : (
                    <>
                        {/* ── ACTIVE ALERTS (need attention) ─────────────────── */}
                        {activeAlerts.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-rose-600 px-1">
                                    Needs Attention ({activeAlerts.length})
                                </p>
                                {activeAlerts.map((alert) => {
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
                                            key={alert._id}
                                            className={`bento-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 ${
                                                isCritical ? 'border-l-rose-500 bg-rose-50/40' : 'border-l-amber-500 bg-amber-50/40'
                                            }`}
                                        >
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
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

                                                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center w-full sm:w-auto justify-end flex-wrap">
                                                    {isCritical && user?.vetContact && (
                                                        <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-slate-200 shadow-2xs">
                                                            <button
                                                                type="button"
                                                                onClick={() => setDispatchModal({ mode: 'sms', animalName, alertMessage: alert.message })}
                                                                className="h-8 px-3 rounded-full bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-semibold flex items-center gap-1.5 border border-slate-200 hover:border-teal-300 transition-all duration-200 cursor-pointer group"
                                                                title={`Open SMS Dispatch for ${user.vetContact}`}
                                                            >
                                                                <MessageSquare className="h-3.5 w-3.5 text-slate-500 group-hover:text-teal-600 transition" />
                                                                <span>Draft SMS</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDispatchModal({ mode: 'call', animalName, alertMessage: alert.message })}
                                                                className="h-8 px-3 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 text-xs font-semibold flex items-center gap-1.5 border border-rose-200 hover:border-rose-300 transition-all duration-200 cursor-pointer group"
                                                                title={`Emergency Call ${user.vetContact}`}
                                                            >
                                                                <Phone className="h-3.5 w-3.5 text-rose-600 group-hover:text-rose-800 transition" />
                                                                <span>Call Vet</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleAcknowledge(alert._id)}
                                                        className="h-9 px-4 rounded-full bg-slate-100 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-200/80 transition-all duration-200 hover:shadow-sm cursor-pointer whitespace-nowrap"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>Acknowledge</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolve(alert._id)}
                                                        className="h-9 px-4 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200/90 transition-all duration-200 hover:shadow-sm cursor-pointer whitespace-nowrap shadow-2xs"
                                                    >
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                        <span>Mark Resolved</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* ── ACKNOWLEDGED / UNDER REVIEW ────────────────────── */}
                        {acknowledgedAlerts.length > 0 && (
                            <div className="space-y-3 mt-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-blue-600 px-1">
                                    Under Review ({acknowledgedAlerts.length})
                                </p>
                                {acknowledgedAlerts.map((alert) => {
                                    if (!alert) return null;
                                    let animalName = 'Unknown Subject';
                                    if (alert.animalId && typeof alert.animalId === 'object') {
                                        animalName = alert.animalId.name || 'Subject';
                                    } else if (typeof alert.animalId === 'string') {
                                        animalName = alert.animalId;
                                    }

                                    return (
                                        <div
                                            key={alert._id}
                                            className="bento-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-blue-400 bg-blue-50/30 opacity-90"
                                        >
                                            <div className="flex items-start gap-3.5">
                                                <div className="p-2.5 rounded-xl shrink-0 mt-0.5 bg-blue-100 text-blue-600">
                                                    <Clock className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-semibold text-slate-800">{animalName}</span>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                                            UNDER REVIEW
                                                        </span>
                                                        <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                                            {alert.type || 'ALERT'}
                                                        </span>
                                                        <span className="text-xs text-slate-400 font-normal">• {new Date(alert.createdAt || Date.now()).toLocaleTimeString()}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-normal m-0 leading-relaxed">{alert.message}</p>
                                                    <p className="text-[10px] text-blue-500 font-semibold mt-1 m-0">
                                                        Acknowledged — awaiting confirmation that the issue has been addressed.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center w-full sm:w-auto justify-end">
                                                <button
                                                    onClick={() => handleResolve(alert._id)}
                                                    className="h-9 px-4 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200/90 transition-all duration-200 hover:shadow-sm cursor-pointer whitespace-nowrap shadow-2xs"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                                    <span>Mark Resolved</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Custom Styled Emergency Dispatch Modal */}
            {dispatchModal && user?.vetContact && (
                <EmergencyDispatchModal
                    mode={dispatchModal.mode}
                    animalName={dispatchModal.animalName}
                    alertMessage={dispatchModal.alertMessage}
                    vetContact={user.vetContact}
                    onClose={() => setDispatchModal(null)}
                />
            )}
        </div>
    );
};
