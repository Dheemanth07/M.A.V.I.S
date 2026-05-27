export const thiMatrix = [
    {
        state: "Normal",
        range: [0, 71],
        severity: "none",
        riskContribution: 0,
        alertType: "none",
        recommendation: "Comfortable environmental conditions"
    },
    {
        state: "Mild Heat Stress",
        range: [72, 78],
        severity: "warning",
        riskContribution: 10,
        alertType: "mild-heat-stress",
        recommendation: "Ensure clear access to abundant clean drinking water and shade"
    },
    {
        state: "Severe Heat Stress",
        range: [79, 88],
        severity: "warning",
        riskContribution: 25,
        alertType: "severe-heat-stress",
        recommendation: "Activate cooling fans, shades, or direct corral sprinklers"
    },
    {
        state: "Deadly Heat Danger",
        range: [89, 100],
        severity: "critical",
        riskContribution: 45,
        alertType: "extreme-heat-danger",
        recommendation: "High mortality risk. Initiate emergency thermal relief protocols immediately"
    }
];