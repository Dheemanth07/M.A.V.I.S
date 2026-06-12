export const humidityMatrix = [
    {
        state: "Low Humidity",
        range: [0, 39],
        severity: "warning",
        riskContribution: 5,
        alertType: "low-humidity",
        recommendation: "Dust control recommended; potential airway irritation"
    },
    {
        state: "Normal",
        range: [40, 69],
        severity: "none",
        riskContribution: 0,
        alertType: "none",
        recommendation: "Optimal environmental conditions"
    },
    {
        state: "High Humidity",
        range: [70, 85],
        severity: "warning",
        riskContribution: 5,
        alertType: "elevated-humidity",
        recommendation: "Monitor airflow; high humidity spikes pathogen risk"
    },
    {
        state: "Extreme Humidity",
        range: [86, 100],
        severity: "warning",
        riskContribution: 10,
        alertType: "high-humidity",
        recommendation: "Ensure active mechanical ventilation to reduce heat stress risk"
    }
];