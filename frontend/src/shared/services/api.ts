import type { Animal, HealthStatusResponse, AlertItem } from '../types';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const savedUser = localStorage.getItem('mavis_user');
    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            if (parsed.id) headers['x-user-id'] = parsed.id;
            if (parsed.role) headers['x-user-role'] = parsed.role;
        } catch (e) {
            console.error('Error parsing saved user in API headers:', e);
        }
    }
    return headers;
}

export async function fetchAnimals(): Promise<Animal[]> {
    const res = await fetch(`${API_BASE}/animals`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch animals');
    const json = await res.json();
    return json.data || json;
}

export async function createAnimal(animalData: Partial<Animal>): Promise<Animal> {
    const res = await fetch(`${API_BASE}/animals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(animalData),
    });
    if (!res.ok) throw new Error('Failed to create animal');
    const json = await res.json();
    return json.data || json;
}

export async function fetchHealthStatus(animalId: string): Promise<HealthStatusResponse> {
    const res = await fetch(`${API_BASE}/animals/${animalId}/health`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch health status');
    const json = await res.json();
    return json.data || json;
}

export async function fetchActiveAlerts(): Promise<AlertItem[]> {
    const res = await fetch(`${API_BASE}/alerts/active`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch active alerts');
    const json = await res.json();
    return json.data?.alerts || [];
}

export async function updateAlertStatus(alertId: string, status: 'acknowledged' | 'resolved'): Promise<AlertItem> {
    const res = await fetch(`${API_BASE}/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update alert status');
    const json = await res.json();
    return json.data?.alert || json;
}
