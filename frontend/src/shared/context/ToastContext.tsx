import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'success') => {
        const id = String(Date.now() + Math.random());
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Floating Toast Container */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => {
                    let icon = <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
                    let borderClass = 'border-emerald-200/80 bg-white/95 text-slate-900';
                    let bgIconClass = 'bg-emerald-50 text-emerald-600 border border-emerald-100';

                    if (toast.type === 'warning') {
                        icon = <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
                        borderClass = 'border-amber-200/80 bg-white/95 text-slate-900';
                        bgIconClass = 'bg-amber-50 text-amber-600 border border-amber-100';
                    } else if (toast.type === 'error') {
                        icon = <XCircle className="h-5 w-5 text-rose-600 shrink-0" />;
                        borderClass = 'border-rose-200/80 bg-white/95 text-slate-900';
                        bgIconClass = 'bg-rose-50 text-rose-600 border border-rose-100';
                    } else if (toast.type === 'info') {
                        icon = <Info className="h-5 w-5 text-blue-600 shrink-0" />;
                        borderClass = 'border-blue-200/80 bg-white/95 text-slate-900';
                        bgIconClass = 'bg-blue-50 text-blue-600 border border-blue-100';
                    }

                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto p-4 rounded-2xl border ${borderClass} shadow-lg backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`p-2 rounded-xl shrink-0 ${bgIconClass}`}>
                                    {icon}
                                </div>
                                <span className="text-xs font-semibold leading-snug">{toast.message}</span>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
