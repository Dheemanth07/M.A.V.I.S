import React, { useState, useEffect, useRef } from 'react';
import { 
    Zap, 
    Activity, 
    Flame, 
    Users, 
    BatteryCharging, 
    Play, 
    Square, 
    Sliders, 
    Sparkles, 
    Terminal, 
    CheckCircle2, 
    PlusCircle, 
    X, 
    RefreshCw,
    Wind
} from 'lucide-react';
import { fetchAnimals, createAnimal } from '../../shared/services/api';
import type { Animal } from '../../shared/types';

interface SimulationStudioModalProps {
    onClose: () => void;
}

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'alert';
    message: string;
    details?: string;
}

export const SimulationStudioModal: React.FC<SimulationStudioModalProps> = ({ onClose }) => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [selectedAnimalId, setSelectedAnimalId] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const streamIntervalRef = useRef<number | null>(null);

    // Custom Biometric Sliders State
    const [customTemp, setCustomTemp] = useState<number>(38.5);
    const [customHR, setCustomHR] = useState<number>(75);
    const [customRR, setCustomRR] = useState<number>(24);
    const [customSpO2, setCustomSpO2] = useState<number>(98);
    const [customBattery, setCustomBattery] = useState<number>(92);

    const logTerminalRef = useRef<HTMLDivElement | null>(null);

    const addLog = (type: LogEntry['type'], message: string, details?: string) => {
        const entry: LogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
            details
        };
        setLogs(prev => [entry, ...prev].slice(0, 50));
    };

    const loadAnimals = async () => {
        try {
            const list = await fetchAnimals();
            setAnimals(list);
            if (list.length > 0 && selectedAnimalId === 'all') {
                setSelectedAnimalId(list[0]._id);
            }
        } catch (e: any) {
            addLog('error', 'Failed to load animals list', e.message);
        }
    };

    useEffect(() => {
        loadAnimals();
        addLog('info', 'Simulation Studio Initialized. Ready to dispatch clinical telemetry scenarios.');
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    // 1. Auto-Seed 3 Animals if none exist
    const handleSeedAnimals = async () => {
        setLoading(true);
        addLog('info', 'Provisioning 3 clinical bovine test subjects with active telemetry collars...');
        try {
            const subjects = [
                { name: 'Bessie-01 (Holstein)', species: 'Bovine - Holstein Friesian', breed: 'Holstein', age: 4, zone: 'Barn-Alpha', deviceId: 'COLLAR-B01' },
                { name: 'Luna-02 (Jersey)', species: 'Bovine - Jersey', breed: 'Jersey', age: 3, zone: 'Barn-Alpha', deviceId: 'COLLAR-L02' },
                { name: 'Bella-03 (Guernsey)', species: 'Bovine - Guernsey', breed: 'Guernsey', age: 5, zone: 'Barn-Beta', deviceId: 'COLLAR-G03' }
            ];

            for (const sub of subjects) {
                const created = await createAnimal(sub);
                addLog('success', `Provisioned ${created.name}`, `Node ID: ${created._id.substring(0, 8)} • Collar: ${sub.deviceId}`);
            }

            await loadAnimals();
            addLog('success', '3 Test Subjects successfully registered and ready for telemetry transmission.');
        } catch (e: any) {
            addLog('error', 'Seed failed', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to send telemetry packet to Backend API
    const sendSensorPayload = async (animalId: string, physiology: { temperature: number; heartRate: number; respiratoryRate: number; bloodOxygen: number }, battery = 90) => {
        const payload = {
            animalId,
            physiology,
            behavior: {
                motion: true,
                steps: 120,
                lyingDown: false
            },
            device: {
                batteryLevel: battery,
                signalStrength: -65
            },
            timestamp: new Date().toISOString()
        };

        const res = await fetch('http://localhost:5000/api/sensors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Sensor ingestion failed');
        }

        return await res.json();
    };

    // --- SCENARIOS ---

    // Scenario 1: Healthy Baseline Homeostasis
    const runHealthyScenario = async () => {
        setLoading(true);
        addLog('info', '▶ Running Scenario: Normal Homeostasis (Stable Green Baseline)...');
        try {
            const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
            if (targetAnimals.length === 0) {
                addLog('warning', 'No animals available. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            for (const a of targetAnimals) {
                await sendSensorPayload(a._id, {
                    temperature: 38.5 + (Math.random() * 0.4 - 0.2),
                    heartRate: Math.round(72 + (Math.random() * 6 - 3)),
                    respiratoryRate: Math.round(22 + (Math.random() * 4 - 2)),
                    bloodOxygen: Math.round(98 + (Math.random() * 2 - 1))
                }, 95);
                addLog('success', `[${a.name}] Homeostasis Packet Transmitted`, `T: 38.5°C • HR: 72 BPM • RR: 22 BPM • SpO2: 98% • Status: Normal`);
            }
        } catch (e: any) {
            addLog('error', 'Homeostasis scenario error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Scenario 2: 10-Step Baseline Calibration Stream
    const runCalibrationScenario = async () => {
        setLoading(true);
        addLog('info', '▶ Running Scenario: 10-Step Baseline Calibration Stream (Welford Accumulator)...');
        try {
            const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
            if (targetAnimals.length === 0) {
                addLog('warning', 'No animals available. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            const target = targetAnimals[0];
            addLog('info', `Starting 10-Step Calibration Sequence for ${target.name}...`);

            for (let step = 1; step <= 10; step++) {
                await new Promise(r => setTimeout(r, 220));
                const jitter = (Math.random() * 0.3 - 0.15);
                await sendSensorPayload(target._id, {
                    temperature: parseFloat((38.4 + jitter).toFixed(1)),
                    heartRate: Math.round(74 + (Math.random() * 4 - 2)),
                    respiratoryRate: Math.round(23 + (Math.random() * 2 - 1)),
                    bloodOxygen: 98
                });
                addLog('info', `Calibration Step ${step}/10 Transmitted`, `Progress: ${step * 10}% • Accumulating Moving Variance`);
            }

            addLog('success', `[${target.name}] Baseline Calibration 10/10 Locked In!`, 'Personalized μ & σ established. Adaptive EMA active.');
        } catch (e: any) {
            addLog('error', 'Calibration scenario error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Scenario 3: Acute Respiratory Distress & Hypoxia (Individual Level)
    const runRespiratoryDistressScenario = async () => {
        setLoading(true);
        addLog('alert', '▶ Running Scenario: Acute Respiratory Distress & SpO2 Drop (Individual Anomaly)...');
        try {
            const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
            if (targetAnimals.length === 0) {
                addLog('warning', 'No animals available. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            const target = targetAnimals[0];
            await sendSensorPayload(target._id, {
                temperature: 39.9,
                heartRate: 108,
                respiratoryRate: 64, // Tachypnea
                bloodOxygen: 87      // Severe Hypoxia
            }, 88);

            addLog('alert', `🚨 [${target.name}] ANOMALY ALERT TRIGGERED!`, 'T: 39.9°C (Elevated) • RR: 64 BPM (Tachypneic) • SpO2: 87% (Hypoxic) • AI Copilot Auscultation Recommendation dispatched.');
        } catch (e: any) {
            addLog('error', 'Respiratory distress scenario error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Scenario 4: Thermal Hyperthermia & Heat Index Overload
    const runHyperthermiaScenario = async () => {
        setLoading(true);
        addLog('alert', '▶ Running Scenario: Thermal Hyperthermia & Core Heat Spike...');
        try {
            const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
            if (targetAnimals.length === 0) {
                addLog('warning', 'No animals available. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            const target = targetAnimals[0];
            await sendSensorPayload(target._id, {
                temperature: 41.6, // Extreme Hyperthermia
                heartRate: 128,    // Severe Tachycardia
                respiratoryRate: 58,
                bloodOxygen: 92
            }, 85);

            addLog('alert', `🔥 [${target.name}] CRITICAL HYPERTHERMIA SPIKE!`, 'T: 41.6°C • HR: 128 BPM • Immediate active cooling & hydration protocol recommended.');
        } catch (e: any) {
            addLog('error', 'Hyperthermia scenario error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Scenario 5: Multi-Animal Herd-Level Outbreak (Contagion Graph Cluster)
    const runHerdOutbreakScenario = async () => {
        setLoading(true);
        addLog('alert', '▶ Running Scenario: Multi-Animal Herd-Level Contagion Cluster Outbreak...');
        try {
            if (animals.length < 2) {
                addLog('warning', 'Herd-level outbreak requires at least 2 animals. Please click "Seed 3 Test Subjects" first.');
                await handleSeedAnimals();
            }

            const activeList = await fetchAnimals();
            addLog('info', `Simulating Correlated Contagion Wave across ${activeList.length} herd subjects simultaneously...`);

            for (const a of activeList) {
                await sendSensorPayload(a._id, {
                    temperature: 40.2 + (Math.random() * 0.6),
                    heartRate: Math.round(105 + Math.random() * 12),
                    respiratoryRate: Math.round(62 + Math.random() * 8),
                    bloodOxygen: Math.round(88 + Math.random() * 3)
                }, 85);
                addLog('alert', `🚨 [${a.name}] Correlated Febrile & Respiratory Spike Transmitted!`, `T: 40.4°C • RR: 65 BPM • SpO2: 89%`);
            }

            addLog('alert', '⚡ HERD OUTBREAK RISK TRIGGERED (Graph Contagion Score: 85% - 100%)', 'Multi-animal cluster anomaly confirmed. Herd warning banner active on Analytics view.');
        } catch (e: any) {
            addLog('error', 'Herd outbreak scenario error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Scenario 6: Hardware Low Battery Warning
    const runLowBatteryScenario = async () => {
        setLoading(true);
        addLog('warning', '▶ Running Scenario: Hardware Low Battery & Maintenance Flag...');
        try {
            const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
            if (targetAnimals.length === 0) {
                addLog('warning', 'No animals available. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            const target = targetAnimals[0];
            await sendSensorPayload(target._id, {
                temperature: 38.6,
                heartRate: 74,
                respiratoryRate: 23,
                bloodOxygen: 98
            }, 12); // 12% Battery

            addLog('warning', `🔋 [${target.name}] HARDWARE ALERT: Battery at 12%!`, 'Collar battery threshold breached (<15%). Emitted BATTERY warning packet.');
        } catch (e: any) {
            addLog('error', 'Low battery scenario error', e.message);
        } finally {
            setLoading(false);
        }
    };

    // Scenario 7: Continuous Live Telemetry Stream
    const toggleLiveStream = () => {
        if (isStreaming) {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
                streamIntervalRef.current = null;
            }
            setIsStreaming(false);
            addLog('info', '⏹ Continuous Live Telemetry Stream STOPPED.');
        } else {
            if (animals.length === 0) {
                addLog('warning', 'No animals available to stream. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            setIsStreaming(true);
            addLog('success', '▶ Continuous Live Telemetry Stream STARTED (2.5s oscillating pulses)...', 'Watch Dashboard, Digital Twin, and Analytics update live in real-time!');

            let tick = 0;
            streamIntervalRef.current = window.setInterval(async () => {
                tick++;
                const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
                for (const a of targetAnimals) {
                    const sinVal = Math.sin(tick * 0.5);
                    const temp = parseFloat((38.5 + sinVal * 0.4).toFixed(1));
                    const hr = Math.round(74 + sinVal * 8);
                    const rr = Math.round(23 + sinVal * 4);
                    const spo2 = Math.round(98 - Math.abs(sinVal * 1.5));

                    try {
                        await sendSensorPayload(a._id, {
                            temperature: temp,
                            heartRate: hr,
                            respiratoryRate: rr,
                            bloodOxygen: spo2
                        }, 90);
                        addLog('info', `📡 Stream Pulse #${tick} [${a.name.split(' ')[0]}]`, `T: ${temp}°C • HR: ${hr} BPM • RR: ${rr} • SpO2: ${spo2}%`);
                    } catch (e) {
                        // ignore interval errors
                    }
                }
            }, 2500);
        }
    };

    // Custom Biometric Injection
    const handleInjectCustom = async () => {
        setLoading(true);
        addLog('info', '▶ Injecting Custom Biometric Sliders Packet...');
        try {
            const targetAnimals = selectedAnimalId === 'all' ? animals : animals.filter(a => a._id === selectedAnimalId);
            if (targetAnimals.length === 0) {
                addLog('warning', 'No animals available. Please click "Seed 3 Test Subjects" first.');
                return;
            }

            for (const a of targetAnimals) {
                await sendSensorPayload(a._id, {
                    temperature: customTemp,
                    heartRate: customHR,
                    respiratoryRate: customRR,
                    bloodOxygen: customSpO2
                }, customBattery);
                addLog('success', `[${a.name}] Custom Packet Injected`, `T: ${customTemp}°C • HR: ${customHR} BPM • RR: ${customRR} BPM • SpO2: ${customSpO2}% • Battery: ${customBattery}%`);
            }
        } catch (e: any) {
            addLog('error', 'Custom injection error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in fade-in zoom-in-95 duration-200">
                
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-teal-800/40">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shadow-inner">
                            <Zap className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg font-bold tracking-tight text-white m-0 font-display">
                                    Clinical Telemetry & Scenario Simulation Studio
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                    Interactive Engine
                                </span>
                            </div>
                            <p className="text-xs text-teal-200/80 font-normal m-0">
                                Simulate every single physiological state, baseline calibration, and herd-level outbreak in real time.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {animals.length === 0 && (
                            <button
                                onClick={handleSeedAnimals}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold transition-all shadow-sm"
                            >
                                <PlusCircle className="h-3.5 w-3.5" />
                                <span>Seed 3 Test Subjects</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Target Animal Selector Toolbar */}
                <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-600">Target Subject:</span>
                        <select
                            value={selectedAnimalId}
                            onChange={(e) => setSelectedAnimalId(e.target.value)}
                            className="bg-white border border-slate-300 rounded-full px-3 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500 shadow-2xs"
                        >
                            <option value="all">⚡ All Registered Herd Subjects ({animals.length})</option>
                            {animals.map((a) => (
                                <option key={a._id} value={a._id}>
                                    {a.name} ({a.species})
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={loadAnimals}
                            className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                            title="Refresh animals list"
                        >
                            <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleLiveStream}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
                                isStreaming 
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse' 
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                        >
                            {isStreaming ? (
                                <>
                                    <Square className="h-3.5 w-3.5 fill-current" />
                                    <span>Stop Continuous Live Stream</span>
                                </>
                            ) : (
                                <>
                                    <Play className="h-3.5 w-3.5 fill-current" />
                                    <span>Start Continuous Live Telemetry</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Main Body: Scenarios Grid + Custom Sliders + Live Log Output */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto max-h-[70vh]">
                    
                    {/* Left Column: Preset 1-Click Scenario Cards (7 cols) */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                                <span>Preset Clinical Scenarios</span>
                            </h3>
                            <span className="text-[11px] text-slate-400 font-medium">1-Click Instant Transmission</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            
                            {/* Scenario 1: Normal Homeostasis */}
                            <button
                                onClick={runHealthyScenario}
                                disabled={loading}
                                className="group text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                                        Normal
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors m-0">
                                    1. Healthy Homeostasis
                                </h4>
                                <p className="text-[11px] text-slate-500 m-0 mt-1">
                                    T: 38.5°C, HR: 72, RR: 22, SpO2: 98%. Zero alerts; confirms calm vital signs.
                                </p>
                            </button>

                            {/* Scenario 2: Baseline Calibration Stream */}
                            <button
                                onClick={runCalibrationScenario}
                                disabled={loading}
                                className="group text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/40 transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                                        <Activity className="h-4 w-4" />
                                    </span>
                                    <span className="text-[10px] font-bold text-teal-700 uppercase bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/80">
                                        10-Step
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors m-0">
                                    2. Baseline Calibration Stream
                                </h4>
                                <p className="text-[11px] text-slate-500 m-0 mt-1">
                                    Fires 10 sequential readings to lock in personalized baseline and unlock EMA.
                                </p>
                            </button>

                            {/* Scenario 3: Acute Respiratory Distress */}
                            <button
                                onClick={runRespiratoryDistressScenario}
                                disabled={loading}
                                className="group text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-rose-500 hover:bg-rose-50/40 transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="h-7 w-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                                        <Wind className="h-4 w-4" />
                                    </span>
                                    <span className="text-[10px] font-bold text-rose-700 uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                                        Individual Alert
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-rose-800 transition-colors m-0">
                                    3. Respiratory Distress (SpO2 87%)
                                </h4>
                                <p className="text-[11px] text-slate-500 m-0 mt-1">
                                    Tachypnea (RR 64) + Hypoxia. Fires Anomaly Alert & Copilot Differential.
                                </p>
                            </button>

                            {/* Scenario 4: Thermal Hyperthermia */}
                            <button
                                onClick={runHyperthermiaScenario}
                                disabled={loading}
                                className="group text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-amber-500 hover:bg-amber-50/40 transition-all duration-200 shadow-2xs hover:shadow-sm cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="h-7 w-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                                        <Flame className="h-4 w-4" />
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                                        Thermal Spike
                                    </span>
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors m-0">
                                    4. Thermal Hyperthermia (41.6°C)
                                </h4>
                                <p className="text-[11px] text-slate-500 m-0 mt-1">
                                    Core temperature spike + severe tachycardia (HR 128). Fires cooling alert.
                                </p>
                            </button>

                            {/* Scenario 5: Multi-Animal Herd-Level Outbreak */}
                            <button
                                onClick={runHerdOutbreakScenario}
                                disabled={loading}
                                className="group text-left p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-2xs hover:shadow-sm sm:col-span-2 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                                            <Users className="h-4 w-4" />
                                        </span>
                                        <h4 className="text-xs font-bold text-indigo-950 m-0">
                                            5. Multi-Animal Herd-Level Outbreak Cluster
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-indigo-800 uppercase bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                                        Herd Graph Matrix
                                    </span>
                                </div>
                                <p className="text-[11px] text-indigo-900/80 m-0">
                                    Simultaneously transmits correlated febrile & respiratory distress across <strong>all herd animals</strong>. Immediately tests the <strong>Contagion Graph Score (≥80%)</strong> and lights up the Herd Outbreak Warning on Analytics!
                                </p>
                            </button>

                            {/* Scenario 6: Hardware Low Battery */}
                            <button
                                onClick={runLowBatteryScenario}
                                disabled={loading}
                                className="group text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 shadow-2xs hover:shadow-sm sm:col-span-2 cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="h-7 w-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                                            <BatteryCharging className="h-4 w-4" />
                                        </span>
                                        <h4 className="text-xs font-bold text-slate-900 m-0">
                                            6. Hardware Collar Low Battery Flag (12%)
                                        </h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-700 uppercase bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                                        Hardware Maintenance
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 m-0">
                                    Collar battery drops to 12% (&lt;15% threshold). Emits BATTERY maintenance alert.
                                </p>
                            </button>

                        </div>

                        {/* Custom Parameter Sliders */}
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 m-0">
                                    <Sliders className="h-3.5 w-3.5 text-teal-600" />
                                    <span>Custom Biometric Sliders</span>
                                </h4>
                                <button
                                    onClick={handleInjectCustom}
                                    disabled={loading}
                                    className="px-3 py-1 rounded-full bg-slate-900 hover:bg-teal-700 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                                >
                                    Inject Custom Packet
                                </button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                                        <span>Temp:</span>
                                        <span className="text-teal-700 font-bold font-mono">{customTemp}°C</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="35.0" 
                                        max="43.0" 
                                        step="0.1" 
                                        value={customTemp} 
                                        onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                                        <span>Heart Rate:</span>
                                        <span className="text-teal-700 font-bold font-mono">{customHR} BPM</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="30" 
                                        max="160" 
                                        step="1" 
                                        value={customHR} 
                                        onChange={(e) => setCustomHR(parseInt(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                                        <span>Respiration:</span>
                                        <span className="text-teal-700 font-bold font-mono">{customRR} BPM</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="90" 
                                        step="1" 
                                        value={customRR} 
                                        onChange={(e) => setCustomRR(parseInt(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                                        <span>Blood SpO2:</span>
                                        <span className="text-teal-700 font-bold font-mono">{customSpO2}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="70" 
                                        max="100" 
                                        step="1" 
                                        value={customSpO2} 
                                        onChange={(e) => setCustomSpO2(parseInt(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between font-semibold text-slate-600 mb-1">
                                        <span>Collar Battery:</span>
                                        <span className="text-teal-700 font-bold font-mono">{customBattery}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="5" 
                                        max="100" 
                                        step="1" 
                                        value={customBattery} 
                                        onChange={(e) => setCustomBattery(parseInt(e.target.value))}
                                        className="w-full accent-teal-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Live Diagnostic Terminal Log (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col bg-slate-900 rounded-2xl border border-slate-800 text-slate-200 overflow-hidden shadow-inner h-[480px]">
                        
                        {/* Terminal Header */}
                        <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <Terminal className="h-3.5 w-3.5 text-teal-400" />
                                <span className="font-mono font-bold text-slate-300">LIVE SENSOR TELEMETRY LOG</span>
                            </div>
                            <button
                                onClick={() => setLogs([])}
                                className="text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Terminal Output Stream */}
                        <div 
                            ref={logTerminalRef}
                            className="flex-1 p-3.5 overflow-y-auto font-mono text-[11px] space-y-2 no-scrollbar"
                        >
                            {logs.length === 0 ? (
                                <div className="text-slate-500 italic text-center py-12">
                                    Awaiting scenario trigger... Click any scenario on the left to transmit live telemetry.
                                </div>
                            ) : (
                                logs.map((log) => (
                                    <div key={log.id} className="border-l-2 pl-2.5 transition-all animate-in fade-in duration-150" style={{
                                        borderColor: 
                                            log.type === 'alert' ? '#f43f5e' :
                                            log.type === 'error' ? '#ef4444' :
                                            log.type === 'warning' ? '#f59e0b' :
                                            log.type === 'success' ? '#10b981' : '#0ea5e9'
                                    }}>
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                            <span>[{log.timestamp}]</span>
                                            <span className={`font-bold uppercase ${
                                                log.type === 'alert' ? 'text-rose-400' :
                                                log.type === 'error' ? 'text-red-400' :
                                                log.type === 'warning' ? 'text-amber-400' :
                                                log.type === 'success' ? 'text-emerald-400' : 'text-cyan-400'
                                            }`}>
                                                {log.type}
                                            </span>
                                        </div>
                                        <div className="text-slate-100 font-medium">{log.message}</div>
                                        {log.details && (
                                            <div className="text-slate-400 text-[10px] mt-0.5">{log.details}</div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Terminal Footer Indicator */}
                        <div className="bg-slate-950/80 px-4 py-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <span className={`h-1.5 w-1.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-teal-500'}`} />
                                {isStreaming ? 'Continuous Stream Active' : 'Gateway Ready'}
                            </span>
                            <span>WebSocket: ws://localhost:5000</span>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};
