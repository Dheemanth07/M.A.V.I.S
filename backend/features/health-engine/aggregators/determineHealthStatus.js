import { RISK_THRESHOLDS } from '../constants/riskLevels.js';
import { HEALTH_STATUS } from '../constants/healthStatuses.js';

/**
 * Encapsulates global health status determination.
 */
export class HealthStatusDeterminer {
    #warningThreshold;
    #criticalThreshold;

    constructor(warning = RISK_THRESHOLDS.WARNING, critical = RISK_THRESHOLDS.CRITICAL) {
        this.#warningThreshold = warning;
        this.#criticalThreshold = critical;
    }

    /**
     * Determines health status from numeric score [0, 100].
     * @param {number} overallRiskScore
     * @returns {'healthy' | 'warning' | 'critical'}
     */
    determine(overallRiskScore = 0) {
        const score = Number(overallRiskScore);
        if (!Number.isFinite(score) || score < this.#warningThreshold) {
            return HEALTH_STATUS.HEALTHY;
        }

        if (score >= this.#criticalThreshold) {
            return HEALTH_STATUS.CRITICAL;
        }

        return HEALTH_STATUS.WARNING;
    }
}

export const healthStatusDeterminer = new HealthStatusDeterminer();
export const determineHealthStatus = (score) => healthStatusDeterminer.determine(score);
export default HealthStatusDeterminer;
