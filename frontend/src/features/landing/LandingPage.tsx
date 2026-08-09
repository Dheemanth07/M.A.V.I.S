import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import {
    Activity, Heart, Thermometer, Wind, Battery,
    Cpu, Bell, ChevronRight, CheckCircle2, ArrowRight,
    Layers, TrendingUp
} from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip, ReferenceLine, CartesianGrid
} from 'recharts';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    // Scroll progress bar state
    const [scrollProgress, setScrollProgress] = useState(0);

    // Metric toggle for Demo Interactive Telemetry Chart
    const [activeMetric, setActiveMetric] = useState<'temp' | 'hr' | 'rr'>('temp');

    // State for FAQ accordion
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    // 24-Hour Mock Telemetry Data for Interactive Demo Chart
    const telemetryData = [
        { time: '00:00', temp: 38.2, hr: 68, rr: 22 },
        { time: '02:00', temp: 38.1, hr: 64, rr: 20 },
        { time: '04:00', temp: 38.0, hr: 62, rr: 19 },
        { time: '06:00', temp: 38.3, hr: 70, rr: 23 },
        { time: '08:00', temp: 38.5, hr: 78, rr: 26 },
        { time: '10:00', temp: 38.7, hr: 82, rr: 28 },
        { time: '12:00', temp: 38.9, hr: 85, rr: 29 },
        { time: '14:00', temp: 38.8, hr: 84, rr: 27 },
        { time: '16:00', temp: 38.6, hr: 79, rr: 25 },
        { time: '18:00', temp: 38.4, hr: 74, rr: 24 },
        { time: '20:00', temp: 38.3, hr: 71, rr: 22 },
        { time: '22:00', temp: 38.2, hr: 67, rr: 21 },
    ];

    const metricConfig = {
        temp: {
            title: 'Core Body Temperature',
            unit: '°C',
            key: 'temp',
            color: '#0d9488',
            gradientId: 'tempGrad',
            domain: [37.5, 39.5] as [number, number],
            baseline: 38.5,
            baselineLabel: 'Normal Baseline (38.5°C)',
            threshold: 39.2,
            thresholdLabel: 'Fever Line (39.2°C)',
            avg: '38.4°C',
            peak: '38.9°C',
            status: 'Optimal Baseline'
        },
        hr: {
            title: 'Continuous Pulse / Heart Rate',
            unit: 'BPM',
            key: 'hr',
            color: '#2563eb',
            gradientId: 'hrGrad',
            domain: [50, 100] as [number, number],
            baseline: 70,
            baselineLabel: 'Resting Baseline (70 BPM)',
            threshold: 90,
            thresholdLabel: 'Elevated Line (90 BPM)',
            avg: '73.7 BPM',
            peak: '85 BPM',
            status: 'Resting Normal'
        },
        rr: {
            title: 'Respiration & Breathing Rate',
            unit: 'RR',
            key: 'rr',
            color: '#7c3aed',
            gradientId: 'rrGrad',
            domain: [15, 35] as [number, number],
            baseline: 24,
            baselineLabel: 'Calm Baseline (24 RR)',
            threshold: 32,
            thresholdLabel: 'Fast Breathing (32 RR)',
            avg: '23.8 RR',
            peak: '29 RR',
            status: 'Clear Breathing'
        }
    }[activeMetric];

    useEffect(() => {
        const handleScroll = () => {
            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (totalHeight > 0) {
                const progress = (window.scrollY / totalHeight) * 100;
                setScrollProgress(progress);
            }

            // Fallback & direct viewport check for instant responsiveness on scroll
            const revealElements = document.querySelectorAll('.reveal-on-scroll:not(.is-visible)');
            revealElements.forEach((el) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight - 60 && rect.bottom > 0) {
                    el.classList.add('is-visible');
                }
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Intersection Observer for silky smooth scroll reveals
        const observerCallback: IntersectionObserverCallback = (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, {
            threshold: 0.1,
            rootMargin: '0px 0px -60px 0px'
        });

        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach((el) => observer.observe(el));

        // Initial check for elements in the initial viewport
        setTimeout(handleScroll, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            observer.disconnect();
        };
    }, []);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "Does M.A.V.I.S require continuous internet access in remote pastures?",
            a: "No. M.A.V.I.S is engineered for 100% offline-first edge deployment. The ESP32 collar nodes transmit telemetry directly to a local farm gateway. All database storage, mathematical scoring, and AI inferences run on your local network without needing cloud servers."
        },
        {
            q: "How does the collar hardware detect health deviations before visible symptoms appear?",
            a: "The collar combines medical-grade optical photoplethysmography (MAX30102), waterproof digital thermal probes (DS18B20), and 6-axis motion sensors (MPU6050). By comparing continuous readings against the animal's individual baseline, MAVIS identifies subtle pulse spikes and subclinical fever hours before physical distress shows."
        },
        {
            q: "What are the 3 physical sensors integrated inside the collar?",
            a: "1) MAX30102 optical sensor for heart rate and SpO2; 2) DS18B20 waterproof digital probe for skin and core body temperature; 3) MPU6050 6-axis IMU for rumination posture, movement, and activity classification."
        },
        {
            q: "How does the Emergency Veterinary Dispatch work?",
            a: "When a critical threshold is breached, MAVIS generates an immediate clinical summary. On desktop, it offers 1-click clipboard copying and WhatsApp Web dispatch without opening unwanted OS apps. On mobile devices, it automatically provides 1-tap direct phone dialing and native SMS drafting."
        },
        {
            q: "Can multiple caregivers manage separate herds securely on the same system?",
            a: "Yes. MAVIS features strict multi-tenant data isolation. Each farm account strictly manages its own registered animals, collar nodes, and alert queues, while authorized veterinarians or administrators retain global oversight."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500/20 selection:text-teal-900 relative">
            
            {/* ── DYNAMIC TOP SCROLL PROGRESS BAR ────────────────────────── */}
            <div 
                className="fixed top-0 left-0 h-[3px] bg-gradient-to-r from-teal-600 via-emerald-400 to-teal-500 z-[100] transition-all duration-75 ease-out shadow-sm shadow-teal-500/50"
                style={{ width: `${scrollProgress}%` }}
            />

            {/* ── TOP FLOATING HEADER ────────────────────────────────────── */}
            <div className="sticky top-3 sm:top-4 z-50 max-w-7xl mx-auto px-4 sm:px-8 w-full">
                <header className="bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full px-6 py-3 flex items-center justify-between gap-4 transition-all duration-300">
                    
                    {/* Brand Logo & Name */}
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img 
                            src="/logo.svg" 
                            alt="MAVIS Logo" 
                            className="h-9 w-9 rounded-full shadow-md shadow-teal-700/20 shrink-0 transition-transform duration-300 hover:scale-105" 
                        />
                        <span className="text-xl font-bold tracking-tight text-slate-900 leading-none font-display">
                            M.A.V.I.S
                        </span>
                    </div>

                    {/* Desktop Navigation Anchors */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                        <a href="#overview" className="hover:text-teal-700 transition">Platform</a>
                        <a href="#hardware" className="hover:text-teal-700 transition">Sensor Architecture</a>
                        <a href="#analytics" className="hover:text-teal-700 transition">Live Analytics</a>
                        <a href="#faq" className="hover:text-teal-700 transition">FAQ</a>
                    </nav>

                    {/* Right CTAs */}
                    <div className="flex items-center gap-2.5">
                        {isAuthenticated ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="h-9 px-4 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02]"
                            >
                                <span>Go to Dashboard</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="h-9 px-4 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition cursor-pointer"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="h-9 px-4 sm:px-5 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-teal-700/20 cursor-pointer hover:scale-[1.02]"
                                >
                                    <span>Get Started</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                </header>
            </div>

            {/* ── HERO SECTION ─────────────────────────────────────────── */}
            <section className="pt-16 sm:pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Hero Left Content */}
                    <div className="lg:col-span-7 space-y-6 text-left reveal-on-scroll">

                        {/* Main Title */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight font-display leading-[1.1]">
                            <span className="text-slate-900">Continuous Vital Intelligence</span>{' '}
                            <span className="text-teal-600">for Every Animal in Your Care.</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                            M.A.V.I.S combines custom ESP32 collar hardware with on-premises biological digital twins to monitor core body temperature, pulse, respiration rate, and rumination posture in real time — keeping livestock healthy without relying on cloud infrastructure.
                        </p>

                        {/* Hero Action Buttons */}
                        <div className="flex items-center gap-3.5 pt-2 flex-wrap">
                            <button
                                onClick={() => navigate('/login')}
                                className="h-12 px-7 rounded-full bg-teal-700 hover:bg-teal-800 text-white text-sm font-bold transition flex items-center gap-2 shadow-lg shadow-teal-700/25 hover:scale-[1.02] cursor-pointer"
                            >
                                <span>Get Started</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <a
                                href="#hardware"
                                className="h-12 px-6 rounded-full bg-white hover:bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 transition flex items-center gap-2 shadow-2xs cursor-pointer hover:scale-[1.02]"
                            >
                                <Cpu className="h-4 w-4 text-teal-600" />
                                <span>Sensor Architecture</span>
                            </a>
                        </div>

                        {/* Grounded Key Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80">
                            <div>
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">Every 3s</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">Telemetry Broadcast Cycle</div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-bold text-teal-700 font-mono">100% On-Prem</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">Offline Field Ready</div>
                            </div>
                            <div>
                                <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">3 Core Sensors</div>
                                <div className="text-xs text-slate-500 font-medium mt-0.5">MAX30102 • DS18B20 • MPU6050</div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Right: Live Interactive Telemetry Preview Card */}
                    <div className="lg:col-span-5 relative reveal-on-scroll">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-teal-500/20 via-emerald-500/10 to-transparent rounded-3xl blur-xl -z-10" />
                        
                        <div className="bento-card p-6 sm:p-7 bg-white border border-slate-200/90 shadow-xl space-y-5 rounded-3xl transition-all duration-300 hover:shadow-2xl">
                            {/* Live Preview Header */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold">
                                        <Activity className="h-5 w-5 text-teal-700" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-900 text-sm">Subject #02 (Live Node)</span>
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono">COLLAR-NODE-02 • 100 Hz Sensor</span>
                                    </div>
                                </div>
                                <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                                    Normal Stability
                                </div>
                            </div>

                            {/* Live Multi-Vital Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        <Thermometer className="h-3.5 w-3.5 text-teal-600" /> Temperature
                                    </div>
                                    <div className="text-xl font-bold font-mono text-slate-900">38.4°C</div>
                                    <div className="text-[10px] text-emerald-700 font-medium">Optimal Baseline</div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        <Heart className="h-3.5 w-3.5 text-blue-600" /> Heart Rate
                                    </div>
                                    <div className="text-xl font-bold font-mono text-slate-900">74 BPM</div>
                                    <div className="text-[10px] text-blue-700 font-medium">Resting Normal</div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        <Wind className="h-3.5 w-3.5 text-purple-600" /> Breathing Rate
                                    </div>
                                    <div className="text-xl font-bold font-mono text-slate-900">24 RR</div>
                                    <div className="text-[10px] text-purple-700 font-medium">Clear Respiration</div>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                                        <Battery className="h-3.5 w-3.5 text-teal-600" /> Collar Battery
                                    </div>
                                    <div className="text-xl font-bold font-mono text-slate-900">92%</div>
                                    <div className="text-[10px] text-teal-700 font-medium">Power Good</div>
                                </div>
                            </div>

                            {/* Simulated Pulse Waveform Banner */}
                            <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                    <span className="flex items-center gap-1.5">
                                        <Activity className="h-3.5 w-3.5 text-teal-400" />
                                        <span>MAX30102 Photoplethysmogram</span>
                                    </span>
                                    <span className="text-teal-300">50 Hz Stream</span>
                                </div>
                                <div className="h-8 flex items-center justify-between gap-1 overflow-hidden px-1">
                                    {[30, 45, 20, 80, 25, 95, 35, 40, 30, 75, 20, 90, 40, 30, 85, 25, 95, 30, 40, 20, 80, 30].map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-1 bg-gradient-to-t from-teal-500 to-emerald-400 rounded-full transition-all duration-300"
                                            style={{ height: `${h}%` }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Grounded Health Assessment Box */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                                    <span>Real-Time Health Status: Optimal</span>
                                </div>
                                <p className="text-slate-600 m-0 leading-relaxed text-[11px]">
                                    All physiological metrics match learned biological baselines. No thermal or cardiac anomalies detected.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── STATS BAR ────────────────────────────────────────────── */}
            <section className="py-6 px-4 sm:px-8 max-w-7xl mx-auto w-full reveal-on-scroll">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200/80 border border-slate-200/80 rounded-2xl bg-white shadow-sm overflow-hidden">
                    <div className="flex flex-col items-center justify-center py-7 px-4 text-center">
                        <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">100 Hz</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">MAX30102 Raw Sample Rate</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-7 px-4 text-center">
                        <span className="text-3xl font-bold text-teal-700 font-mono tracking-tight">Every 3s</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">Telemetry Broadcast Cycle</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-7 px-4 text-center">
                        <span className="text-3xl font-bold text-slate-900 font-mono tracking-tight">3</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">Core Biometric Sensors on Collar</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-7 px-4 text-center">
                        <span className="text-3xl font-bold text-teal-700 font-mono tracking-tight">100%</span>
                        <span className="text-xs text-slate-500 font-medium mt-1">On-Premises — Zero Cloud</span>
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
            <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="text-center space-y-2 mb-10 reveal-on-scroll">
                    <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest font-mono">How It Works</h2>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-900 font-display">From Sensor to Screen in Three Steps</h3>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Connector line — desktop only */}
                    <div className="hidden md:block absolute top-[2.75rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-slate-200 z-0" />

                    {/* Step 1 */}
                    <div className="bento-card p-7 bg-white border border-slate-200/90 rounded-3xl shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-teal-700 text-white font-bold text-lg flex items-center justify-center font-mono shrink-0">1</div>
                            <div className="h-px flex-1 bg-slate-100 md:hidden" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 font-display mb-1.5">Collar Reads Vitals</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                The ESP32 smart collar samples heart rate and SpO₂ at 100 Hz via the MAX30102, core temperature via the DS18B20, and posture via the MPU6050 IMU — all simultaneously, on-device.
                            </p>
                        </div>
                        <div className="text-[11px] font-mono text-teal-700 font-semibold">MAX30102 • DS18B20 • MPU6050</div>
                    </div>

                    {/* Step 2 */}
                    <div className="bento-card p-7 bg-white border border-slate-200/90 rounded-3xl shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-teal-700 text-white font-bold text-lg flex items-center justify-center font-mono shrink-0">2</div>
                            <div className="h-px flex-1 bg-slate-100 md:hidden" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 font-display mb-1.5">Gateway Processes & Alerts</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Every 3 seconds the collar transmits a JSON payload over Wi-Fi to the local Node.js gateway. Anomaly detection, digital twin sync, and threshold-based alert generation run instantly on-premises.
                            </p>
                        </div>
                        <div className="text-[11px] font-mono text-teal-700 font-semibold">Node.js • MongoDB • Socket.IO</div>
                    </div>

                    {/* Step 3 */}
                    <div className="bento-card p-7 bg-white border border-slate-200/90 rounded-3xl shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-teal-700 text-white font-bold text-lg flex items-center justify-center font-mono shrink-0">3</div>
                            <div className="h-px flex-1 bg-slate-100 md:hidden" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-slate-900 font-display mb-1.5">Dashboard Surfaces Insights</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                The React dashboard receives live Socket.IO push updates and renders real-time charts, biological digital twin visuals, AI-generated health summaries, and critical alerts — no refresh needed.
                            </p>
                        </div>
                        <div className="text-[11px] font-mono text-teal-700 font-semibold">React • Recharts • Ollama (Llama 3.2 / Phi-3)</div>
                    </div>
                </div>
            </section>

            {/* ── CORE PILLARS / BENTO GRID ────────────────────────────── */}
            <section id="overview" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="text-center space-y-3 mb-12 max-w-3xl mx-auto reveal-on-scroll">
                    <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest font-mono">
                        Platform Architecture
                    </h2>
                    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display">
                        Engineered from Sensor Telemetry to Veterinary Action
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        A vertically integrated intelligence system designed for rugged field conditions and rapid veterinary decisions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Pillar 1: Telemetry Stream */}
                    <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-sm rounded-3xl space-y-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll">
                        <div className="space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 font-display m-0">
                                High-Speed Ingestion
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed m-0">
                                Live telemetry packets broadcast every 3 seconds via Socket.IO with automatic deduplication, rolling averages, and circuit-breaker battery preservation.
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                            <span>Live Signal Pipeline</span>
                            <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>

                    {/* Pillar 2: Digital Twin Engine */}
                    <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-sm rounded-3xl space-y-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll">
                        <div className="space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
                                <Layers className="h-6 w-6" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 font-display m-0">
                                Biological Digital Twin
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed m-0">
                                Synchronizes real-time sensor streams with learned biological baseline models to track posture, thermal dissipation, and activity levels.
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-blue-700 flex items-center gap-1">
                            <span>Digital Twin Model</span>
                            <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>

                    {/* Pillar 3: Clinical Intelligence */}
                    <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-sm rounded-3xl space-y-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll">
                        <div className="space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
                                <Activity className="h-6 w-6" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 font-display m-0">
                                On-Device Intelligence
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed m-0">
                                Evaluates multi-vital trends with zero cloud dependencies. Delivers clear, jargon-free health summaries and practical care steps with 0ms safety fallbacks.
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-purple-700 flex items-center gap-1">
                            <span>Edge Telemetry Inference</span>
                            <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>

                    {/* Pillar 4: Emergency Dispatch */}
                    <div className="bento-card p-6 bg-white border border-slate-200/90 shadow-sm rounded-3xl space-y-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition duration-300 reveal-on-scroll">
                        <div className="space-y-3">
                            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center">
                                <Bell className="h-6 w-6" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 font-display m-0">
                                Instant Vet Dispatch
                            </h4>
                            <p className="text-xs text-slate-600 leading-relaxed m-0">
                                Device-aware alert routing. Seamless 1-click clipboard &amp; WhatsApp Web routing on desktop; native 1-tap phone dialing and pre-drafted SMS on mobile browsers.
                            </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 text-[11px] font-semibold text-rose-700 flex items-center gap-1">
                            <span>Emergency Routing</span>
                            <ChevronRight className="h-3 w-3" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SENSOR ARCHITECTURE SECTION ─────────────────────────── */}
            <section id="hardware" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="bento-card p-8 sm:p-10 bg-white text-slate-900 rounded-3xl space-y-8 border border-slate-200/90 shadow-md reveal-on-scroll">
                    
                    {/* Balanced Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                        <div className="space-y-1.5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/90 text-teal-800 text-xs font-bold font-mono uppercase tracking-wider">
                                <Cpu className="h-3.5 w-3.5 text-teal-700" />
                                <span>Sensor Architecture</span>
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-slate-900 m-0">
                                3-Tier Collar Sensor Architecture
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 max-w-md m-0 font-normal leading-relaxed">
                            Continuous multi-sensor telemetry capturing real-time pulse, core temperature, and movement directly from the animal's collar.
                        </p>
                    </div>

                    {/* 3 Balanced Light-Themed Sensor Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Sensor 1: MAX30102 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs transition-all duration-300 hover:border-teal-300 hover:shadow-md hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100/80 text-teal-900 border border-teal-200 font-mono">
                                    MAX30102
                                </span>
                                <Heart className="h-5 w-5 text-teal-600" />
                            </div>
                            <h5 className="font-bold text-base text-slate-900 m-0 font-display">
                                Optical Pulse &amp; SpO2
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed m-0 font-normal">
                                Dual-wavelength LED photoplethysmogram capturing high-frequency microvascular blood absorption at 50 Hz to measure heart rate and blood oxygenation.
                            </p>
                            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-teal-800 font-mono font-semibold">
                                <span>Sampling: 50 Hz</span>
                                <span>Metric: BPM &amp; SpO2</span>
                            </div>
                        </div>

                        {/* Sensor 2: DS18B20 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs transition-all duration-300 hover:border-emerald-300 hover:shadow-md hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-200 font-mono">
                                    DS18B20
                                </span>
                                <Thermometer className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h5 className="font-bold text-base text-slate-900 m-0 font-display">
                                Waterproof Thermal Probe
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed m-0 font-normal">
                                1-Wire digital temperature sensor calibrated for ±0.1°C precision across skin and core subcutaneous boundaries to detect fever and heat distress early.
                            </p>
                            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-emerald-800 font-mono font-semibold">
                                <span>Accuracy: ±0.1°C</span>
                                <span>Metric: Core Temp</span>
                            </div>
                        </div>

                        {/* Sensor 3: MPU6050 */}
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5 shadow-xs transition-all duration-300 hover:border-blue-300 hover:shadow-md hover:-translate-y-1">
                            <div className="flex items-center justify-between">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-900 border border-blue-200 font-mono">
                                    MPU6050
                                </span>
                                <Activity className="h-5 w-5 text-blue-600" />
                            </div>
                            <h5 className="font-bold text-base text-slate-900 m-0 font-display">
                                6-Axis Motion &amp; IMU
                            </h5>
                            <p className="text-xs text-slate-600 leading-relaxed m-0 font-normal">
                                3-axis accelerometer and gyroscope tracking rumination head tilt, standing vs lying posture, and active movement versus resting stillness.
                            </p>
                            <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-blue-800 font-mono font-semibold">
                                <span>6-DOF IMU</span>
                                <span>Metric: Posture &amp; Motion</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── INTERACTIVE LIVE TELEMETRY & ANALYTICS DEMO CHARTS ───── */}
            <section id="analytics" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="text-center space-y-3 mb-10 max-w-2xl mx-auto reveal-on-scroll">
                    <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest font-mono">
                        Clinical Telemetry Engine
                    </h2>
                    <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display">
                        Interactive Telemetry Analytics
                    </h3>
                    <p className="text-sm text-slate-600">
                        Explore 24-hour vital curves, continuous baseline references, and clinical stability thresholds in real time.
                    </p>
                </div>

                {/* Interactive Demo Chart Container */}
                <div className="bento-card p-6 sm:p-8 bg-white border border-slate-200/90 shadow-md rounded-3xl max-w-5xl mx-auto space-y-6 reveal-on-scroll">
                    
                    {/* Metric Selector Tabs & Top KPI Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        {/* 3 Metric Pills */}
                        <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-full border border-slate-200/80">
                            <button
                                onClick={() => setActiveMetric('temp')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeMetric === 'temp'
                                        ? 'bg-white text-teal-800 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Thermometer className="h-3.5 w-3.5 text-teal-600" />
                                <span>Temperature</span>
                            </button>
                            <button
                                onClick={() => setActiveMetric('hr')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeMetric === 'hr'
                                        ? 'bg-white text-blue-800 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Heart className="h-3.5 w-3.5 text-blue-600" />
                                <span>Heart Rate</span>
                            </button>
                            <button
                                onClick={() => setActiveMetric('rr')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                    activeMetric === 'rr'
                                        ? 'bg-white text-purple-800 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Wind className="h-3.5 w-3.5 text-purple-600" />
                                <span>Respiration</span>
                            </button>
                        </div>

                        {/* Active Telemetry Summary Badge */}
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">24h Mean:</span>
                                <span className="font-bold font-mono text-slate-900">{metricConfig.avg}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">24h Peak:</span>
                                <span className="font-bold font-mono text-slate-900">{metricConfig.peak}</span>
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                                {metricConfig.status}
                            </div>
                        </div>
                    </div>

                    {/* Recharts 24-Hour Telemetry Area Chart */}
                    <div className="h-64 sm:h-72 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={telemetryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <YAxis domain={metricConfig.domain} stroke="#94a3b8" fontSize={11} tickLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderColor: '#e2e8f0',
                                        borderRadius: '1rem',
                                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                    }}
                                    formatter={(value: any) => [`${value} ${metricConfig.unit}`, metricConfig.title]}
                                />
                                <ReferenceLine
                                    y={metricConfig.baseline}
                                    stroke="#10b981"
                                    strokeDasharray="4 4"
                                    strokeWidth={1.5}
                                    label={{ value: metricConfig.baselineLabel, position: 'insideTopRight', fill: '#059669', fontSize: 11 }}
                                />
                                <ReferenceLine
                                    y={metricConfig.threshold}
                                    stroke="#ef4444"
                                    strokeDasharray="4 4"
                                    strokeWidth={1.5}
                                    label={{ value: metricConfig.thresholdLabel, position: 'insideBottomRight', fill: '#dc2626', fontSize: 11 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey={metricConfig.key}
                                    stroke={metricConfig.color}
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#chartGrad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Chart Context Footer Strip */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                            <span className="text-[11px] font-semibold text-slate-500">Telemetry Frequency</span>
                            <div className="text-sm font-bold text-slate-900 font-mono">50 Hz Continuous Pulse</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                            <span className="text-[11px] font-semibold text-slate-500">Anomaly Detection</span>
                            <div className="text-sm font-bold text-slate-900 font-mono">&lt; 0.1°C Thermal Sensitivity</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-0.5">
                            <span className="text-[11px] font-semibold text-slate-500">Historical Logging</span>
                            <div className="text-sm font-bold text-slate-900 font-mono">Time-Series Telemetry DB</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FAQ SECTION ──────────────────────────────────────────── */}
            <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto w-full">
                <div className="text-center space-y-3 mb-10 reveal-on-scroll">
                    <h2 className="text-xs font-bold text-teal-700 uppercase tracking-widest font-mono">
                        Got Questions?
                    </h2>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-900 font-display">
                        Frequently Asked Questions
                    </h3>
                </div>

                <div className="space-y-3.5">
                    {faqs.map((faq, index) => {
                        const isOpen = openFaq === index;
                        return (
                            <div
                                key={index}
                                className="bento-card bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all duration-200 shadow-2xs reveal-on-scroll"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm hover:text-teal-700 transition cursor-pointer"
                                >
                                    <span>{faq.q}</span>
                                    <div className={`p-1 rounded-full bg-slate-100 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180 bg-teal-50 text-teal-700' : ''}`}>
                                        <ChevronRight className="h-4 w-4 rotate-90" />
                                    </div>
                                </button>
                                {isOpen && (
                                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── BOTTOM CONVERSION CTA BANNER ─────────────────────────── */}
            <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto w-full">
                <div className="bg-[#0f172a] text-white px-8 sm:px-16 py-14 sm:py-20 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-7 relative overflow-hidden reveal-on-scroll">
                    {/* subtle background glow */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Transparent eyebrow label — no pill, no border */}
                    <p className="text-xs font-bold tracking-[0.18em] uppercase text-teal-400 z-10">
                        Real-Time Telemetry &nbsp;•&nbsp; Edge-Native &nbsp;•&nbsp; Zero Cloud Lock-In
                    </p>

                    {/* Main heading */}
                    <h3 className="text-4xl sm:text-5xl font-bold tracking-tight font-display text-white leading-[1.1] max-w-2xl z-10">
                        Ready to Monitor Every Animal in Real Time?
                    </h3>

                    {/* Subtitle */}
                    <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl z-10">
                        Register your ESP32 collar nodes, stream live vitals to your on-premises gateway, and get instant anomaly alerts — no cloud required.
                    </p>

                    {/* CTA Button */}
                    <button
                        onClick={() => navigate('/login')}
                        className="z-10 h-13 px-9 rounded-full bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold transition shadow-xl shadow-teal-900/40 hover:scale-[1.03] cursor-pointer flex items-center gap-2"
                    >
                        Launch Dashboard
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </section>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <footer className="border-t border-slate-200/80 py-10 px-4 sm:px-8 max-w-7xl mx-auto w-full text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <img src="/logo.svg" alt="MAVIS" className="h-6 w-6 rounded-full" />
                    <span className="font-bold text-slate-800">M.A.V.I.S</span>
                    <span>• Multi-Model Animal Vitality Intelligence System</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="font-mono text-slate-600 font-medium">Offline Edge Gateway: Ready</span>
                </div>
            </footer>
        </div>
    );
};
