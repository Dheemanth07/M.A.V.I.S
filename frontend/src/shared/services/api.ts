import type { Animal, HealthStatusResponse, AlertItem } from '../types';

const API_BASE = 'http://localhost:5000/api';

function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const savedUser = localStorage.getItem('mavis_user');
    const activeRole = localStorage.getItem('mavis_active_role');

    if (savedUser) {
        try {
            const parsed = JSON.parse(savedUser);
            if (parsed.id) headers['x-user-id'] = parsed.id;
            headers['x-user-role'] = activeRole || parsed.role || 'user';
        } catch (e) {
            console.error('Error parsing saved user in API headers:', e);
        }
    } else if (activeRole) {
        headers['x-user-role'] = activeRole;
    }

    return headers;
}

export function sortAnimalsInOrder(animals: Animal[]): Animal[] {
    if (!Array.isArray(animals)) return [];
    return [...animals].sort((a, b) => {
        // Extract sequence numbers like -01, -02, -07, -08, #01, etc.
        const matchA = a.name?.match(/(?:[-_#\s]0*(\d+))/);
        const matchB = b.name?.match(/(?:[-_#\s]0*(\d+))/);
        if (matchA && matchB) {
            const numA = parseInt(matchA[1], 10);
            const numB = parseInt(matchB[1], 10);
            if (numA !== numB) return numA - numB;
        } else if (matchA && !matchB) {
            return -1; // Numbered seed animals come first in sequence
        } else if (!matchA && matchB) {
            return 1; // Unnumbered newly added animals append at the end
        }

        if (a.createdAt && b.createdAt) {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
    });
}

export async function fetchAnimals(): Promise<Animal[]> {
    const res = await fetch(`${API_BASE}/animals`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch animals');
    const json = await res.json();
    const list: Animal[] = json.data || json;
    return sortAnimalsInOrder(list);
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

export async function deleteAnimal(animalId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/animals/${animalId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to delete animal (Admin access required)');
    }
    return true;
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

export async function fetchAIInsight(animalId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/ai/${animalId}`, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    const json = await res.json();
    return json.data || json;
}

