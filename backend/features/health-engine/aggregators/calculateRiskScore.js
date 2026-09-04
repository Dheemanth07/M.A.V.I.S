import { clampRisk } from '../utils/clampRisk.js';

/**
 * Computes an overall clinical risk score using Multi-Modal Synergistic Fusion.
 * 
 * Clinical Synergy Rules (100% Physical Hardware Sensors):
 * - Base: Sum of individual metric risk contributions.
 * - Febrile Lethargy (1.50x Multiplier): Severe fever + lack of physical motion indicates acute infection rather than physical play.
 * - Cardiorespiratory Distress (1.40x Multiplier): Tachycardia + Oxygenation Hypoxia indicates cardiovascular failure.
 * - Systemic Septicemia / SIRS (1.35x Multiplier): High fever + Tachycardia indicates systemic infection entering bloodstream.
 * - Resting Tachycardia / Acute Pain (1.25x Multiplier): Racing heart rate while motionless with no fever indicates severe trauma or colic.
 * 
 * @param {Object} allMetricEvaluations - Object of evaluated metrics (temperature, heartRate, oxygen, etc.)
 * @param {Object} [context={}] - Behavioral and environmental context (motion, herdRisk)
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

  // 1. Synergy: Febrile Lethargy (Fever + Zero Motion) -> DS18B20 + MPU6050 (temp + motion)
  if (isFebrile && (context.motion === false || context.lyingDown === true)) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.50);
  }

  // 2. Synergy: Cardiorespiratory Distress (Tachycardia + Hypoxia) -> MAX30102 (HR + SpO2)
  if (hasTachycardia && isHypoxic) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.40);
  }

  // 3. Synergy: Systemic Septicemia / SIRS (Fever + Tachycardia) -> DS18B20 + MAX30102 (temp + heartRate)
  if (isFebrile && hasTachycardia) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.35);
  }

  // 4. Synergy: Resting Tachycardia / Acute Pain (High HR + Zero Motion, No Fever) -> MAX30102 + MPU6050 (heartRate + motion)
  if (hasTachycardia && (context.motion === false || context.lyingDown === true) && !isFebrile) {
    synergyMultiplier = Math.max(synergyMultiplier, 1.25);
  }

  let finalScore = Math.round(baseScore * synergyMultiplier);

  // 4. Herd Contagion Pressure Contribution
  if (context.herdRiskScore && context.herdRiskScore > 0) {
    finalScore += Math.round(context.herdRiskScore * 0.20);
  }

  return clampRisk(finalScore, 0, 100);
}
