import { RISK_LEVELS } from '../constants/riskLevels.js';
import { HEALTH_STATUSES } from '../constants/healthStatuses.js';



// Determine a global health status based on overall risk score.

export function determineHealthStatus(overallRiskScore = 0) {
  const score = Number(overallRiskScore);
  if (!Number.isFinite(score)) return HEALTH_STATUSES.healthy;

  if (score >= 60) return HEALTH_STATUSES.critical;
  if (score >= RISK_LEVELS.warning) return HEALTH_STATUSES.warning;
  return HEALTH_STATUSES.healthy;
}



