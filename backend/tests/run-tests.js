import assert from "node:assert/strict";
import { analyzeSensorReading } from "../utils/riskEngine.js";

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
];

let passed = 0;
for (const test of tests) {
    test.run();
    console.log(`✓ PASS: ${test.name}`);
    passed++;
}

console.log(`\n========================================`);
console.log(`All ${passed} Risk Engine Unit Tests Passed!`);
console.log(`========================================`);
