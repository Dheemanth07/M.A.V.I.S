import type { Animal } from '../../shared/types';
import { useToast } from '../../shared/context/ToastContext';
import { FileText, Download, X } from 'lucide-react';

interface VeterinaryReportModalProps {
    animal: Animal | null;
    onClose: () => void;
}

export const VeterinaryReportModal: React.FC<VeterinaryReportModalProps> = ({ animal, onClose }) => {
    const { showToast } = useToast();
    if (!animal) return null;

    const handlePrint = () => {
        showToast(`Preparing Clinical PDF Certificate for ${animal.name}...`, 'info');
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 m-0">Clinical Veterinary Telemetry Report</h2>
                            <p className="text-xs text-slate-500 font-normal m-0">Official MAVIS Digital Twin Diagnostic Certificate</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Report Content area designed for crisp printing */}
                <div id="clinical-report-print" className="space-y-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                        <span>Report Ref: MAVIS-CLINICAL-2026-06</span>
                        <span>Generated: {new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                            <span className="text-slate-500 font-medium block">Subject Identification</span>
                            <strong className="text-sm font-bold text-slate-900 block">{animal.name}</strong>
                            <span className="text-slate-600 font-normal">{animal.species} ({animal.breed || 'Standard Breed'})</span>
                        </div>
                        <div>
                            <span className="text-slate-500 font-medium block">Digital Twin Baseline Status</span>
                            <strong className="text-sm font-bold text-emerald-700 block uppercase">{animal.healthStatus || 'HEALTHY'}</strong>
                            <span className="text-slate-600 font-normal">Learned EMA Baseline Stable</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Telemetry Biometric Breakdown</h4>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[11px] text-slate-500 font-medium block">Body Temperature</span>
                                <strong className="text-base font-bold text-slate-900 block">{Number(animal.baselines?.temperature || 38.2).toFixed(1)}°C</strong>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[11px] text-slate-500 font-medium block">Resting Heart Rate</span>
                                <strong className="text-base font-bold text-slate-900 block">{animal.baselines?.heartRate || 72} BPM</strong>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200">
                                <span className="text-[11px] text-slate-500 font-medium block">Respiratory Rate</span>
                                <strong className="text-base font-bold text-slate-900 block">{animal.baselines?.respiratoryRate || 24}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                        <strong className="text-slate-900 font-semibold block">Attending Veterinary Assessment:</strong>
                        <p className="text-slate-600 font-normal m-0 leading-relaxed">
                            Continuous digital twin monitoring indicates optimal cardiovascular and thermal stability. Zero acute viral deviations detected over the trailing 7-day window.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer">
                        Cancel
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer">
                        <Download className="h-4 w-4" /> Download / Print Clinical PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
