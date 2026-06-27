import { RISK_THRESHOLDS } from '../constants/riskLevels.js';
import { HEALTH_STATUS } from '../constants/healthStatuses.js';


// Determine a global health status based on overall risk score.

export function determineHealthStatus(overallRiskScore = 0) {
  const score = Number(overallRiskScore);
  if (!Number.isFinite(score)) return HEALTH_STATUS.healthy;

  const statusByThreshold = [
    { min: RISK_THRESHOLDS.CRITICAL, status: HEALTH_STATUS.CRITICAL },
    { min: RISK_THRESHOLDS.WARNING, status: HEALTH_STATUS.WARNING },
  ];

  const match = statusByThreshold.find(({ min }) => score >= min);
  return match ? match.status : HEALTH_STATUS.NORMAL;
}








