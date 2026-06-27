import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Animal, AlertItem } from './types';
import { fetchAnimals, fetchActiveAlerts } from './services/api';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { HerdManagement } from './components/HerdManagement';
import { AnalyticsSection } from './components/AnalyticsSection';
import { DigitalTwinMonitor } from './components/DigitalTwinMonitor';
import { AlertCenter } from './components/AlertCenter';

export function App() {
    const [activeTab, setActiveTab] = useState<'overview' | 'herd' | 'analytics' | 'twin' | 'alerts'>('overview');
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [alerts, setAlerts] = useState<AlertItem[]>([]);
    const [connected, setConnected] = useState(false);

    const loadInitialData = async () => {
        try {
            const animalsData = await fetchAnimals();
            setAnimals(animalsData);
            const alertsData = await fetchActiveAlerts();
            setAlerts(alertsData);
        } catch (err) {
            console.error('Error fetching backend data:', err);
        }
    };

    useEffect(() => {
        loadInitialData();

        // Connect to Socket.IO server at http://localhost:5000
        const socket: Socket = io('http://localhost:5000', {
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            setConnected(true);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('alert', (newAlert: any) => {
            console.log('Real-time Socket Alert received:', newAlert);
            // Refresh database data when alert triggers
            loadInitialData();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
            <Navbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                connected={connected}
                activeAlertCount={alerts.filter(a => a.status === 'active').length}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
                {activeTab === 'overview' && (
                    <DashboardOverview
                        animals={animals}
                        alerts={alerts}
                        setActiveTab={setActiveTab}
                    />
                )}

                {activeTab === 'herd' && (
                    <HerdManagement
                        animals={animals}
                        onRefresh={loadInitialData}
                    />
                )}

                {activeTab === 'analytics' && (
                    <AnalyticsSection
                        animals={animals}
                    />
                )}

                {activeTab === 'twin' && (
                    <DigitalTwinMonitor
                        animals={animals}
                    />
                )}

                {activeTab === 'alerts' && (
                    <AlertCenter
                        alerts={alerts}
                        onRefresh={loadInitialData}
                    />
                )}
            </main>

            <footer className="border-t border-slate-800/80 py-6 px-4 text-center text-xs text-slate-500">
                <p className="m-0">M.A.V.I.S Autonomous Veterinary Intelligence System • Personalised Digital Twin Core</p>
            </footer>
        </div>
    );
}

export default App;
