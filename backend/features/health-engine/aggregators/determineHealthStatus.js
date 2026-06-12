// Determine a global health status based on overall risk score.

export function determineHealthStatus(overallRiskScore = 0) {
  const score = Number(overallRiskScore);
  if (!Number.isFinite(score)) return 'healthy';

  // Thresholds can be tuned later.
  if (score >= 60) return 'critical';
  if (score >= 25) return 'warning';
  return 'healthy';
}

