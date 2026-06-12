import { formatAlert } from './utils.js';
import { HEALTH_STATUSES } from '../constants/healthStatuses.js';



// Merges alerts from multiple metric evaluations.
// - Deduplicates by `type`.
// - Keeps the highest severity per type.
// - Produces a stable, UI-friendly merged list.

const severityRank = {
  [HEALTH_STATUSES.critical]: 3,
  [HEALTH_STATUSES.warning]: 2,
  none: 1,
};

function compareSeverity(a, b) {
  return (severityRank[a] ?? 0) - (severityRank[b] ?? 0);
}

export function mergeAlerts(allMetricEvaluations = {}) {
  const mergedByType = new Map();

  for (const [metric, evaluation] of Object.entries(allMetricEvaluations)) {
    if (!evaluation) continue;

    const alerts = Array.isArray(evaluation.alerts) ? evaluation.alerts : [];
    for (const alert of alerts) {
      if (!alert || !alert.type) continue;

      const normalized = formatAlert(alert, metric);
      const existing = mergedByType.get(normalized.type);

      if (!existing) {
        mergedByType.set(normalized.type, normalized);
        continue;
      }

      // Keep the alert with highest severity for this type.
      if (compareSeverity(normalized.severity, existing.severity) > 0) {
        mergedByType.set(normalized.type, normalized);
      }
    }
  }

  // deterministic ordering
  return Array.from(mergedByType.values()).sort((a, b) => {
    const sa = severityRank[a.severity] ?? 0;
    const sb = severityRank[b.severity] ?? 0;
    if (sb !== sa) return sb - sa;
    return String(a.type).localeCompare(String(b.type));
  });
}



