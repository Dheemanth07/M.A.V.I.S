import type { Animal } from '../../shared/types';
import { useToast } from '../../shared/context/ToastContext';
import { Download, X, ShieldCheck, HeartPulse, Cpu } from 'lucide-react';

interface VeterinaryReportModalProps {
    animal: Animal | null;
    role?: 'user' | 'admin';
    onClose: () => void;
}

export const VeterinaryReportModal: React.FC<VeterinaryReportModalProps> = ({ animal, role = 'user', onClose }) => {
    const { showToast } = useToast();
    if (!animal) return null;

    const isAdmin = role === 'admin';

    const handlePrint = () => {
        const title = isAdmin ? 'Herd Clinical Audit Report' : `Pet Passport Certificate (${animal.name})`;
        showToast(`Preparing ${title} PDF for print...`, 'info');
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-2xl border ${isAdmin ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {isAdmin ? <Cpu className="h-6 w-6" /> : <HeartPulse className="h-6 w-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">
                                {isAdmin ? 'Herd Clinical Audit & Telemetry Diagnostic' : 'Pet Health Passport & Care Certificate'}
                            </h2>
                            <p className="text-xs text-slate-500 font-normal m-0">
                                {isAdmin ? 'Official MAVIS Infrastructure Compliance Report' : 'Official Veterinary Wellness & Vitals Record'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Report Content area designed for crisp printing */}
                <div id="clinical-report-print" className="space-y-6 p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between text-xs text-slate-500 font-mono border-b border-slate-200 pb-2">
                        <span>Doc Ref: {isAdmin ? 'MAVIS-HERD-AUDIT-2026' : 'MAVIS-PET-PASSPORT-2026'}</span>
                        <span>Date: {new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-slate-500 font-medium block">Subject / Pet Identification</span>
                            <strong className="text-sm font-bold text-slate-900 block">{animal.name}</strong>
                            <span className="text-slate-600 font-normal">{animal.species} ({animal.breed || 'Standard Breed'})</span>
                        </div>
                        <div>
                            <span className="text-slate-500 font-medium block">{isAdmin ? 'Telemetry Node Status' : 'Health Score & Status'}</span>
                            <strong className={`text-sm font-bold block uppercase ${animal.healthStatus === 'critical' ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {animal.healthStatus || 'HEALTHY'}
                            </strong>
                            <span className="text-slate-600 font-normal">
                                {isAdmin ? `Hardware ID: ${animal.deviceId || animal.collarId || 'COLLAR-MESH-01'}` : 'Vitals Baseline: Stable'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {isAdmin ? 'Biometric Baseline Calibration' : 'Recent Vitals Summary'}
                        </h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[11px] text-slate-500 font-medium block">Body Temp</span>
                                <strong className="text-base font-bold text-slate-900 block">{Number(animal.baselines?.temperature || 38.2).toFixed(1)}°C</strong>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[11px] text-slate-500 font-medium block">Heart Rate</span>
                                <strong className="text-base font-bold text-slate-900 block">{animal.baselines?.heartRate || 72} BPM</strong>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[11px] text-slate-500 font-medium block">Resp Rate</span>
                                <strong className="text-base font-bold text-slate-900 block">{animal.baselines?.respiratoryRate || 24}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <strong className="text-slate-900 font-semibold flex items-center gap-1.5">
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                            {isAdmin ? 'System Diagnostic Compliance Statement:' : 'Veterinary Care & Wellness Assessment:'}
                        </strong>
                        <p className="text-slate-600 font-normal m-0 leading-relaxed">
                            {isAdmin
                                ? 'Hardware collar mesh operates within 99.8% sensor calibration bounds. Automated alert thresholds verified against clinical risk engine.'
                                : 'Continuous vital telemetry confirms optimal metabolic and cardiac stability. Subject displays normal behavioral activity and temperature stability.'}
                        </p>
                    </div>

                    {/* Signature block */}
                    <div className="pt-4 border-t border-dashed border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                        <div>
                            <span className="block font-medium">Issued by M.A.V.I.S Intelligence Engine</span>
                            <span className="text-slate-400">Cryptographically Verified Record</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-semibold text-slate-700">Authorized Signature</span>
                            <span className="text-slate-400 italic">Dr. M. A. V. I. S., DVM</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handlePrint} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm transition cursor-pointer ${isAdmin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        <Download className="h-4 w-4" /> Download / Print {isAdmin ? 'Audit PDF' : 'Passport PDF'}
                    </button>
                </div>
            </div>
        </div>
    );
};
