/**
 * @file Veterinary Clinical Diagnostic & Multi-Model Local SLM Inference Service.
 * Implements a 100% offline, local-first multi-model inference cascade:
 *   Priority 1: Llama 3.2 (3B / 1B)
 *   Priority 2: Phi-3 Mini (3.8B)
 *   Priority 3: Gemma 2 (2B) / Qwen 2.5 (3B)
 *   Ultimate Fallback: Deterministic Clinical Safety Engine (Local in-memory rules)
 *
 * Zero cloud dependency. Zero data leaks. 100% on-premises.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const REQUEST_TIMEOUT_MS = 30000; // 30s max for local model inference

// Prioritized list of supported local models
const MODEL_PRIORITY = [
    "llama3.2:3b",
    "llama3.2",
    "llama3.2:1b",
    "phi3:mini",
    "phi3",
    "gemma2:2b",
    "gemma:2b",
    "qwen2.5:3b",
    "qwen2.5:1.5b",
    "mistral",
];

export class AIService {
    /**
     * Discovers which supported models are currently installed in the local Ollama instance.
     * @returns {Promise<string[]>} List of installed model names matching priority order.
     */
    async getAvailableLocalModels() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
                signal: controller.signal,
                headers: { "Content-Type": "application/json" }
            });
            clearTimeout(timeoutId);

            if (!res.ok) return [];

            const data = await res.json();
            const installedModels = (data.models || []).map(m => m.name.toLowerCase());

            // Order installed models by priority list
            const matched = [];
            for (const preferred of MODEL_PRIORITY) {
                const found = installedModels.find(m => m === preferred || m.startsWith(`${preferred}:`) || preferred.startsWith(m));
                if (found && !matched.includes(found)) {
                    matched.push(found);
                }
            }

            // Also include any other installed model not explicitly in priority list
            for (const installed of installedModels) {
                if (!matched.includes(installed)) {
                    matched.push(installed);
                }
            }

            return matched;
        } catch {
            // Ollama is offline or not installed
            return [];
        }
    }

    /**
     * Executes prompt on a specific local Ollama model with strict JSON formatting.
     * @param {string} modelName - Name of the Ollama model.
     * @param {string} systemPrompt - Grounded veterinary role and constraint instructions.
     * @param {string} userPrompt - Structured sensor telemetry packet.
     * @returns {Promise<Object|null>} Parsed JSON response or null on error.
     */
    async queryOllamaModel(modelName, systemPrompt, userPrompt) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
            const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    model: modelName,
                    system: systemPrompt,
                    prompt: userPrompt,
                    stream: false,
                    format: "json",
                    options: {
                        temperature: 0.2, // Low temperature for clinical determinism
                        num_predict: 200
                    }
                })
            });
            clearTimeout(timeoutId);

            if (!res.ok) return null;

            const json = await res.json();
            if (!json.response) return null;

            const parsed = JSON.parse(json.response);
            if (!parsed.summary || !parsed.riskLevel) return null;

            return parsed;
        } catch {
            clearTimeout(timeoutId);
            return null;
        }
    }

    /**
     * Builds structured veterinary prompt incorporating multi-modal sensor telemetry.
     */
    buildPrompts(animal, vitals, healthReport = {}) {
        const baseTemp = animal.baselines?.temperature;
        const baseHR = animal.baselines?.heartRate;
        const temp = vitals?.temperature;
        const hr = vitals?.heartRate;
        const rr = vitals?.respiratoryRate;
        const spo2 = vitals?.bloodOxygen;
        const motion = vitals?.motion;
        const lyingDown = vitals?.lyingDown;
        const ambientTemp = vitals?.ambientTemperature;
        const humidity = vitals?.humidity;
        const thi = vitals?.thi || healthReport.thi?.value;

        const tempDev = (baseTemp && temp) ? (temp - baseTemp).toFixed(1) : "0.0";
        const hrDev = (baseHR && hr) ? (hr - baseHR).toFixed(0) : "0";

        const systemPrompt = `You are the M.A.V.I.S Vitality Intelligence Assistant.
You translate live collar sensor telemetry and baseline trends into simple, clear, and professional health summaries that any animal owner or caregiver can easily understand.
Guidelines:
1. Avoid dense medical jargon (e.g. use 'fever' instead of 'pyrexia', 'difficulty breathing' instead of 'pulmonary gas exchange compromise', 'listen to breathing' instead of 'auscultation of lung fields').
2. Keep recommendations practical, direct, and easy to follow.
3. Return strictly valid JSON matching this schema:
{
  "riskLevel": "Low" | "Moderate" | "High" | "Critical",
  "summary": "1-2 simple, clear sentences explaining what is happening to the animal and why.",
  "differentialDiagnosis": ["Possible simple cause 1", "Possible simple cause 2"],
  "recommendations": ["Clear action step 1", "Clear action step 2"]
}`;

        const userPrompt = `Subject Profile:
- Name: ${animal.name}
- Species: ${animal.species || 'Bovine'}
- Breed: ${animal.breed || 'Standard'}
- Health Status: ${animal.healthStatus || 'healthy'}

Learned Baselines:
- Baseline Temperature: ${baseTemp ? `${baseTemp}°C` : '38.5°C'}
- Baseline Heart Rate: ${baseHR ? `${baseHR} BPM` : '70 BPM'}

Live Sensor Telemetry:
- Core Temperature: ${temp !== undefined ? `${temp}°C (Change: ${tempDev > 0 ? '+' : ''}${tempDev}°C)` : 'Offline'}
- Heart Rate: ${hr !== undefined ? `${hr} BPM (Change: ${hrDev > 0 ? '+' : ''}${hrDev} BPM)` : 'Offline'}
- Respiratory Rate: ${rr !== undefined ? `${rr} BPM` : 'N/A'}
- Blood Oxygen (SpO2): ${spo2 !== undefined ? `${spo2}%` : 'N/A'}
- Physical Motion: ${motion ? 'Active Motion' : 'Resting / Sitting'}
- Posture: ${lyingDown ? 'Lying Down' : 'Standing'}
- Environmental Temp: ${ambientTemp ? `${ambientTemp}°C` : 'N/A'}
- Humidity: ${humidity ? `${humidity}%` : 'N/A'}

Generate the simple, clear health assessment JSON now.`;

        return { systemPrompt, userPrompt };
    }

    /**
     * Deterministic Clinical Safety Engine fallback.
     * Evaluates multi-modal physiological rules in pure Node.js when all local SLMs are offline.
     */
    generateDeterministicFallback(animal, vitals, healthReport = {}) {
        if (!animal) {
            return {
                riskLevel: "Low",
                summary: "No subject selected for health analysis.",
                differentialDiagnosis: ["Awaiting Subject Selection"],
                recommendations: ["Select an animal profile from the registry."],
                source: "Deterministic Clinical Safety Engine"
            };
        }

        if (!vitals || vitals.temperature === null || vitals.temperature === undefined) {
            return {
                riskLevel: "Low",
                summary: `Collar telemetry is offline or awaiting initial sensor data for ${animal.name}.`,
                differentialDiagnosis: ["Collar Disconnected / Power Off"],
                recommendations: [
                    "Check collar battery and power switch.",
                    "Ensure the collar is snugly fitted around the animal's neck."
                ],
                source: "Deterministic Clinical Safety Engine"
            };
        }

        const temp = vitals.temperature;
        const hr = vitals.heartRate;
        const rr = vitals.respiratoryRate;
        const spo2 = vitals.bloodOxygen;
        const motion = vitals.motion;
        const baseTemp = animal.baselines?.temperature || 38.5;
        const baseHR = animal.baselines?.heartRate || 70;

        const tempDev = Math.round((temp - baseTemp) * 10) / 10;
        const hrDev = Math.round(hr - baseHR);

        let riskLevel = "Low";
        let summary = "";
        let differentialDiagnosis = [];
        let recommendations = [];

        // Clinical Evaluation Matrix with Simple, Human-Friendly Language
        if (temp >= 39.5 && !motion) {
            riskLevel = "Critical";
            summary = `High body temperature of ${temp.toFixed(1)}°C (+${tempDev}°C above normal) while resting. Indicates a high fever or heat stress for ${animal.name}.`;
            differentialDiagnosis = ["High Fever / Possible Infection", "Heat Stress / Overheating"];
            recommendations = [
                `Move ${animal.name} to a cool, shaded area with good airflow.`,
                "Provide fresh, cool drinking water.",
                "Call the vet if the fever does not go down after 30 minutes."
            ];
        } else if (spo2 && spo2 < 90) {
            riskLevel = "Critical";
            summary = `Low blood oxygen (${spo2}%) and fast breathing detected for ${animal.name}. The animal is having difficulty breathing comfortably.`;
            differentialDiagnosis = ["Breathing Difficulty", "Airway Irritation or Stress"];
            recommendations = [
                "Listen to chest breathing and check if breathing sounds clear.",
                "Ensure the airway is open and keep the animal resting quietly in shade.",
                "Contact the vet immediately if breathing does not ease."
            ];
        } else if (temp >= 39.3 && motion) {
            riskLevel = "Moderate";
            summary = `Body temperature (${temp.toFixed(1)}°C) is slightly warm, but this is normal after physical running or play.`;
            differentialDiagnosis = ["Normal Warmth from Activity / Exercise", "Mild Heat"];
            recommendations = [
                "Allow the animal 15–20 minutes to rest quietly in shade.",
                "Offer clean drinking water to help cool down."
            ];
        } else if (temp <= 37.0) {
            riskLevel = "High";
            summary = `Body temperature has dropped to ${temp.toFixed(1)}°C (${Math.abs(tempDev)}°C below normal). The animal is feeling cold or chilled.`;
            differentialDiagnosis = ["Cold Stress / Chilled Body", "Low Energy / Shock"];
            recommendations = [
                "Move the animal into a dry, warm shelter immediately.",
                "Provide warm bedding and protect from wind or cold drafts."
            ];
        } else if (hrDev >= 25 && !motion) {
            riskLevel = "Moderate";
            summary = `Resting heart rate is elevated at ${hr} BPM (+${hrDev} BPM above normal) while the animal is sitting still.`;
            differentialDiagnosis = ["Mild Pain or Discomfort", "Thirst or Stress Response"];
            recommendations = [
                "Check for signs of pain, limping, or discomfort.",
                "Ensure the animal has had plenty of water to drink."
            ];
        } else if (temp >= 39.1) {
            riskLevel = "Moderate";
            summary = `Mild temperature increase to ${temp.toFixed(1)}°C (+${tempDev}°C above baseline).`;
            differentialDiagnosis = ["Early Mild Fever", "Warm Weather Effect"];
            recommendations = [
                "Keep animal in comfortable shade and offer water.",
                "Re-check temperature in 1 hour."
            ];
        } else {
            riskLevel = "Low";
            summary = `All vitals are within normal, healthy ranges for ${animal.name}. Temperature (${temp.toFixed(1)}°C) and heart rate (${hr} BPM) are stable.`;
            differentialDiagnosis = ["Healthy Normal State"];
            recommendations = [
                "Continue standard feeding and daily care.",
                "Collar telemetry is operating normally."
            ];
        }

        return {
            riskLevel,
            summary,
            differentialDiagnosis,
            recommendations,
            source: "Deterministic Clinical Safety Engine"
        };
    }

    /**
     * Master Entrypoint: Generates veterinary clinical insights using the local SLM cascade,
     * seamlessly falling back to the Deterministic Safety Engine if all local models are unavailable.
     * 
     * @param {Object} animal - Animal profile with learned baselines.
     * @param {Object} latestVitals - Live sensor readings.
     * @param {Object} healthReport - Evaluated healthEngine metrics and THI.
     * @returns {Promise<Object>} Grounded clinical assessment with source metadata.
     */
    async generateAnimalInsight(animal, latestVitals = null, healthReport = {}) {
        const startTime = Date.now();

        // 1. If no vitals or offline, return clean baseline status immediately
        if (!latestVitals || latestVitals.temperature === null || latestVitals.temperature === undefined) {
            const fallback = this.generateDeterministicFallback(animal, latestVitals, healthReport);
            return {
                timestamp: new Date().toISOString(),
                animalName: animal?.name || "Subject",
                species: animal?.species || "Livestock",
                latencyMs: Date.now() - startTime,
                ...fallback
            };
        }

        // 2. Discover available local Ollama models on the machine
        const availableModels = await this.getAvailableLocalModels();

        // 3. Attempt local SLM cascade in priority order
        if (availableModels.length > 0) {
            const { systemPrompt, userPrompt } = this.buildPrompts(animal, latestVitals, healthReport);

            for (const model of availableModels) {
                try {
                    const result = await this.queryOllamaModel(model, systemPrompt, userPrompt);
                    if (result && result.summary && result.riskLevel) {
                        return {
                            timestamp: new Date().toISOString(),
                            animalName: animal.name,
                            species: animal.species,
                            riskLevel: result.riskLevel,
                            summary: result.summary,
                            differentialDiagnosis: Array.isArray(result.differentialDiagnosis) ? result.differentialDiagnosis : [],
                            recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
                            source: `Local SLM: ${model}`,
                            latencyMs: Date.now() - startTime
                        };
                    }
                } catch {
                    // Try next model in cascade
                    continue;
                }
            }
        }

        // 4. Ultimate Fallback: Deterministic Clinical Safety Engine
        const fallback = this.generateDeterministicFallback(animal, latestVitals, healthReport);
        return {
            timestamp: new Date().toISOString(),
            animalName: animal.name,
            species: animal.species,
            latencyMs: Date.now() - startTime,
            ...fallback
        };
    }
}

export default new AIService();
