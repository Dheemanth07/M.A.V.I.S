import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import type { Animal, AlertItem } from './shared/types';
import { fetchAnimals, fetchActiveAlerts } from './shared/services/api';
import { RoleHeader } from './shared/components/RoleHeader';
import { Navbar } from './shared/components/Navbar';
import { AlertBanner } from './features/alerts/components/AlertBanner';
import { UserDashboardOverview } from './features/dashboard/components/UserDashboardOverview';
import { UserAnimalsView } from './features/animals/components/UserAnimalsView';
import { AdminOverview } from './features/admin/components/AdminOverview';
import { AdminSubjectRegistry } from './features/admin/components/AdminSubjectRegistry';
import { AnalyticsSection } from './features/analytics/components/AnalyticsSection';
import { DigitalTwinMonitor } from './features/digital-twin/components/DigitalTwinMonitor';
import { AlertCenter } from './features/alerts/components/AlertCenter';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { AuthPage } from './features/auth/pages/AuthPage';

function AppContent() {
    const { user, isAuthenticated } = useAuth();
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [connected, setConnected] = useState(false);
    const [activeToastAlert, setActiveToastAlert] = useState<AlertItem | null>(null);

    const accountRole = user?.role || 'user';
    const [activeRole, setActiveRole] = useState<'user' | 'admin'>(accountRole);

    useEffect(() => {
        if (user?.role) {
            setActiveRole(user.role);
        }
    }, [user?.id]);

    const handleSetRole = (newRole: 'user' | 'admin') => {
        if (accountRole === 'admin') {
            setActiveRole(newRole);
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

        socket.on('alert', (newAlert: any) => {
            console.log('Real-time Socket Alert received:', newAlert);

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
            }
            loadInitialData();
        });

        return () => {
            socket.removeAllListeners();
            socket.disconnect();
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
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
