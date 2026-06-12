export const batteryMatrix = [
    {
        state: "Critical Battery",
        range: [0, 5],
        severity: "critical",
        riskContribution: 0, // Hardware metrics do not alter biological health scores
        alertType: "dead-battery",
        recommendation: "Device failure imminent. Track final known location coordinates immediately"
    },
    {
        state: "Low Battery",
        range: [6, 20],
        severity: "warning",
        riskContribution: 0,
        alertType: "low-battery",
        recommendation: "Schedule device charging or battery swap at next corral rotation"
    },
    {
        state: "Normal",
        range: [21, 100],
        severity: "none",
        riskContribution: 0,
        alertType: "none",
        recommendation: "Device operational"
    }
];