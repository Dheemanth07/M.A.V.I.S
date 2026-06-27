export interface Animal {
    _id: string;
    name: string;
    species: string;
    breed?: string;
    age?: number;
    weight?: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
    baselineReadingsCount: number;
    baselines: {
        temperature: number;
        heartRate: number;
        respiratoryRate: number;
        bloodOxygen: number;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface CurrentMetrics {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    bloodOxygen: number;
    motion: boolean;
    ambientTemperature: number | string;
    battery: number | string;
}

export interface Deviations {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    bloodOxygen: number;
}

export interface HealthStatusResponse {
    animalId: string;
    name: string;
    status: 'healthy' | 'warning' | 'critical' | 'unknown';
    alerts: string[];
    lastReading?: string;
    baselineReadingsCount?: number;
    baselines?: Animal['baselines'];
    currentMetrics?: CurrentMetrics;
    deviations?: Deviations;
}

export interface AlertItem {
    _id: string;
    animalId: {
        _id: string;
        name: string;
        species: string;
        breed?: string;
    } | string;
    type: 'ANOMALY' | 'BATTERY' | 'FEVER' | string;
    severity: 'critical' | 'warning' | 'none' | string;
    message: string;
    metric?: string;
    value?: number;
    status: 'active' | 'acknowledged' | 'resolved';
    createdAt: string;
}
