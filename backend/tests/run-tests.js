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
        name: "marks normal readings as healthy",
        run: () => {
            const result = analyzeSensorReading(healthyReading);

            assert.equal(result.riskLevel, "healthy");
            assert.equal(result.riskScore, 0);
            assert.equal(result.alerts.length, 0);
        },
    },
    {
        name: "marks combined abnormal readings as critical",
        run: () => {
            const result = analyzeSensorReading({
                ...healthyReading,
                physiology: {
                    temperature: 41,
                    heartRate: 152,
                    respiratoryRate: 50,
                    bloodOxygen: 85,
                },
                behavior: {
                    motion: false,
                    lyingDown: true,
                },
            });

            assert.equal(result.riskLevel, "critical");
            assert.ok(result.riskScore >= 70);
            assert.ok(result.alerts.some((alert) => alert.type === "FEVER"));
        },
    },
];

for (const test of tests) {
    test.run();
    console.log(`PASS ${test.name}`);
}

console.log(`${tests.length} tests passed`);
