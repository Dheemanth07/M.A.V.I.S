export const heartRateMatrix = [
    {
        state: "Bradycardia",
        range: [0, 40],
        severity: "critical",
        riskContribution: 40,
        alertType: "bradycardia",
        recommendation: "Check for shock, severe trauma, or poisoning"
    },
    {
        state: "Low Heart Rate",
        range: [41, 47],
        severity: "warning",
        riskContribution: 15,
        alertType: "low-hr",
        recommendation: "Monitor resting state; flag if sustained"
    },
    {
        state: "Normal",
        range: [48, 84],
        severity: "none",
        riskContribution: 0,
        alertType: "none",
        recommendation: "Healthy baseline"
    },
    {
        state: "Elevated Heart Rate",
        range: [85, 100],
        severity: "warning",
        riskContribution: 15,
        alertType: "high-hr",
        recommendation: "Check ambient temperature for environmental heat stress"
    },
    {
        state: "Tachycardia",
        range: [100, Infinity],
        severity: "critical",
        riskContribution: 45,
        alertType: "tachycardia",
        recommendation: "Immediate veterinary exam required; check for systemic infection"
    }
];