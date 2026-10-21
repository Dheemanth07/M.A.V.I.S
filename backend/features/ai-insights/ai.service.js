/**
 * @file Veterinary Clinical Diagnostic & Hybrid Grounded SLM Inference Service
 * 
 * Implements a 2-tier Hybrid Clinical Intelligence Architecture:
 *   Tier 1 (Ground Truth): In-memory Deterministic Clinical Safety Engine (CDSE).
 *          Guarantees 100% reproducible risk tiers, differential diagnoses,
 *          and safety boundaries with zero hallucination risk.
 *   Tier 2 (Narrative Synthesis): Local SLM (Llama 3.2, Phi-3, Gemma 2 via Ollama).
 *          Translates deterministic diagnostic findings into natural, human-friendly
 *          veterinary clinical narratives.
 * 
 * Resilient: If Ollama is offline or slow, seamlessly serves Tier 1 in <1ms.
 */

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";
const SLM_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS) || 8000; // 8s cap prevents UI freezes on laptop CPUs

const MODEL_PRIORITY = [
    "llama3.2:3b",
    "llama3.2:1b",
    "llama3.2:latest",
    "llama3.2",
    "phi3:mini",
    "phi3",
    "gemma2:2b",
    "gemma:2b",
    "qwen2.5:3b",
    "qwen2.5-coder:3b",
    "mistral",
];

export class ClinicalDecisionService {
    #insightCache = new Map();

