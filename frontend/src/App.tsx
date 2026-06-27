import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Animal, AlertItem } from './types';
import { fetchAnimals, fetchActiveAlerts } from './services/api';
import { RoleHeader } from './components/RoleHeader';
import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { UserDashboardOverview } from './components/UserDashboardOverview';
import { UserAnimalsView } from './components/UserAnimalsView';
import { AdminOverview } from './components/AdminOverview';
import { AdminSubjectRegistry } from './components/AdminSubjectRegistry';
import { AnalyticsSection } from './components/AnalyticsSection';
import { DigitalTwinMonitor } from './components/DigitalTwinMonitor';
import { AlertCenter } from './components/AlertCenter';

export function App() {
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [activeTab, setActiveTab] = useState<'dashboard' | 'animals' | 'alerts' | 'analytics' | 'twin'>('dashboard');
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [connected, setConnected] = useState(false);
    const [activeToastAlert, setActiveToastAlert] = useState<AlertItem | null>(null);

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
        loadInitialData();

        // Connect to Socket.IO server at http://localhost:5000 with clean auto-reconnect
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
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
            {/* Testing Role Switcher & Environment Bar */}
            <RoleHeader
                role={role}
                setRole={setRole}
                connected={connected}
            />

            {/* Light Bento App Navbar */}
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeAlertCount={alerts.filter(a => a && a.status === 'active').length}
                role={role}
            />

            {/* Real-time Socket.IO Alert Banner */}
            <AlertBanner
                alert={activeToastAlert}
                onDismiss={() => setActiveToastAlert(null)}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    role === 'admin' ? (
                        <AdminOverview
                            animals={animals}
                            onRefresh={loadInitialData}
                        />
                    ) : (
                        <UserDashboardOverview
                            animals={animals}
                            alerts={alerts}
                            setActiveTab={setActiveTab}
                        />
                    )
                )}

                {/* MY ANIMALS / SUBJECT REGISTRY TAB */}
                {activeTab === 'animals' && (
                    role === 'admin' ? (
                        <AdminSubjectRegistry
                            animals={animals}
                            onRefresh={loadInitialData}
                        />
                    ) : (
                        <UserAnimalsView
                            animals={animals}
                        />
                    )
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && (
                    <AnalyticsSection
                        animals={animals}
                    />
                )}

                {/* DIGITAL TWIN TAB */}
                {activeTab === 'twin' && (
                    <DigitalTwinMonitor
                        animals={animals}
                    />
                )}

                {/* ALERTS TAB */}
                {activeTab === 'alerts' && (
                    <AlertCenter
                        alerts={alerts}
                        onRefresh={loadInitialData}
                    />
                )}
            </main>

            <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 font-medium">
                <p className="m-0">M.A.V.I.S Multi Model Animal Vitality Intelligence System • Light Bento Box UI</p>
            </footer>
        </div>
    );
}

export default App;
