// Kept for backward compatibility with existing aggregator modules.

export function formatAlert(alert, metric) {
  return {
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    value: alert.value,
    metric,
  };
}