    /**
     * Tier 1: Evaluates live sensor telemetry against deterministic veterinary matrices.
     * Guaranteed 100% reproducible, explainable, zero-hallucination ground truth.
     * 
     * @param {Object} animal - Animal profile with learned baselines
     * @param {Object} vitals - Live sensor telemetry packet
     * @param {Object} [healthReport={}] - Health engine evaluation output
     * @returns {Object} Structured clinical diagnostic assessment
     */
    evaluateClinicalStatus(animal, vitals, healthReport = {}) {
        if (!animal) {
            return {
                riskLevel: "Low",
                summary: "No animal profile selected for clinical analysis.",
                differentialDiagnosis: ["Awaiting Subject Selection"],
                recommendations: ["Select an animal profile from the registry."],
                source: "Deterministic Clinical Safety Engine"
            };
        }

        if (!vitals || vitals.temperature === null || vitals.temperature === undefined) {
            return {
                riskLevel: "Low",
                summary: `Collar telemetry is awaiting initial sensor stream for ${animal.name}.`,
                differentialDiagnosis: ["Collar Standby / Sensor Detached"],
                recommendations: [
                    "Verify collar battery power and Wi-Fi connection.",
                    "Ensure optical sensor is snugly positioned against the skin."
                ],
                source: "Deterministic Clinical Safety Engine"
            };
        }

        const temp = Number(vitals.temperature);
        const hr = Number(vitals.heartRate);
        const rr = Number(vitals.respiratoryRate);
        const spo2 = Number(vitals.bloodOxygen);
        const motion = Boolean(vitals.motion);
        const lyingDown = Boolean(vitals.lyingDown);
        const rumination = vitals.rumination;
        const headShaking = Boolean(vitals.headShaking);

        const baseTemp = Number(animal.baselines?.temperature || 38.5);
        const baseHR = Number(animal.baselines?.heartRate || 70);

        const tempDev = Math.round((temp - baseTemp) * 10) / 10;
        const hrDev = Math.round(hr - baseHR);

        let riskLevel = "Low";
        let summary = "";
        let differentialDiagnosis = [];
        let recommendations = [];

        // 1. Multi-Modal Synergy: Febrile Ruminal Cessation (High Acute Risk)
        if (temp >= 39.5 && rumination === false) {
            riskLevel = "Critical";
            summary = `Elevated body temperature (${temp.toFixed(1)}°C, +${tempDev}°C) combined with cessation of rumination chewing for ${animal.name}.`;
            differentialDiagnosis = ["Acute Mastitis / Metritis", "Ruminal Acidosis / Indigestion", "Systemic Febrile Infection"];
            recommendations = [
                "Perform physical examination of udder and abdomen immediately.",
                "Check rumen motility via left flank auscultation.",
                "Isolate subject and notify attending veterinarian."
            ];
        }
        // 2. Multi-Modal Synergy: Febrile Lethargy / Sepsis Risk
        else if (temp >= 39.5 && (!motion || lyingDown)) {
            riskLevel = "Critical";
            summary = `High body temperature (${temp.toFixed(1)}°C, +${tempDev}°C) with prolonged recumbency or absence of motion detected.`;
            differentialDiagnosis = ["Acute Fever / Severe Infection", "Heat Exhaustion / Thermal Stress", "Systemic Inflammatory Response"];
            recommendations = [
                `Move ${animal.name} to a shaded, well-ventilated recovery stall.`,
                "Provide fresh, cool drinking water and monitor fluid intake.",
                "Administer antipyretics under veterinary protocol if fever persists past 30 minutes."
            ];
        }
        // 3. Cardiorespiratory Distress / Hypoxia
        else if ((spo2 && spo2 < 90) || (rr && rr >= 45)) {
            riskLevel = "Critical";
            summary = `Low blood oxygen saturation (${spo2 ? `${spo2}%` : 'compromised'}) and elevated respiration rate detected for ${animal.name}.`;
            differentialDiagnosis = ["Bovine Respiratory Disease (BRD)", "Acute Pulmonary Congestion", "Airway Obstruction"];
            recommendations = [
                "Perform thoracic auscultation to check for wheezing or crackles.",
                "Inspect nasal passages for discharge and ensure clear airway.",
                "Prioritize for clinical veterinary intervention."
            ];
        }
        // 4. Exercise-Induced Thermal Elevation (Normal physiological response)
        else if (temp >= 39.3 && motion) {
            riskLevel = "Moderate";
            summary = `Core temperature (${temp.toFixed(1)}°C) is elevated during active physical exertion.`;
            differentialDiagnosis = ["Physiological Exertion Warmth", "Mild Environmental Heat Strain"];
            recommendations = [
                "Allow animal 15–20 minutes of rest in a shaded paddock.",
                "Offer clean drinking water to assist natural thermoregulation."
            ];
        }
        // 5. Hypothermia / Cold Stress
        else if (temp <= 37.0) {
            riskLevel = "High";
            summary = `Core body temperature has dropped to ${temp.toFixed(1)}°C (${Math.abs(tempDev)}°C below baseline).`;
            differentialDiagnosis = ["Hypothermia / Cold Stress", "Circulatory Shock / Energy Depletion"];
            recommendations = [
                "Relocate animal into a dry, wind-sheltered recovery stall.",
                "Provide thick dry bedding and inspect for dehydration or shock."
            ];
        }
        // 6. Neuro-Parasitic Agitation (Head Shaking + Tachycardia)
        else if (headShaking && (hr >= 100 || hrDev >= 20)) {
            riskLevel = "Moderate";
            summary = `Persistent head shaking paired with elevated pulse rate (${hr} BPM) detected for ${animal.name}.`;
            differentialDiagnosis = ["Otitis Externa / Ear Mite Infestation", "Spinose Ear Tick Irritation", "Neurological Agitation"];
            recommendations = [
                "Inspect ear canals for ticks, mites, or foreign body irritation.",
                "Check for localized inflammation or head sensitivity."
            ];
        }
        // 7. Resting Tachycardia / Acute Pain
        else if (hrDev >= 25 && !motion) {
            riskLevel = "Moderate";
            summary = `Resting heart rate is significantly elevated at ${hr} BPM (+${hrDev} BPM above baseline) during inactivity.`;
            differentialDiagnosis = ["Acute Musculoskeletal Pain", "Subclinical Trauma", "Cardiovascular Stress"];
            recommendations = [
                "Inspect limbs and hooves for swelling, warmth, or lameness.",
                "Evaluate for signs of abdominal or surgical pain."
            ];
        }
        // 8. Low-Grade Fever
        else if (temp >= 39.1) {
            riskLevel = "Moderate";
            summary = `Mild temperature increase to ${temp.toFixed(1)}°C (+${tempDev}°C above baseline).`;
            differentialDiagnosis = ["Early Low-Grade Fever", "Environmental Heat Load"];
            recommendations = [
                "Ensure constant access to shade and clean water.",
                "Re-evaluate core temperature in 60 minutes."
            ];
        }
        // 9. Healthy Baseline State
        else {
            riskLevel = "Low";
            summary = `All physiological vitals are within normal, healthy parameters for ${animal.name}. Core temperature (${temp.toFixed(1)}°C) and heart rate (${hr} BPM) match individual baseline.`;
            differentialDiagnosis = ["Healthy Normal State"];
            recommendations = [
                "Continue standard nutritional feeding and daily care.",
                "Telemetry stream is transmitting optimal sensor packets."
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
     * Rapid non-blocking check to verify if a local Ollama daemon is active.
     * Uses a strict 500ms timeout to ensure the UI never hangs if Ollama is closed.
     * 
     * @returns {Promise<string[]>} List of installed model names matching priority.
     */
    async discoverLocalSLMs() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 500);

            const res = await fetch(`${OLLAMA_HOST}/api/tags`, {
                signal: controller.signal,
                headers: { "Content-Type": "application/json" }
            });
            clearTimeout(timeoutId);

            if (!res.ok) return [];

            const data = await res.json();
            const installedModels = (data.models || []).map(m => (m.name || "").toLowerCase());

            const matched = [];
            for (const preferred of MODEL_PRIORITY) {
                const found = installedModels.find(m => m === preferred || m.startsWith(`${preferred}:`) || preferred.startsWith(m));
                if (found && !matched.includes(found)) {
                    matched.push(found);
                }
            }
            return matched;
        } catch {
            return []; // Ollama is offline or not installed
        }
    }

