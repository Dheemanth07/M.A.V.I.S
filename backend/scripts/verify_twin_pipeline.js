/**
 * @file verify_twin_pipeline.js
 * Programmatic pipeline test for MAVIS Personalised Digital Twin & Anomaly Detection.
 */

import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5000";
let socket;
let animalId;
let receivedAnomalyAlert = false;

async function runTwinPipelineVerification() {
    try {
        console.log("=== STARTING DIGITAL TWIN & ANOMALY PIPELINE VERIFICATION ===\n");

        // 1. Connect to Socket.IO to listen for anomaly alerts
        socket = io(BASE_URL, { transports: ["websocket"] });
        socket.on("connect", () => {
            console.log("✓ Connected to Socket.IO server.");
        });
        socket.on("alert", (data) => {
            if (data.type === "ANOMALY") {
                console.log("\n[SOCKET ALERT CAPTURED]:", JSON.stringify(data, null, 2));
                receivedAnomalyAlert = true;
            }
        });

        // 2. Create a temporary animal
        console.log("\n2. Creating temporary test animal...");
        const animalRes = await fetch(`${BASE_URL}/api/animals`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Twin Test Cow",
                species: "Cow",
                breed: "Holstein",
                age: 4,
                weight: 550
            })
        });
        const animalResult = await animalRes.json();
        animalId = (animalResult.data || animalResult)._id;
        console.log(`✓ Temporary animal created. ID: ${animalId}`);

        // 3. Post 10 normal readings to initialize the baseline
        console.log("\n3. Posting 10 baseline readings (initializing baseline as average of first 10)...");
        // Values: Temp=38.0, HR=80, RR=20, BO=98
        // Let's vary them slightly to see the averaging:
        // Temperatures: 38.0, 38.2, 38.0, 37.8, 38.1, 38.3, 38.0, 37.9, 38.1, 38.1
        // Average: 38.05
        const temps = [38.0, 38.2, 38.0, 37.8, 38.1, 38.3, 38.0, 37.9, 38.1, 38.1];
        
        for (let i = 0; i < 10; i++) {
            const tempVal = temps[i];
            const payload = {
                animalId: animalId,
                physiology: {
                    temperature: tempVal,
                    heartRate: 80,
                    respiratoryRate: 20,
                    bloodOxygen: 98
                },
                behavior: { motion: true },
                device: { batteryLevel: 95 }
            };

            const sensorRes = await fetch(`${BASE_URL}/api/sensor`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!sensorRes.ok) {
                throw new Error(`Failed to post sensor reading ${i+1}`);
            }

            // Check initialization status intermittently
            const healthRes = await fetch(`${BASE_URL}/api/animals/${animalId}/health`);
            const healthSum = await healthRes.json();
            const health = healthSum.data || healthSum;
            console.log(`   Reading ${i+1}/10 posted. Current baseline count: ${health.baselineReadingsCount}`);
        }

        // Verify baseline initialized
        const initHealthRes = await fetch(`${BASE_URL}/api/animals/${animalId}/health`);
        const initHealthData = await initHealthRes.json();
        const initHealth = initHealthData.data || initHealthData;
        
        assertEqual(initHealth.baselineReadingsCount, 10, "Baseline count after 10 readings");
        assertEqual(initHealth.baselines.temperature, 38.1, "Initialized baseline temperature (38.05 rounded)");
        assertEqual(initHealth.baselines.heartRate, 80, "Initialized baseline heart rate");
        console.log("✓ Baseline successfully initialized!");

        // 4. Post 11th normal reading to check EMA update
        console.log("\n4. Posting 11th normal reading to verify EMA baseline shift...");
        // Temp = 39.0.
        // Old baseline = 38.1.
        // Expected EMA baseline = 0.1 * 39.0 + 0.9 * 38.1 = 3.9 + 34.29 = 38.19 = 38.2
        const normalPayload = {
            animalId: animalId,
            physiology: {
                temperature: 39.0, // Deviation is 0.9 (<= 1.0 threshold), so normal
                heartRate: 80,
                respiratoryRate: 20,
                bloodOxygen: 98
            },
            behavior: { motion: true }
        };

        const postNormalRes = await fetch(`${BASE_URL}/api/sensor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(normalPayload)
        });
        if (!postNormalRes.ok) throw new Error("Failed to post normal 11th reading");

        const postNormalHealthRes = await fetch(`${BASE_URL}/api/animals/${animalId}/health`);
        const postNormalHealthData = await postNormalHealthRes.json();
        const postNormalHealth = postNormalHealthData.data || postNormalHealthData;

        assertEqual(postNormalHealth.baselines.temperature, 38.2, "EMA updated baseline temperature");
        console.log("✓ EMA baseline updated correctly!");

        // 5. Post 12th anomalous reading (temperature spike)
        console.log("\n5. Posting 12th anomalous reading (temperature spike of 40.5°C)...");
        // Temp = 40.5. Old baseline = 38.2.
        // Deviation = 2.3 > 1.0 threshold. Should trigger alert and suspend baseline updates.
        const anomalousPayload = {
            animalId: animalId,
            physiology: {
                temperature: 40.5,
                heartRate: 80,
                respiratoryRate: 20,
                bloodOxygen: 98
            },
            behavior: { motion: false }
        };

        const postAnomalousRes = await fetch(`${BASE_URL}/api/sensor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(anomalousPayload)
        });
        if (!postAnomalousRes.ok) throw new Error("Failed to post anomalous reading");

        // Wait a short moment for Socket.IO event processing
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const postAnomalyHealthRes = await fetch(`${BASE_URL}/api/animals/${animalId}/health`);
        const postAnomalyHealthData = await postAnomalyHealthRes.json();
        const postAnomalyHealth = postAnomalyHealthData.data || postAnomalyHealthData;

        assertEqual(postAnomalyHealth.status, "critical", "Computed health summary status on deviation");
        assertEqual(postAnomalyHealth.baselines.temperature, 38.2, "Baseline temperature (should remain unchanged)");
        assertEqual(postAnomalyHealth.deviations.temperature, 2.3, "Calculated temperature deviation score");
        assertEqual(receivedAnomalyAlert, true, "Captured Socket.IO ANOMALY alert status");

        console.log("✓ Anomaly logic verified! Alerts triggered and baseline update suspended as expected.");

        // 6. Delete the temporary animal profile
        console.log("\n6. Deleting temporary animal profile...");
        const delRes = await fetch(`${BASE_URL}/api/animals/${animalId}`, { method: "DELETE" });
        if (delRes.ok) {
            console.log("✓ Temporary animal profile deleted.");
        }

        console.log("\n========================================================");
        console.log("SUCCESS: MAVIS Personalised Digital Twin pipeline verified!");
        console.log("========================================================");
        cleanup(0);

    } catch (error) {
        console.error("\n[PIPELINE VERIFICATION FAILED]:", error.message);
        if (animalId) {
            console.log("Attempting deletion cleanup...");
            await fetch(`${BASE_URL}/api/animals/${animalId}`, { method: "DELETE" });
        }
        cleanup(1);
    }
}

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`[Assertion Failure] ${label}: Expected '${expected}', but got '${actual}'`);
    }
    console.log(`   ✓ Assert OK: ${label} is '${expected}'`);
}

function cleanup(exitCode) {
    if (socket) {
        socket.disconnect();
    }
    process.exit(exitCode);
}

runTwinPipelineVerification();
