export const oxygenMatrix = [
    {
        state: "Critical Hypoxia",
        range: [0, 84],
        severity: "critical",
        riskContribution: 50,
        alertType: "severe-hypoxia",
        recommendation: "Emergency intervention; high risk of acute respiratory distress"
    },
    {
        state: "Mild Hypoxia",
        range: [85, 92],
        severity: "warning",
        riskContribution: 25,
        alertType: "mild-hypoxia",
        recommendation: "Isolate animal; evaluate for bovine respiratory disease (BRD)"
    },
    {
        state: "Normal",
        range: [93, 100],
        severity: "none",
        riskContribution: 0,
        alertType: "none",
        recommendation: "Optimal oxygen saturation"
    }
];