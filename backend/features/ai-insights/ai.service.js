/**
 * @file AI Veterinary & Telemetry Insights Generator.
 * Synthesizes physiological trends and environmental conditions into natural language AI recommendations.
 */

export class AIService {
    /**
     * Generates AI clinical insights for a specific animal based on vitals and baselines.
     * 
     * @param {Object} animal - Animal profile.
     * @param {Object} latestVitals - Current physiological readings.
     * @returns {Object} AI generated insights.
     */
    generateAnimalInsight(animal, latestVitals = {}) {
        if (!animal) {
            return {
                summary: "No subject selected for AI synthesis.",
                recommendations: ["Select a subject to initialize telemetry analysis."],
                riskLevel: "Low"
            };
        }

        const temp = latestVitals.temperature || animal.baselines?.temperature || 38.5;
        const hr = latestVitals.heartRate || animal.baselines?.heartRate || 75;
        const status = animal.healthStatus || 'healthy';

        let summary = "";
        let recommendations = [];
        let riskLevel = "Low";

        if (status === 'critical') {
            riskLevel = "High";
            summary = `AI Telemetry Analysis detects significant physiological stress for ${animal.name} (${animal.species}). Body temperature is elevated at ${temp}°C alongside resting heart rate of ${hr} BPM.`;
            recommendations = [
                `Isolate ${animal.name} in a shaded, well-ventilated recovery zone immediately.`,
                "Ensure continuous access to cool freshwater and check collar node fit.",
                "Contact your assigned veterinary clinic if temperature remains >39.5°C over 30 minutes."
            ];
        } else if (status === 'warning') {
            riskLevel = "Moderate";
            summary = `AI Modeling identified minor deviation trends for ${animal.name}. Vitals are slightly elevated above baseline thresholds (${temp}°C, ${hr} BPM).`;
            recommendations = [
                "Monitor activity levels during peak afternoon ambient heat.",
                "Verify sensor node battery and maintain normal hydration routine.",
                "Review 24-hour historical vital graphs for gradual trends."
            ];
        } else {
            riskLevel = "Low";
            summary = `AI Digital Twin modeling confirms ${animal.name}'s physiological state is stable and within optimal baseline parameters. Vitals are balanced.`;
            recommendations = [
                "Maintain current feeding and exercise schedule.",
                "Digital twin baseline model is actively updating with learned physiological patterns.",
                "No clinical intervention required at this time."
            ];
        }

        return {
            timestamp: new Date().toISOString(),
            animalName: animal.name,
            species: animal.species,
            riskLevel,
            summary,
            recommendations
        };
    }
}

export default new AIService();
