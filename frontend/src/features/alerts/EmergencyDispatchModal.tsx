import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, Copy, Check, ExternalLink, ShieldAlert, Smartphone, Laptop } from 'lucide-react';
import { useToast } from '../../shared/context/ToastContext';

interface EmergencyDispatchModalProps {
    mode: 'sms' | 'call';
    animalName: string;
    alertMessage: string;
    vetContact: string;
    onClose: () => void;
}

export const EmergencyDispatchModal: React.FC<EmergencyDispatchModalProps> = ({
    mode: initialMode,
    animalName,
    alertMessage,
    vetContact,
    onClose
}) => {
    const [mode, setMode] = useState<'sms' | 'call'>(initialMode);
    const [copiedField, setCopiedField] = useState<'number' | 'message' | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || '';
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            const isTouchScreen = window.matchMedia && window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches;
            setIsMobile(mobileRegex.test(userAgent) || isTouchScreen);
        };
        checkMobile();
    }, []);

    const dispatchText = `[MAVIS CLINICAL ALERT]\nSubject: ${animalName}\nCondition: ${alertMessage}\nTimestamp: ${new Date().toLocaleTimeString()} (Live Collar Telemetry)\nAction: Immediate veterinary inspection requested.`;

    const handleCopy = async (text: string, field: 'number' | 'message') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            showToast(field === 'number' ? 'Phone number copied to clipboard!' : 'Clinical alert message copied to clipboard!', 'success');
            setTimeout(() => setCopiedField(null), 2500);
        } catch (e) {
            showToast('Failed to copy to clipboard.', 'error');
        }
    };

    const cleanPhone = vetContact.replace(/[^\d+]/g, '');

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bento-card w-full max-w-lg bg-white p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in duration-200 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 m-0 font-display">Emergency Veterinary Dispatch</h3>
                            <p className="text-xs text-slate-500 font-normal m-0 mt-0.5">
                                Subject: <span className="font-semibold text-slate-800">{animalName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => setMode('sms')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition cursor-pointer ${
                            mode === 'sms' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <MessageSquare className="h-3.5 w-3.5 text-teal-600" /> Draft SMS / Text
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('call')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl transition cursor-pointer ${
                            mode === 'call' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                        <Phone className="h-3.5 w-3.5 text-rose-600" /> Direct Call
                    </button>
                </div>

                {/* Mode Content */}
                {mode === 'sms' ? (
                    <div className="space-y-3.5">
                        {/* Recipient Details */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                            <div>
                                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Recipient</span>
                                <span className="text-sm font-bold font-mono text-slate-900">{vetContact}</span>
                            </div>
                            <button
                                onClick={() => handleCopy(vetContact, 'number')}
                                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            >
                                {copiedField === 'number' ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy Number</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Pre-composed Clinical Message */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-slate-700">Pre-Composed Clinical Message</span>
                                <button
                                    onClick={() => handleCopy(dispatchText, 'message')}
                                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 transition cursor-pointer"
                                >
                                    {copiedField === 'message' ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                                            <span>Copied Text</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy All Text</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 selection:bg-teal-700">
                                {dispatchText}
                            </div>
                        </div>

                        {/* Smart Device-Aware Dispatch Actions */}
                        {isMobile ? (
                            <div className="space-y-2 pt-1">
                                <a
                                    href={`sms:${cleanPhone}?body=${encodeURIComponent(dispatchText)}`}
                                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer text-center"
                                >
                                    <Smartphone className="h-4 w-4" />
                                    <span>Open Native Messages App</span>
                                </a>
                                <a
                                    href={`https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(dispatchText)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer text-center"
                                >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    <span>Send via WhatsApp</span>
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleCopy(dispatchText, 'message')}
                                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
                                    >
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy Message to Clipboard</span>
                                    </button>
                                    <a
                                        href={`https://web.whatsapp.com/send?phone=${cleanPhone.replace('+', '')}&text=${encodeURIComponent(dispatchText)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer text-center"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                        <span>WhatsApp Web</span>
                                    </a>
                                </div>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
                                    <Laptop className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>To send via your phone&apos;s native SIM SMS, open MAVIS on your mobile browser over Wi-Fi.</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4 text-center py-2">
                        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">Attending Veterinary Contact</span>
                            <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                                {vetContact}
                            </div>
                            <p className="text-xs text-slate-500 m-0">
                                Designated emergency contact for {animalName}&apos;s herd registry
                            </p>
                        </div>

                        {isMobile ? (
                            <div className="space-y-2">
                                <a
                                    href={`tel:${cleanPhone}`}
                                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer text-center"
                                >
                                    <Phone className="h-4 w-4" />
                                    <span>Open Phone Dialer</span>
                                </a>
                                <button
                                    onClick={() => handleCopy(vetContact, 'number')}
                                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy Number</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleCopy(vetContact, 'number')}
                                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                                >
                                    {copiedField === 'number' ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 text-white" />
                                            <span>Phone Number Copied to Clipboard</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5" />
                                            <span>Copy Phone Number</span>
                                        </>
                                    )}
                                </button>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2 text-left">
                                    <Laptop className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span>To dial with 1 tap directly from your phone SIM, open MAVIS on your mobile browser over local Wi-Fi.</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Note */}
                <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    MAVIS Telemetry Engine • Emergency Care Protocol
                </div>
            </div>
        </div>
    );
};
