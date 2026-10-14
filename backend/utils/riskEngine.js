/**
 * @file Rule-based Risk Engine (Object-Oriented Architecture)
 */

export class RiskEngine {
    #clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    #addRisk(alerts, condition, points, type, message) {
        if (condition) {
            alerts.push({ type, message, points });
            return points;
        }
        return 0;
    }

    /**
     * Analyzes incoming sensor reading against threshold matrix.
     * @param {Object} reading - Sensor telemetry reading
     * @returns {{ riskScore: number, riskLevel: string, alerts: Array<Object> }}
     */
    analyze(reading) {
        const { physiology, behavior = {}, environment = {}, device = {} } = reading;
        const alerts = [];
        let riskScore = 0;

        riskScore += this.#addRisk(
            alerts,
            physiology.temperature >= 40,
            35,
            "FEVER",
            "High body temperature detected",
        );
        riskScore += this.#addRisk(
            alerts,
            physiology.temperature <= 35,
            25,
            "HYPOTHERMIA",
            "Low body temperature detected",
        );
        riskScore += this.#addRisk(
            alerts,
            physiology.heartRate >= 140 || physiology.heartRate <= 45,
            20,
            "HEART_RATE",
            "Abnormal heart rate detected",
        );
        riskScore += this.#addRisk(
            alerts,
            physiology.respiratoryRate >= 45 || physiology.respiratoryRate <= 8,
            15,
            "RESPIRATION",
            "Abnormal respiratory rate detected",
        );
        riskScore += this.#addRisk(
            alerts,
            physiology.bloodOxygen <= 88,
            25,
            "LOW_OXYGEN",
            "Low blood oxygen detected",
        );
        riskScore += this.#addRisk(
            alerts,
            behavior.lyingDown === true && behavior.motion === false,
            10,
            "LOW_ACTIVITY",
            "Low activity pattern detected",
        );
        riskScore += this.#addRisk(
            alerts,
            environment.ambientTemperature >= 38,
            10,
            "HEAT_STRESS",
            "High ambient temperature may cause heat stress",
        );
        riskScore += this.#addRisk(
            alerts,
            device.batteryLevel !== undefined && device.batteryLevel < 20,
            10,
            "BATTERY",
            "Low wearable battery level",
        );
        riskScore += this.#addRisk(
            alerts,
            behavior.rumination === false && physiology.temperature >= 40,
            15,
            "RUMINAL_CESSATION",
            "Rumination cessation during febrile state (Acute Mastitis / Acidosis risk)",
        );
        riskScore += this.#addRisk(
            alerts,
            behavior.headShaking === true && (physiology.heartRate >= 140 || physiology.heartRate <= 45),
            15,
            "AGITATION_DISTRESS",
            "Persistent head shaking with abnormal heart rate (Parasitic / Neurological Distress)",
        );
        riskScore += this.#addRisk(
            alerts,
            physiology.hrv !== undefined && physiology.hrv < 20,
            20,
            "AUTONOMIC_STRESS",
            "Depressed Heart Rate Variability detected (Severe Autonomic Stress / Acute Pain)",
        );

        riskScore = this.#clamp(riskScore, 0, 100);

        let riskLevel = "healthy";
        if (riskScore >= 70) {
            riskLevel = "critical";
        } else if (riskScore >= 30) {
            riskLevel = "warning";
        }

        return {
            riskScore,
            riskLevel,
            alerts,
        };
    }
}

export const riskEngine = new RiskEngine();
export const analyzeSensorReading = (reading) => riskEngine.analyze(reading);
export default RiskEngine;
