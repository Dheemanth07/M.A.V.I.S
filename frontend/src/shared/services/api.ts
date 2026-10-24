import type { Animal, HealthStatusResponse, AlertItem } from '../types';

const SEQ_REGEX = /(?:[-_#\s]0*(\d+))/;

/**
 * Client-Side API Communication Service (Object-Oriented Architecture).
 */
export class ApiService {
    private readonly apiBase: string;

    constructor(apiBase: string = 'http://localhost:5000/api') {
        this.apiBase = apiBase;
    }

    private getAuthHeaders(): Record<string, string> {
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

    /**
     * Sorts animals by embedded sequence numbers (e.g. Bessie-01, Luna-02) then by creation date.
     */
    public sortAnimalsInOrder(animals: Animal[]): Animal[] {
        if (!Array.isArray(animals)) return [];
        return [...animals].sort((a, b) => {
            const matchA = a.name?.match(SEQ_REGEX);
            const matchB = b.name?.match(SEQ_REGEX);
            if (matchA && matchB) {
                const numA = parseInt(matchA[1], 10);
                const numB = parseInt(matchB[1], 10);
                if (numA !== numB) return numA - numB;
            } else if (matchA && !matchB) {
                return -1;
            } else if (!matchA && matchB) {
                return 1;
            }

            if (a.createdAt && b.createdAt) {
                return a.createdAt.localeCompare(b.createdAt);
            }
            return 0;
        });
    }

    public async fetchAnimals(): Promise<Animal[]> {
        const res = await fetch(`${this.apiBase}/animals`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch animals');
        const json = await res.json();
        const list: Animal[] = json.data || json;
        return this.sortAnimalsInOrder(list);
    }

    public async createAnimal(animalData: Partial<Animal>): Promise<Animal> {
        const res = await fetch(`${this.apiBase}/animals`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(animalData),
        });
        if (!res.ok) throw new Error('Failed to create animal');
        const json = await res.json();
        return json.data || json;
    }

    public async deleteAnimal(animalId: string): Promise<boolean> {
        const res = await fetch(`${this.apiBase}/animals/${animalId}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || 'Failed to delete animal (Admin access required)');
        }
        return true;
    }

    public async fetchHealthStatus(animalId: string): Promise<HealthStatusResponse> {
        const res = await fetch(`${this.apiBase}/animals/${animalId}/health`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            const err: any = new Error(errJson.message || `Failed to fetch health status (${res.status})`);
            err.statusCode = res.status;
            throw err;
        }
        const json = await res.json();
        return json.data || json;
    }

    public async fetchActiveAlerts(): Promise<AlertItem[]> {
        const res = await fetch(`${this.apiBase}/alerts/active`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch active alerts');
        const json = await res.json();
        return json.data?.alerts || [];
    }

    public async updateAnimal(animalId: string, animalData: Partial<Animal>): Promise<Animal> {
        const res = await fetch(`${this.apiBase}/animals/${animalId}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(animalData),
        });
        if (!res.ok) {
            const errJson = await res.json().catch(() => ({}));
            throw new Error(errJson.message || 'Failed to update animal');
        }
        const json = await res.json();
        return json.data || json;
    }

    public async fetchSensorHistory(animalId: string, fromDate?: string, toDate?: string): Promise<any[]> {
        const queryParams = new URLSearchParams();
        if (fromDate) queryParams.set('from', fromDate);
        if (toDate) queryParams.set('to', toDate);
        const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const res = await fetch(`${this.apiBase}/sensor/history/${animalId}${queryStr}`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    }

    public async updateAlertStatus(alertId: string, status: 'acknowledged' | 'resolved'): Promise<AlertItem> {
        const res = await fetch(`${this.apiBase}/alerts/${alertId}/status`, {
            method: 'PATCH',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update alert status');
        const json = await res.json();
        return json.data?.alert || json;
    }

    public async fetchAIInsight(animalId: string): Promise<any> {
        const res = await fetch(`${this.apiBase}/ai/${animalId}`, {
            headers: this.getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch clinical insights');
        const json = await res.json();
        return json.data || json;
    }
}

export const apiService = new ApiService();

// Backward-compatible method exports
export const sortAnimalsInOrder = (animals: Animal[]) => apiService.sortAnimalsInOrder(animals);
export const fetchAnimals = () => apiService.fetchAnimals();
export const createAnimal = (data: Partial<Animal>) => apiService.createAnimal(data);
export const updateAnimal = (id: string, data: Partial<Animal>) => apiService.updateAnimal(id, data);
export const deleteAnimal = (id: string) => apiService.deleteAnimal(id);
export const fetchHealthStatus = (id: string) => apiService.fetchHealthStatus(id);
export const fetchSensorHistory = (id: string, from?: string, to?: string) => apiService.fetchSensorHistory(id, from, to);
export const fetchActiveAlerts = () => apiService.fetchActiveAlerts();
export const updateAlertStatus = (id: string, s: 'acknowledged' | 'resolved') => apiService.updateAlertStatus(id, s);
export const fetchAIInsight = (id: string) => apiService.fetchAIInsight(id);

export default apiService;
