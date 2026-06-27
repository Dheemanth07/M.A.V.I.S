/**
 * @file verify_all_routes.js
 * Comprehensive REST API route verifier testing animal CRUD, sensor telemetry ingestion,
 * history queries, health computed summary, and deletion cleanup.
 */

const BASE_URL = "http://localhost:5000";

async function verifyAllRoutes() {
    try {
        console.log("=== STARTING COMPREHENSIVE ROUTE VERIFICATION ===\n");

        // 1. GET / (Health Check)
        console.log("1. Testing Health Check (GET /)...");
        const healthRes = await fetch(`${BASE_URL}/`);
        assertEqual(healthRes.status, 200, "Health status code");
        const healthData = await healthRes.json();
        assertEqual(healthData.status, "success", "Health check status");
        assertEqual(healthData.data.database, "connected", "Database status");
        console.log("   ✓ Health check passed.\n");

        // 2. POST /api/animals (Create Animal)
        console.log("2. Testing Create Animal (POST /api/animals)...");
        const newAnimalPayload = {
            name: "Route Verify Animal",
            species: "Dog",
            breed: "Retriever",
            age: 1,
            weight: 12,
            location: { lat: 13.0, lng: 77.0 }
        };
        const createRes = await fetch(`${BASE_URL}/api/animals`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAnimalPayload)
        });
        assertEqual(createRes.status, 201, "Create animal status");
        const createResult = await createRes.json();
        const animal = createResult.data || createResult;
        const animalId = animal._id;
        if (!animalId) throw new Error("Created animal did not return an _id");
        console.log(`   ✓ Animal created successfully. ID: ${animalId}\n`);

        // 3. GET /api/animals (List Animals)
        console.log("3. Testing List Animals (GET /api/animals)...");
        const listRes = await fetch(`${BASE_URL}/api/animals`);
        assertEqual(listRes.status, 200, "List animals status");
        const listData = await listRes.json();
        const animalsList = listData.data || listData;
        const found = animalsList.some(a => a._id === animalId);
        if (!found) throw new Error(`Created animal ${animalId} was not found in the animals list.`);
        console.log("   ✓ Animal was found in the listed animals.\n");

        // 4. GET /api/animals/:id (Get Single Animal)
        console.log(`4. Testing Get Animal (GET /api/animals/${animalId})...`);
        const getRes = await fetch(`${BASE_URL}/api/animals/${animalId}`);
        assertEqual(getRes.status, 200, "Get animal status");
        const getData = await getRes.json();
        const getAnimal = getData.data || getData;
        assertEqual(getAnimal.name, "Route Verify Animal", "Get animal name match");
        console.log("   ✓ Retrieved animal details successfully.\n");

        // 5. PUT /api/animals/:id (Update Animal)
        console.log(`5. Testing Update Animal (PUT /api/animals/${animalId})...`);
        const updatePayload = {
            weight: 15,
            age: 2
        };
        const updateRes = await fetch(`${BASE_URL}/api/animals/${animalId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload)
        });
        assertEqual(updateRes.status, 200, "Update animal status");
        const updateData = await updateRes.json();
        const updatedAnimal = updateData.data || updateData;
        assertEqual(updatedAnimal.weight, 15, "Updated animal weight");
        assertEqual(updatedAnimal.age, 2, "Updated animal age");
        console.log("   ✓ Animal details updated successfully.\n");

        // 6. GET /api/animals/:id/health (Get Health Status - Initial)
        console.log(`6. Testing Health Status before sensor ingestion (GET /api/animals/${animalId}/health)...`);
        const healthStatusRes = await fetch(`${BASE_URL}/api/animals/${animalId}/health`);
        assertEqual(healthStatusRes.status, 200, "Get health summary status");
        const healthSummary = await healthStatusRes.json();
        const healthSummaryData = healthSummary.data || healthSummary;
        assertEqual(healthSummaryData.status, "unknown", "Initial health summary status");
        console.log("   ✓ Received health status 'unknown' as expected (no sensor data).\n");

        // 7. POST /api/sensor (Ingest Sensor Data)
        console.log("7. Testing Ingest Sensor Data (POST /api/sensor)...");
        const sensorTimestamp = new Date().toISOString();
        const sensorPayload = {
            animalId: animalId,
            physiology: {
                temperature: 38.0,
                heartRate: 85,
                respiratoryRate: 22,
                bloodOxygen: 98
            },
            behavior: {
                motion: true,
                steps: 50,
                lyingDown: false
            },
            environment: {
                ambientTemperature: 28,
                humidity: 55,
                aqi: 45
            },
            location: {
                latitude: 13.0,
                longitude: 77.0,
                zone: "farm_test"
            },
            device: {
                batteryLevel: 90,
                signalStrength: -65
            },
            timestamp: sensorTimestamp
        };
        const sensorPostRes = await fetch(`${BASE_URL}/api/sensor`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sensorPayload)
        });
        assertEqual(sensorPostRes.status, 201, "POST sensor status code");
        console.log("   ✓ Sensor payload posted successfully.\n");

        // 8. GET /api/sensor/latest/:animalId (Get Latest Sensor Reading)
        console.log(`8. Testing Get Latest Sensor (GET /api/sensor/latest/${animalId})...`);
        const latestRes = await fetch(`${BASE_URL}/api/sensor/latest/${animalId}`);
        assertEqual(latestRes.status, 200, "GET latest sensor status code");
        const latestData = await latestRes.json();
        const latestReading = latestData.data || latestData;
        assertEqual(latestReading.physiology.temperature, 38.0, "Latest sensor reading temperature");
        console.log("   ✓ Latest sensor reading fetched and matched.\n");

        // 9. GET /api/sensor/history/:animalId (Get Sensor History)
        const dateFrom = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago
        const dateTo = new Date(Date.now() + 3600000).toISOString();   // 1 hour later
        console.log(`9. Testing Get Sensor History (GET /api/sensor/history/${animalId}?from=${dateFrom}&to=${dateTo})...`);
        const historyRes = await fetch(`${BASE_URL}/api/sensor/history/${animalId}?from=${dateFrom}&to=${dateTo}`);
        assertEqual(historyRes.status, 200, "GET sensor history status code");
        const historyData = await historyRes.json();
        const historyList = historyData.data || historyData;
        if (!Array.isArray(historyList) || historyList.length === 0) {
            throw new Error("Expected sensor history to contain at least 1 reading, but it was empty.");
        }
        console.log(`   ✓ Found ${historyList.length} readings in history range.\n`);

        // 10. GET /api/animals/:id/health (Get Health Status - After Ingestion)
        console.log(`10. Testing Health Status after sensor ingestion (GET /api/animals/${animalId}/health)...`);
        const postHealthStatusRes = await fetch(`${BASE_URL}/api/animals/${animalId}/health`);
        assertEqual(postHealthStatusRes.status, 200, "Get health summary status after upload");
        const postHealthSummary = await postHealthStatusRes.json();
        const postHealthSummaryData = postHealthSummary.data || postHealthSummary;
        assertEqual(postHealthSummaryData.status, "healthy", "Updated health status");
        assertEqual(postHealthSummaryData.currentMetrics.temperature, 38.0, "Health status metrics body temperature");
        console.log("    ✓ Received health status 'healthy' with the matching sensor metrics.\n");

        // 11. DELETE /api/animals/:id (Delete Animal)
        console.log(`11. Testing Delete Animal profile (DELETE /api/animals/${animalId})...`);
        const deleteRes = await fetch(`${BASE_URL}/api/animals/${animalId}`, { method: "DELETE" });
        assertEqual(deleteRes.status, 200, "DELETE animal status code");
        console.log("    ✓ Animal profile deleted successfully.\n");

        // 12. GET /api/animals/:id (Confirm deletion cleanup)
        console.log(`12. Verifying deletion cleanup (GET /api/animals/${animalId} should return 404)...`);
        const cleanGetRes = await fetch(`${BASE_URL}/api/animals/${animalId}`);
        assertEqual(cleanGetRes.status, 404, "GET deleted animal status code");
        console.log("    ✓ Verified 404 Not Found for deleted animal.\n");

        console.log("====================================================");
        console.log("SUCCESS: All MAVIS API routes tested and working perfectly!");
        console.log("====================================================");

    } catch (error) {
        console.error("\n[ROUTE VERIFICATION FAILED]:", error.message);
        process.exit(1);
    }
}

function assertEqual(actual, expected, label) {
    if (actual !== expected) {
        throw new Error(`[Assertion Failure] ${label}: Expected '${expected}', but got '${actual}'`);
    }
    console.log(`   ✓ Assert OK: ${label} is '${expected}'`);
}

verifyAllRoutes();
