import assert from "node:assert/strict";
import { analyzeSensorReading } from "../utils/riskEngine.js";
import { 
    calculateHerdGraphRisk, 
    calculateZoneWeight, 
    calculateSpeciesWeight 
} from "../features/health-engine/herdGraph.service.js";

const healthyReading = {
    physiology: {
        temperature: 38.4,
        heartRate: 84,
        respiratoryRate: 22,
        bloodOxygen: 97,
    },
    behavior: {
        motion: true,
        lyingDown: false,
    },
    environment: {
        ambientTemperature: 28,
    },
    device: {
        batteryLevel: 80,
    },
};

const tests = [
    {
        name: "marks normal physiological readings as healthy (score = 0)",
        run: () => {
            const result = analyzeSensorReading(healthyReading);
            assert.equal(result.riskLevel, "healthy");
            assert.equal(result.riskScore, 0);
            assert.equal(result.alerts.length, 0);
        },
    },
    {
        name: "detects moderate fever and classifies as warning tier",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    ...healthyReading.physiology,
                    temperature: 40.2, // +35 points (>= 40)
                },
            });
            assert.equal(result.riskLevel, "warning");
            assert.equal(result.riskScore, 35);
            assert.equal(result.alerts.length, 1);
            assert.equal(result.alerts[0].type, "FEVER");
        },
    },
    {
        name: "detects hypothermia and low activity correctly",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    ...healthyReading.physiology,
                    temperature: 34.5, // +25 points (<= 35)
                },
                behavior: {
                    motion: false,
                    lyingDown: true, // +10 points
                },
            });
            assert.equal(result.riskLevel, "warning");
            assert.equal(result.riskScore, 35);
            assert.ok(result.alerts.some((a) => a.type === "HYPOTHERMIA"));
            assert.ok(result.alerts.some((a) => a.type === "LOW_ACTIVITY"));
        },
    },
    {
        name: "detects tachycardia and low blood oxygen as critical",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    ...healthyReading.physiology,
                    heartRate: 155, // +20 points (>= 140)
                    bloodOxygen: 82, // +25 points (<= 88)
                    temperature: 40.5, // +35 points (>= 40)
                },
            });
            assert.equal(result.riskLevel, "critical");
            assert.equal(result.riskScore, 80);
            assert.ok(result.alerts.some((a) => a.type === "FEVER"));
            assert.ok(result.alerts.some((a) => a.type === "HEART_RATE"));
            assert.ok(result.alerts.some((a) => a.type === "LOW_OXYGEN"));
        },
    },
    {
        name: "clamps maximum risk score strictly to 100",
        run: () => {
            const result = analyzeSensorReading({
                physiology: {
                    temperature: 42.0, // +35
                    heartRate: 160,    // +20
                    respiratoryRate: 55, // +15
                    bloodOxygen: 80,   // +25
                },
                behavior: {
                    motion: false,
                    lyingDown: true,   // +10
                },
                environment: {
                    ambientTemperature: 42, // +10
                },
                device: {
                    batteryLevel: 10,  // +10 (Total points = 125)
                },
            });
            assert.equal(result.riskLevel, "critical");
            assert.equal(result.riskScore, 100, "Risk score must be clamped at 100");
            assert.equal(result.alerts.length, 7);
        },
    },
    {
        name: "handles missing optional environment/device fields gracefully",
        run: () => {
            const result = analyzeSensorReading({
                physiology: {
                    temperature: 38.5,
                    heartRate: 80,
                    respiratoryRate: 20,
                    bloodOxygen: 98,
                },
            });
            assert.equal(result.riskLevel, "healthy");
            assert.equal(result.riskScore, 0);
            assert.equal(result.alerts.length, 0);
        },
    },
    {
        name: "detects 6-axis febrile ruminal cessation synergy (mastitis/acidosis)",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    ...healthyReading.physiology,
                    temperature: 40.4, // +35 (fever)
                },
                behavior: {
                    motion: false,
                    lyingDown: true, // +10
                    rumination: false, // +15 (ruminal cessation during fever)
                },
            });
            assert.equal(result.riskLevel, "warning");
            assert.equal(result.riskScore, 60); // 35 + 10 + 15 = 60
            assert.ok(result.alerts.some((a) => a.type === "RUMINAL_CESSATION"));
            assert.ok(result.alerts.some((a) => a.type === "FEVER"));
        },
    },
    {
        name: "detects 6-axis behavioral agitation with tachycardia",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    ...healthyReading.physiology,
                    heartRate: 148, // +20
                },
                behavior: {
                    motion: true,
                    headShaking: true, // +15 (parasitic / neurological agitation)
                },
            });
            assert.equal(result.riskLevel, "warning");
            assert.equal(result.riskScore, 35); // 20 + 15 = 35
            assert.ok(result.alerts.some((a) => a.type === "AGITATION_DISTRESS"));
            assert.ok(result.alerts.some((a) => a.type === "HEART_RATE"));
        },
    },
    {
        name: "detects depressed HRV autonomic stress (< 20ms)",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    ...healthyReading.physiology,
                    hrv: 14, // +20 (Severe pain / autonomic stress)
                },
            });
            assert.equal(result.riskLevel, "healthy"); // 20 points is under warning (< 30)
            assert.equal(result.riskScore, 20);
            assert.ok(result.alerts.some((a) => a.type === "AUTONOMIC_STRESS"));
        },
    },
    // Herd Graph & Epidemiological Topology Tests (Zero Phantom GPS)
    {
        name: "calculates species-specific susceptibility weight accurately",
        run: () => {
            assert.equal(calculateSpeciesWeight("cow", "cow"), 1.00);      // Same species
            assert.equal(calculateSpeciesWeight("cow", "goat"), 0.35);     // Cross-ruminant
            assert.equal(calculateSpeciesWeight("bovine", "sheep"), 0.35);  // Cross-ruminant
            assert.equal(calculateSpeciesWeight("cow", "dog"), 0.05);      // Non-transmissible
        },
    },
    {
        name: "implicitly assigns unassigned animals to same closed space (weight 0.90) and isolates different places / quarantine",
        run: () => {
            const animalA = { name: "Bessie" };
            const animalB = { name: "Clarabelle" };
            // Implicit single closed space / herd when unassigned
            assert.equal(calculateZoneWeight(animalA, animalB), 0.90);

            // Same explicit closed space / barn
            const cowPen1 = { name: "Cow1", herd: "Barn-A" };
            const cowPen2 = { name: "Cow2", herd: "Barn-A" };
            assert.equal(calculateZoneWeight(cowPen1, cowPen2), 0.90);

            // Different places / separate enclosures
            const cowHerdNorth = { name: "CowNorth", herd: "Place-1" };
            const cowHerdSouth = { name: "CowSouth", herd: "Place-2" };
            assert.equal(calculateZoneWeight(cowHerdNorth, cowHerdSouth), 0.05);

            // Quarantine ward isolation
            const sickQuarantine = { name: "SickCow", herd: "Quarantine-Ward" };
            assert.equal(calculateZoneWeight(cowHerdNorth, sickQuarantine), 0.05);
        },
    },
    {
        name: "calculates herd contagion risk and triggers epidemiological exposure warnings",
        run: () => {
            const targetAnimal = {
                _id: "60d5ec49f1b2c8b1f8e4e1a1",
                name: "Target Cow",
                species: "cow",
                herd: "Barn-Alpha",
                healthStatus: "healthy"
            };

            const sickBarnNeighbor = {
                _id: "60d5ec49f1b2c8b1f8e4e1a2",
                name: "Sick Neighbor",
                species: "cow",
                herd: "Barn-Alpha", // Same closed space
                healthStatus: "critical" // Neighbor risk = 80 -> 80 * (1.0 * 0.90) = 72
            };

            const isolatedCow = {
                _id: "60d5ec49f1b2c8b1f8e4e1a3",
                name: "Quarantined Cow",
                species: "cow",
                herd: "Quarantine-Ward",
                healthStatus: "critical" // 80 * (1.0 * 0.05) = 4
            };

            // Test 1: In same closed space with critical neighbor
            const resultSameHerd = calculateHerdGraphRisk(targetAnimal, [targetAnimal, sickBarnNeighbor]);
            assert.equal(resultSameHerd.herdRiskScore, 72);
            assert.ok(resultSameHerd.warnings.some(w => w.includes("CONTAGION RISK")));

            // Test 2: In quarantine ward, contagion transmission is suppressed
            const targetQuarantined = { ...targetAnimal, herd: "Place-West" };
            const resultQuarantine = calculateHerdGraphRisk(targetQuarantined, [targetQuarantined, isolatedCow]);
            assert.ok(resultQuarantine.herdRiskScore <= 5, `Expected quarantined risk <= 5, got ${resultQuarantine.herdRiskScore}`);

            // Test 3: Implicit single herd default
            const implicitA = { _id: "1", name: "A", species: "cow", healthStatus: "healthy" };
            const implicitB = { _id: "2", name: "B", species: "cow", healthStatus: "critical" };
            const resultImplicit = calculateHerdGraphRisk(implicitA, [implicitA, implicitB]);
            assert.equal(resultImplicit.herdRiskScore, 72);
            assert.ok(resultImplicit.warnings.length > 0);
        },
    },
];

let passed = 0;
for (const test of tests) {
    test.run();
    console.log(`✓ PASS: ${test.name}`);
    passed++;
}

console.log(`\n========================================`);
console.log(`All ${passed} Risk Engine & Herd Graph Unit Tests Passed!`);
console.log(`========================================`);

