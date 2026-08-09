import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { Animal, AlertItem } from './shared/types';
import { fetchAnimals, fetchActiveAlerts } from './shared/services/api';
import { Navbar } from './shared/components/Navbar';
import { AlertBanner } from './features/alerts/AlertBanner';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { AuthPage } from './features/auth/pages/AuthPage';
import { ToastProvider, useToast } from './shared/context/ToastContext';
import { LandingPage } from './features/landing/LandingPage';
import { UserDashboardOverview } from './features/dashboard/UserDashboardOverview';
import { AdminOverview } from './features/admin/AdminOverview';
import { AdminSubjectRegistry } from './features/admin/AdminSubjectRegistry';
import { UserAnimalsView } from './features/animals/UserAnimalsView';
import { AnalyticsSection } from './features/analytics/AnalyticsSection';
import { DigitalTwinMonitor } from './features/digital-twin/DigitalTwinMonitor';
import { AlertCenter } from './features/alerts/AlertCenter';

function AppContent() {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [connected, setConnected] = useState(false);
    const [activeToastAlert, setActiveToastAlert] = useState<AlertItem | null>(null);

    const accountRole = user?.role || 'user';
    const [activeRole, setActiveRole] = useState<'user' | 'admin'>(() => {
        const savedRole = localStorage.getItem('mavis_active_role');
        if (savedRole === 'user' || savedRole === 'admin') return savedRole;
        return user?.role || 'user';
    });

    useEffect(() => {
        if (user?.role && !localStorage.getItem('mavis_active_role')) {
            setActiveRole(user.role);
        }
    }, [user?.id, user?.role]);

    const handleSetRole = (newRole: 'user' | 'admin') => {
        if (accountRole === 'admin') {
            setActiveRole(newRole);
            localStorage.setItem('mavis_active_role', newRole);
        }
    };

    const loadInitialData = async () => {
        try {
            const animalsData = await fetchAnimals();
            setAnimals(animalsData || []);
            const alertsData = await fetchActiveAlerts();
            setAlerts(alertsData || []);
        } catch (err) {
            console.error('Error fetching backend data:', err);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) return;

        loadInitialData();

        // 1. Resilient & Battery-Efficient Socket.IO configuration
        const socket: Socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 15,          // Circuit breaker: prevents infinite battery drain
            reconnectionDelay: 1000,           // Starts with rapid 1s retry
            reconnectionDelayMax: 10000,       // Caps at 10s heartbeat (0% CPU idle)
            timeout: 10000
        });

        socket.on('connect', () => {
            setConnected(true);
            loadInitialData(); // Sync any data generated while offline
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('reconnect_failed', () => {
            console.warn('Socket circuit breaker activated: Server unreachable. Entering dormant low-power state.');
            setConnected(false);
        });

        const playWarningChime = () => {
            if (user?.alertSettings?.soundAlerts === false) return;
            try {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                if (!AudioCtx) return;
                const ctx = new AudioCtx();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } catch (e) {
                // AudioContext autoplay restrictions
            }
        };

        socket.on('alert', (newAlert: any) => {
            if (newAlert) {
                const alertObj: AlertItem = {
                    _id: newAlert.id || String(Date.now()),
                    animalId: newAlert.animalId || 'Live Telemetry Node',
                    type: newAlert.type || 'ANOMALY',
                    severity: newAlert.type === 'ANOMALY' ? 'critical' : 'warning',
                    message: newAlert.message || 'Vital deviation detected in live stream',
                    status: 'active',
                    createdAt: newAlert.timestamp || new Date().toISOString(),
                };

                setActiveToastAlert(alertObj);
                showToast(alertObj.message, alertObj.severity === 'critical' ? 'error' : 'warning');

                if (alertObj.severity === 'critical') {
                    playWarningChime();
                    if ('Notification' in window && Notification.permission === 'granted') {
                        try {
                            new Notification('MAVIS Critical Alert', {
                                body: alertObj.message,
                                icon: '/favicon.ico'
                            });
                        } catch (e) {
                            // Ignored if browser policy restricts
                        }
                    }
                }
            }
            loadInitialData();
        });

        // 2. Dynamic Telemetry Polling Timer based on user collarSettings
        const pollSec = user?.collarSettings?.syncInterval || 5;
        const pollTimer = setInterval(() => {
            if (!document.hidden) {
                loadInitialData();
            }
        }, pollSec * 1000);

        // 3. Page Visibility API: Auto-sleep when phone/tab is in background; auto-wake on return
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                if (!socket.connected) {
                    socket.connect();
                }
                loadInitialData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(pollTimer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            socket.removeAllListeners();
            setTimeout(() => {
                if (socket.connected) {
                    socket.disconnect();
                }
            }, 100);
        };
    }, [isAuthenticated, user?.collarSettings?.syncInterval, user?.alertSettings?.soundAlerts]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        );
    }

    const currentRole = accountRole === 'admin' ? activeRole : 'user';

    return (
        <div className="min-h-screen clinical-grid-canvas text-slate-900 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-900 pt-3 sm:pt-4">
            <Navbar
                activeAlertCount={alerts.filter(a => a && a.status === 'active').length}
                role={currentRole}
                accountRole={accountRole}
                setRole={handleSetRole}
                connected={connected}
            />

            <AlertBanner
                alert={activeToastAlert}
                onDismiss={() => setActiveToastAlert(null)}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            currentRole === 'admin' ? (
                                <AdminOverview animals={animals} onRefresh={loadInitialData} />
                            ) : (
                                <UserDashboardOverview animals={animals} alerts={alerts} />
                            )
                        }
                    />
                    <Route
                        path="/animals"
                        element={
                            currentRole === 'admin' ? (
                                <AdminSubjectRegistry animals={animals} onRefresh={loadInitialData} />
                            ) : (
                                <UserAnimalsView animals={animals} onRefresh={loadInitialData} />
                            )
                        }
                    />
                    <Route path="/analytics" element={<AnalyticsSection animals={animals} />} />
                    <Route path="/twin" element={<DigitalTwinMonitor animals={animals} role={currentRole} />} />
                    <Route path="/alerts" element={<AlertCenter alerts={alerts} onRefresh={loadInitialData} />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </main>
        </div>
    );
}

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
