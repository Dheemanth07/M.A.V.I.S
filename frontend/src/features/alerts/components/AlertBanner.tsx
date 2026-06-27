import React from 'react';
import { AlertTriangle, X, HeartPulse } from 'lucide-react';
import type { AlertItem } from '../../../shared/types';

interface AlertBannerProps {
    alert: AlertItem | null;
    onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss }) => {
    if (!alert) return null;

    const isAnomaly = alert.type === 'ANOMALY' || alert.severity === 'critical';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4">
            <div className={`p-4 rounded-2xl flex items-center justify-between gap-4 shadow-sm border ${
                isAnomaly ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isAnomaly ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                        {isAnomaly ? <HeartPulse className="h-5 w-5 animate-bounce" /> : <AlertTriangle className="h-5 w-5" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm">Vital Update Alert</span>
                            <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                isAnomaly ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
                            }`}>
                                {alert.type}
                            </span>
                        </div>
                        <p className="text-xs mt-0.5 text-slate-700 font-medium m-0">{alert.message}</p>
                    </div>
                </div>

                <button
                    onClick={onDismiss}
                    className="p-1.5 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition"
                    title="Dismiss notification"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
