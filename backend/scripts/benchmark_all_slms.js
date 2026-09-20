/**
 * @file benchmark_all_slms.js
 * Runs a side-by-side clinical inference comparison across all local SLM models installed in Ollama.
 */

import aiService from "../features/ai-insights/ai.service.js";

async function benchmarkAllSLMs() {
    console.log("==================================================================");
    console.log("         MAVIS MULTI-MODEL LOCAL SLM INFERENCE BENCHMARK          ");
    console.log("==================================================================\n");

    const availableModels = await aiService.getAvailableLocalModels();
    
    if (availableModels.length === 0) {
        console.error("❌ No local Ollama models found! Ensure Ollama is running (`ollama serve`).");
        process.exit(1);
    }

    console.log(`✓ Detected ${availableModels.length} Installed Local SLMs:`);
    availableModels.forEach((m, idx) => console.log(`  ${idx + 1}. ${m}`));
    console.log("\n------------------------------------------------------------------");

    // Sample clinical subject with multi-vital telemetry
    const sampleAnimal = {
        name: "Max",
        species: "Canine",
        breed: "Golden Retriever",
        healthStatus: "warning",
        baselines: {
            temperature: 38.5,
            heartRate: 75
        }
    };

    const sampleVitals = {
        temperature: 40.1,      // +1.6 C fever
        heartRate: 125,         // +50 BPM tachycardia
        respiratoryRate: 36,    // elevated respiration
        bloodOxygen: 96,
        motion: false,          // resting
        lyingDown: true,        // posture
        ambientTemperature: 31,
        humidity: 65
    };

    const { systemPrompt, userPrompt } = aiService.buildPrompts(sampleAnimal, sampleVitals);

    console.log(`\n📋 Clinical Telemetry Scenario:`);
    console.log(`- Subject: ${sampleAnimal.name} (${sampleAnimal.breed})`);
    console.log(`- Core Temp: ${sampleVitals.temperature}°C (Fever +1.6°C above baseline)`);
    console.log(`- Heart Rate: ${sampleVitals.heartRate} BPM (Resting Tachycardia)`);
    console.log(`- Respiration: ${sampleVitals.respiratoryRate} RR (Elevated)`);
    console.log("\n🚀 Starting SLM Cascade Execution...\n");

    for (const model of availableModels) {
        console.log(`▶ Running Model: [ ${model} ] ...`);
        const start = Date.now();
        
        try {
            const response = await aiService.queryOllamaModel(model, systemPrompt, userPrompt);
            const duration = ((Date.now() - start) / 1000).toFixed(2);

            if (response && response.summary) {
                console.log(`  ✓ Completed in ${duration}s`);
                console.log(`  • Risk Assessment: [ ${response.riskLevel} ]`);
                console.log(`  • Clinical Summary: "${response.summary}"`);
                console.log(`  • Differential Causes: ${JSON.stringify(response.differentialDiagnosis || [])}`);
                console.log(`  • Recommendations: ${JSON.stringify(response.recommendations || [])}\n`);
            } else {
                console.log(`  ⚠️ Model [ ${model} ] did not return valid JSON output format.\n`);
            }
        } catch (err) {
            console.log(`  ❌ Failed to query [ ${model} ]: ${err.message}\n`);
        }
    }

    console.log("==================================================================");
    console.log("  Benchmark Complete! All models tested with 100% local privacy.  ");
    console.log("==================================================================");
}

benchmarkAllSLMs();
