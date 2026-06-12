import { RISK_LEVELS } from '../constants/riskLevels.js';
import { HEALTH_STATUS } from '../constants/healthStatuses.js';

// Determine a global health status based on overall risk score.

export function determineHealthStatus(overallRiskScore = 0) {
  const score = Number(overallRiskScore);
  if (!Number.isFinite(score)) return HEALTH_STATUS.healthy;

  if (score >= RISK_THRESHOLDS.CRITICAL) return HEALTH_STATUS.CRITICAL;
  if (score >= RISK_THRESHOLDS.WARNING) return HEALTH_STATUS.WARNING;
  return HEALTH_STATUS.NORMAL;
}



