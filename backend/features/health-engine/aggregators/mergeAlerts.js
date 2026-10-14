import { SEVERITY_LEVELS } from '../constants/riskLevels.js';

/**
 * Encapsulates alert merging, deduplication, and severity ranking.
 */
export class AlertMerger {
    #severityRank = {
        [SEVERITY_LEVELS.CRITICAL]: 3,
        [SEVERITY_LEVELS.WARNING]: 2,
        [SEVERITY_LEVELS.NONE]: 1,
    };

    #compareSeverity(a, b) {
        return (this.#severityRank[a] ?? 0) - (this.#severityRank[b] ?? 0);
    }

    #formatAlert(alert, metric) {
        return {
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            value: alert.value,
            metric,
        };
    }

    /**
     * Merges and deduplicates metric alerts into a stable, UI-friendly list.
     * @param {Object} allMetricEvaluations
     * @returns {Array<Object>}
     */
    merge(allMetricEvaluations = {}) {
        const mergedByType = new Map();

        for (const [metric, evaluation] of Object.entries(allMetricEvaluations)) {
            if (!evaluation) continue;

            const alerts = Array.isArray(evaluation.alerts) ? evaluation.alerts : [];
            for (const alert of alerts) {
                if (!alert || !alert.type) continue;

                const normalized = this.#formatAlert(alert, metric);
                const existing = mergedByType.get(normalized.type);

                if (!existing) {
                    mergedByType.set(normalized.type, normalized);
                    continue;
                }

                if (this.#compareSeverity(normalized.severity, existing.severity) > 0) {
                    mergedByType.set(normalized.type, normalized);
                }
            }
        }

        return Array.from(mergedByType.values()).sort((a, b) => {
            const sa = this.#severityRank[a.severity] ?? 0;
            const sb = this.#severityRank[b.severity] ?? 0;
            if (sb !== sa) return sb - sa;
            return String(a.type).localeCompare(String(b.type));
        });
    }
}

export const alertMerger = new AlertMerger();
export const mergeAlerts = (evaluations) => alertMerger.merge(evaluations);
export default AlertMerger;