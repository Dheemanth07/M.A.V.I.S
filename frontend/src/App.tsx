import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { Animal, AlertItem } from './shared/types';
import { fetchAnimals, fetchActiveAlerts } from './shared/services/api';
import { RoleHeader } from './shared/components/RoleHeader';
import { Navbar } from './shared/components/Navbar';
import { AlertBanner } from './features/alerts/AlertBanner';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { AuthPage } from './features/auth/pages/AuthPage';
import { ToastProvider, useToast } from './shared/context/ToastContext';
import { Activity } from 'lucide-react';

// Code-Splitting: Dynamic Lazy Imports for optimal initial bundle performance
const UserDashboardOverview = lazy(() => import('./features/dashboard/UserDashboardOverview').then(m => ({ default: m.UserDashboardOverview })));
const UserAnimalsView = lazy(() => import('./features/animals/UserAnimalsView').then(m => ({ default: m.UserAnimalsView })));
const AdminOverview = lazy(() => import('./features/admin/AdminOverview').then(m => ({ default: m.AdminOverview })));
const AdminSubjectRegistry = lazy(() => import('./features/admin/AdminSubjectRegistry').then(m => ({ default: m.AdminSubjectRegistry })));
const AnalyticsSection = lazy(() => import('./features/analytics/AnalyticsSection').then(m => ({ default: m.AnalyticsSection })));
const DigitalTwinMonitor = lazy(() => import('./features/digital-twin/DigitalTwinMonitor').then(m => ({ default: m.DigitalTwinMonitor })));
const AlertCenter = lazy(() => import('./features/alerts/AlertCenter').then(m => ({ default: m.AlertCenter })));

function PageLoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 text-slate-500">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 animate-pulse">
                <Activity className="h-6 w-6 animate-spin" />
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase">Loading Workspace Module...</span>
        </div>
    );
}

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

        const socket: Socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000
        });

        socket.on('connect', () => {
            setConnected(true);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        let lastSocketTime = 0;
        socket.on('alert', (newAlert: any) => {
            const now = Date.now();
            if (now - lastSocketTime < 1000) return; // 1s throttle protection
            lastSocketTime = now;

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
            }
            loadInitialData();
        });

        return () => {
            socket.removeAllListeners();
            setTimeout(() => {
                if (socket.connected) {
                    socket.disconnect();
                }
            }, 100);
        };
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    const currentRole = accountRole === 'admin' ? activeRole : 'user';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
            <RoleHeader
                role={currentRole}
                accountRole={accountRole}
                setRole={handleSetRole}
                connected={connected}
            />

            <Navbar
                activeAlertCount={alerts.filter(a => a && a.status === 'active').length}
                role={currentRole}
            />

            <AlertBanner
                alert={activeToastAlert}
                onDismiss={() => setActiveToastAlert(null)}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
                <Suspense fallback={<PageLoadingSpinner />}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                </Suspense>
            </main>

            <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 font-medium">
                <p className="m-0">M.A.V.I.S Multi Model Animal Vitality Intelligence System • Role-Protected Workspace</p>
            </footer>
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
