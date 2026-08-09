import { clampRisk } from '../utils/clampRisk.js';

/**
 * Computes an overall clinical risk score using Multi-Modal Synergistic Fusion.
 * 
 * Clinical Synergy Rules:
 * - Base: Sum of individual metric risk contributions.
 * - Febrile Lethargy (1.50x Multiplier): Severe fever + lack of physical motion indicates acute infection rather than physical play.
 * - Cardiorespiratory Distress (1.40x Multiplier): Tachycardia + Oxygenation Hypoxia indicates cardiovascular failure.
 * - Environmental Thermal Overload (1.30x Multiplier): Elevated body temperature + High THI (>=79) indicates heat stroke emergency.
 * 
 * @param {Object} allMetricEvaluations - Object of evaluated metrics (temperature, heartRate, oxygen, etc.)
 * @param {Object} [context={}] - Behavioral and environmental context (motion, thi, herdRisk)
 * @returns {number} Clamped clinical risk score [0, 100].
 */
export function calculateRiskScore(allMetricEvaluations = {}, context = {}) {
  let baseScore = 0;

  for (const evaluation of Object.values(allMetricEvaluations)) {
    if (!evaluation) continue;
    const v = Number(evaluation.riskContribution ?? 0);
    if (!Number.isFinite(v) || v < 0) continue;
    baseScore += v;
  }

  const tempSeverity = allMetricEvaluations.temperature?.severity;
  const hrSeverity = allMetricEvaluations.heartRate?.severity;
  const o2Severity = allMetricEvaluations.oxygen?.severity;
  const isFebrile = tempSeverity === 'Critical' || tempSeverity === 'critical' || tempSeverity === 'Warning' || tempSeverity === 'warning';
  const hasTachycardia = hrSeverity === 'Critical' || hrSeverity === 'critical';
  const isHypoxic = o2Severity === 'Critical' || o2Severity === 'critical';

  let synergyMultiplier = 1.0;

  // 1. Synergy: Febrile Lethargy (Fever with zero motion)
  if (isFebrile && (context.motion === false || context.lyingDown === true)) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.50);
  }

  // 2. Synergy: Cardiorespiratory Distress (Tachycardia + Hypoxia)
  if (hasTachycardia && isHypoxic) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.40);
  }

  // 3. Synergy: Thermal Overload (Fever + Ambient Heat Stress THI >= 79)
  if (isFebrile && context.thi && context.thi >= 79) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.30);
  }

  let finalScore = Math.round(baseScore * synergyMultiplier);

  // 4. Herd Contagion Pressure Contribution
  if (context.herdRiskScore && context.herdRiskScore > 0) {
    finalScore += Math.round(context.herdRiskScore * 0.20);
  }

  return clampRisk(finalScore, 0, 100);
}