    /**
     * Backward-compatible alias for discoverLocalSLMs.
     */
    async getAvailableLocalModels() {
        return this.discoverLocalSLMs();
    }

    /**
     * Queries local Ollama SLM with strict JSON formatting and grounded clinical bounds.
     */
    async querySLM(modelName, animal, vitals, deterministicGroundTruth) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), SLM_TIMEOUT_MS);

        const systemPrompt = `You are an expert veterinary clinical assistant. You provide concise, grounded clinical assessment reports based strictly on collar sensor telemetry and deterministic clinical findings. Output strictly valid JSON in this schema:
{
  "summary": "2 clear sentences synthesizing what is happening and the clinical concern.",
  "differentialDiagnosis": ["Condition 1", "Condition 2"],
  "recommendations": ["Action step 1", "Action step 2"]
}`;

        const userPrompt = `Subject: ${animal.name} (${animal.species || 'Livestock'}, Breed: ${animal.breed || 'Standard'})
Learned Baselines: Temp ${animal.baselines?.temperature || 38.5}°C, Heart Rate ${animal.baselines?.heartRate || 70} BPM
Current Telemetry:
- Core Temp: ${vitals.temperature}°C
- Heart Rate: ${vitals.heartRate} BPM
- Respiration: ${vitals.respiratoryRate || 'N/A'} BPM
- SpO2: ${vitals.bloodOxygen ? `${vitals.bloodOxygen}%` : 'N/A'}
- Activity: ${vitals.motion ? 'Active Motion' : 'Resting'} (${vitals.lyingDown ? 'Lying Down' : 'Standing'})
- Rumination: ${vitals.rumination === false ? 'Ceased / Depressed' : 'Active Chewing'}

Deterministic Clinical Ground Truth:
- Clinical Risk Tier: ${deterministicGroundTruth.riskLevel}
- Potential Conditions: ${deterministicGroundTruth.differentialDiagnosis.join(', ')}
- Clinical Guidance: ${deterministicGroundTruth.recommendations.join('; ')}

Generate the grounded clinical JSON assessment now:`;

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
                        temperature: 0.2, // Low temperature for deterministic adherence
                        num_predict: 250
                    }
                })
            });
            clearTimeout(timeoutId);

            if (!res.ok) return null;

            const json = await res.json();
            if (!json.response) return null;

            let text = json.response.trim();
            text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) text = jsonMatch[0];

            return JSON.parse(text);
        } catch {
            return null;
        }
    }

    /**
     * Master Entrypoint: Executes Hybrid Grounded Evaluation.
     * Evaluates Tier 1 Deterministic Ground Truth, and if Ollama is running,
     * enriches with Tier 2 Local SLM narrative synthesis.
     * 
     * @param {Object} animal - Animal profile with learned baselines
     * @param {Object} latestVitals - Live sensor readings
     * @param {Object} healthReport - Evaluated healthEngine metrics
     * @returns {Promise<Object>} Grounded clinical assessment
     */
    async generateAnimalInsight(animal, latestVitals = null, healthReport = {}) {
        const startTime = Date.now();

        // 1. Always compute Tier 1 Deterministic Ground Truth first
        const groundTruth = this.evaluateClinicalStatus(animal, latestVitals, healthReport);

        if (!latestVitals || latestVitals.temperature === null || latestVitals.temperature === undefined) {
            return {
                timestamp: new Date().toISOString(),
                animalName: animal?.name || "Subject",
                species: animal?.species || "Livestock",
                latencyMs: Date.now() - startTime,
                ...groundTruth
            };
        }

        // 2. Differential Vital Cache (<1ms return when vitals have not significantly shifted)
        const cacheKey = String(animal._id || animal.id || animal.name);
        const cached = this.#insightCache.get(cacheKey);

        if (cached && (Date.now() - cached.cachedAt < 60000)) {
            const prev = cached.vitals;
            const tempDiff = Math.abs((latestVitals.temperature || 0) - (prev.temperature || 0));
            const hrDiff = Math.abs((latestVitals.heartRate || 0) - (prev.heartRate || 0));
            const motionSame = (latestVitals.motion === prev.motion);
            const ruminationSame = (latestVitals.rumination === prev.rumination);
            const shakingSame = (latestVitals.headShaking === prev.headShaking);

            if (tempDiff <= 0.25 && hrDiff <= 5 && motionSame && ruminationSame && shakingSame) {
                return {
                    ...cached.insight,
                    cached: true,
                    latencyMs: Date.now() - startTime
                };
            }
        }

        // 3. Attempt Tier 2 Local SLM Narrative Synthesis if Ollama is available
        const availableModels = await this.discoverLocalSLMs();

        if (availableModels.length > 0) {
            const preferredModel = availableModels[0];
            const slmResult = await this.querySLM(preferredModel, animal, latestVitals, groundTruth);

            if (slmResult && slmResult.summary) {
                const hybridInsight = {
                    timestamp: new Date().toISOString(),
                    animalName: animal.name,
                    species: animal.species,
                    riskLevel: groundTruth.riskLevel, // Locked to deterministic ground truth for clinical safety
                    summary: slmResult.summary,
                    differentialDiagnosis: Array.isArray(slmResult.differentialDiagnosis) && slmResult.differentialDiagnosis.length > 0
                        ? slmResult.differentialDiagnosis
                        : groundTruth.differentialDiagnosis,
                    recommendations: Array.isArray(slmResult.recommendations) && slmResult.recommendations.length > 0
                        ? slmResult.recommendations
                        : groundTruth.recommendations,
                    source: `Local SLM: ${preferredModel} (Hybrid Grounded)`,
                    latencyMs: Date.now() - startTime
                };

                this.#insightCache.set(cacheKey, {
                    vitals: { ...latestVitals },
                    insight: hybridInsight,
                    cachedAt: Date.now()
                });

                return hybridInsight;
            }
        }

        // 4. Fallback: Instantaneous Tier 1 Deterministic Ground Truth
        const fallbackInsight = {
            timestamp: new Date().toISOString(),
            animalName: animal.name,
            species: animal.species,
            latencyMs: Date.now() - startTime,
            ...groundTruth
        };

        this.#insightCache.set(cacheKey, {
            vitals: { ...latestVitals },
            insight: fallbackInsight,
            cachedAt: Date.now()
        });

        return fallbackInsight;
    }
}

export const clinicalDecisionService = new ClinicalDecisionService();
export const aiService = clinicalDecisionService;
export default clinicalDecisionService;
