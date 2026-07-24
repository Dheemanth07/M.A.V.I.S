import type { Animal } from '../types';

/**
 * Downloads an array of Animal telemetry objects as a formatted CSV file.
 */
export function exportAnimalsToCSV(animals: Animal[], filename = 'mavis_telemetry_export.csv') {
    if (!animals || animals.length === 0) return;

    const headers = [
        'ID',
        'Name',
        'Species',
        'Breed',
        'Health Status',
        'Temperature (°C)',
        'Heart Rate (BPM)',
        'Respiratory Rate',
        'Blood Oxygen (%)',
        'Device ID',
        'Created At'
    ];

    const rows = animals.map(a => [
        `"${a._id}"`,
        `"${a.name}"`,
        `"${a.species}"`,
        `"${a.breed || 'N/A'}"`,
        `"${a.healthStatus || 'healthy'}"`,
        a.baselines?.temperature || 38.2,
        a.baselines?.heartRate || 72,
        a.baselines?.respiratoryRate || 22,
        a.baselines?.bloodOxygen || 98,
        `"${a.deviceId || a.collarId || 'ESP32-COLLAR-01'}"`,
        `"${a.createdAt || new Date().toISOString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Downloads an array of Animal telemetry objects as a formatted JSON file.
 */
export function exportAnimalsToJSON(animals: Animal[], filename = 'mavis_telemetry_export.json') {
    if (!animals || animals.length === 0) return;

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(animals, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
