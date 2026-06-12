import { clampRisk } from '../utils/clampRisk.js';

// Computes a single overall risk score from per-metric evaluations.
// Strategy:
// - Sum `riskContribution` across metrics.
// - Clamp to [0, 100] for consistent UI/thresholding.

export function calculateRiskScore(allMetricEvaluations = {}) {
  let score = 0;

  for (const evaluation of Object.values(allMetricEvaluations)) {
    if (!evaluation) continue;
    const v = Number(evaluation.riskContribution ?? 0);
    if (!Number.isFinite(v) || v < 0) continue;
    score += v;
  }

  // Keep behavior stable even if thresholds change elsewhere.
  return clampRisk(score, 0, 100);
}