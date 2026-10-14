import { clampRisk } from '../utils/clampRisk.js';

/**
 * Computes an overall clinical risk score using Multi-Modal Synergistic Fusion.
 * Encapsulated as an Object-Oriented Calculator.
 */
export class RiskScoreCalculator {
    /**
     * @param {Object} allMetricEvaluations - Object of evaluated metrics
     * @param {Object} [context={}] - Behavioral and environmental context
     * @returns {number} Clamped clinical risk score [0, 100].
     */
    calculate(allMetricEvaluations = {}, context = {}) {
        let baseScore = 0;

        for (const evaluation of Object.values(allMetricEvaluations)) {
            if (!evaluation) continue;
            const v = Number(evaluation.riskContribution ?? 0);
            if (!Number.isFinite(v) || v < 0) continue;
            baseScore += v;
        }

        const tempSev = allMetricEvaluations.temperature?.severity?.toLowerCase();
        const hrSev = allMetricEvaluations.heartRate?.severity?.toLowerCase();
        const o2Sev = allMetricEvaluations.oxygen?.severity?.toLowerCase();
        const isFebrile = tempSev === 'critical' || tempSev === 'warning';
        const hasTachycardia = hrSev === 'critical';
        const isHypoxic = o2Sev === 'critical';

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

        // 4. Synergy: Resting Tachycardia / Acute Pain (High HR + Zero Motion, No Fever) -> MAX30102 + MPU6050
        if (hasTachycardia && (context.motion === false || context.lyingDown === true) && !isFebrile) {
            synergyMultiplier = Math.max(synergyMultiplier, 1.25);
        }

        // 5. Synergy: Febrile Ruminal Cessation (Fever + Dropped Rumination) -> DS18B20 + MPU6050 Gyro
        if (isFebrile && context.rumination === false) {
            synergyMultiplier = Math.max(synergyMultiplier, 1.65);
        }

        // 6. Synergy: Neuro-Parasitic Agitation (Tachycardia + Persistent Head Shaking) -> MAX30102 + MPU6050 Gyro
        if (hasTachycardia && context.headShaking === true) {
            synergyMultiplier = Math.max(synergyMultiplier, 1.30);
        }

        let finalScore = Math.round(baseScore * synergyMultiplier);

        // 7. Herd Contagion Pressure Contribution
        if (context.herdRiskScore && context.herdRiskScore > 0) {
            finalScore += Math.round(context.herdRiskScore * 0.20);
        }

        return clampRisk(finalScore, 0, 100);
    }
}

export const riskScoreCalculator = new RiskScoreCalculator();
export const calculateRiskScore = (evaluations, context) => riskScoreCalculator.calculate(evaluations, context);
export default RiskScoreCalculator;
