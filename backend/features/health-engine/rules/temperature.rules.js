export const temperatureMatrix = [
    {
        state: "Hypothermia",
        range: [0, 37.0],
        severity: "critical",
        riskContribution: 30,
        alertType: "hypothermia",
        recommendation: "Immediate warming required."
    },
    {
        state: "Low Temperature",
        range: [37.0, 37.8],
        severity: "Warning",
        riskContribution: 15,
        alertType: "lowTemperature",
        recommendation: "Monitor temperature closely."
    },
    {
        state: "Normal",
        range: [37.9, 39.2],
        severity: "none",
        riskContribution: 0,
        alertType: "normal",
        recommendation: "Healthy baseline."
    },
    {
        state: "Elevated Temperature",
        range: [39.3, 40.0],
        severity: "Warning",
        riskContribution: 15,
        alertType: "elevatedTemperature",
        recommendation: "Monitor for potential fever."
    },
    {
        state: "Fever",
        range: [40.1, Infinity],
        severity: "Critical",
        riskContribution: 35,
        alertType: "fever",
        recommendation: "Seek veterinary care immediately."
    }
]