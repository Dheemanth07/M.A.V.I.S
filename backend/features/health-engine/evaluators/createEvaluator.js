export function createEvaluator(metric, matrix) {
  return function evaluate(value) {
    // THE HYBRID CHECK
    const matchedRule = matrix.find(rule => {
      // 1. If the rule uses a function (the new way), use it
      if (typeof rule.check === "function") {
        return rule.check(value);
      }

      // 2. If the rule uses an array (your current way), evaluate the min/max
      if (Array.isArray(rule.range) && rule.range.length === 2) {
        return value >= rule.range[0] && value <= rule.range[1];
      }

      return false; // Failsafe
    });

    if (!matchedRule) {
      return {
        metric,
        value,
        state: "Unknown",
        severity: "none",
        riskContribution: 0,
        alerts: [],
        recommendation: "No rule matched",
      };
    }

    const alerts = matchedRule.severity !== "none"
      ? [
          {
            type: matchedRule.alertType,
            severity: matchedRule.severity,
            message: `${matchedRule.state} detected`,
            value,
          },
        ]
      : [];

    return {
      metric,
      value,
      state: matchedRule.state,
      severity: matchedRule.severity,
      riskContribution: matchedRule.riskContribution,
      alerts,
      recommendation: matchedRule.recommendation,
    };
  };
}

