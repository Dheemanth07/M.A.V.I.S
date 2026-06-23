/**
 * @file REST API schema assertion verifier.
 * Checks that the latest sensor payload matches the expected nested schema.
 */

const BASE_URL = "http://localhost:5000";

async function verifyRest() {
    try {
        console.log("Fetching animals list...");
        const animalsRes = await fetch(`${BASE_URL}/api/animals`);
        if (!animalsRes.ok) {
            throw new Error(`Failed to fetch animals: status ${animalsRes.status}`);
        }

        const animalsData = await animalsRes.json();
        const animals = animalsData.data || animalsData;

        if (!Array.isArray(animals) || animals.length === 0) {
            throw new Error("No animals found in the database. Did seeding run successfully?");
        }

        const firstAnimal = animals[0];
        const animalId = firstAnimal._id;
        console.log(`Found animal: ${firstAnimal.name} | ID: ${animalId}`);

        console.log(`Fetching latest sensor reading for animal ID: ${animalId}...`);
        const sensorRes = await fetch(`${BASE_URL}/api/sensor/latest/${animalId}`);
        if (!sensorRes.ok) {
            throw new Error(`Failed to fetch sensor reading: status ${sensorRes.status}`);
        }

        const apiResponse = await sensorRes.json();
        const sensorReading = apiResponse.data || apiResponse;
        console.log("\n[LATEST SENSOR READING DATA] :");
        console.log(JSON.stringify(apiResponse, null, 2));

        // Schema Map Assertions (Asserting fields are nested and not flattened or dropped)
        console.log("\nStarting Schema Map Assertions...");

        // 1. Check Root Fields
        assertExists(sensorReading, "animalId");
        assertExists(sensorReading, "physiology");
        assertExists(sensorReading, "behavior");
        assertExists(sensorReading, "environment");
        assertExists(sensorReading, "device");

        // 2. Check Physiology Nested Structure
        const phys = sensorReading.physiology;
        assertType(phys, "object", "physiology");
        assertExists(phys, "temperature", "physiology.temperature");
        assertType(phys.temperature, "number", "physiology.temperature");
        assertExists(phys, "heartRate", "physiology.heartRate");
        assertType(phys.heartRate, "number", "physiology.heartRate");
        assertExists(phys, "respiratoryRate", "physiology.respiratoryRate");
        assertType(phys.respiratoryRate, "number", "physiology.respiratoryRate");
        assertExists(phys, "bloodOxygen", "physiology.bloodOxygen");
        assertType(phys.bloodOxygen, "number", "physiology.bloodOxygen");

        // 3. Check Behavior Nested Structure
        const behav = sensorReading.behavior;
        assertType(behav, "object", "behavior");
        assertExists(behav, "motion", "behavior.motion");
        assertType(behav.motion, "boolean", "behavior.motion");

        // 4. Check Environment Nested Structure
        const env = sensorReading.environment;
        assertType(env, "object", "environment");
        assertExists(env, "ambientTemperature", "environment.ambientTemperature");
        assertType(env.ambientTemperature, "number", "environment.ambientTemperature");

        // 5. Check Device Nested Structure
        const dev = sensorReading.device;
        assertType(dev, "object", "device");
        assertExists(dev, "batteryLevel", "device.batteryLevel");
        assertType(dev.batteryLevel, "number", "device.batteryLevel");

        console.log("\n==========================================");
        console.log("SUCCESS: All schema assertions passed perfectly!");
        console.log("No fields were flattened or dropped during insertion.");
        console.log("==========================================");

    } catch (error) {
        console.error("\n[SCHEMA ASSERTION FAILED]:", error.message);
        process.exit(1);
    }
}

function assertExists(obj, key, path = key) {
    if (obj[key] === undefined || obj[key] === null) {
        throw new Error(`Expected field '${path}' to exist, but it was missing or null.`);
    }
    console.log(`  ✓ Field '${path}' exists.`);
}

function assertType(val, expectedType, path) {
    const actualType = typeof val;
    if (actualType !== expectedType) {
        throw new Error(`Expected '${path}' to be of type '${expectedType}', but got '${actualType}'`);
    }
    console.log(`  ✓ Field '${path}' is of type '${expectedType}'.`);
}

verifyRest();
