const API_URL = process.env.API_URL || "http://localhost:5000";

const demoAnimals = [
    { name: "Mavis Cow 01", species: "Cattle", breed: "Gir", age: 4, weight: 360 },
    { name: "Mavis Goat 02", species: "Goat", breed: "Jamunapari", age: 2, weight: 42 },
    { name: "Mavis Dog 03", species: "Dog", breed: "Indian Pariah", age: 5, weight: 21 },
    { name: "Mavis Dog 04", species: "Dog", breed: "Golden Retriever", age: 3, weight: 28 },
];

const randomBetween = (min, max) => Number((Math.random() * (max - min) + min).toFixed(1));
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${body}`);
    }

    return response.json();
};

const ensureAnimals = async () => {
    const existing = await request("/api/animals");

    if (existing.length > 0) {
        return existing;
    }

    const created = [];
    for (const animal of demoAnimals) {
        created.push(await request("/api/animals", {
            method: "POST",
            body: JSON.stringify(animal),
        }));
    }

    return created;
};

const buildReading = (animalId, index) => {
    const stressEvent = index % 7 === 0;

    return {
        animalId,
        physiology: {
            temperature: stressEvent ? randomBetween(40, 41.8) : randomBetween(37.2, 39.2),
            heartRate: stressEvent ? randomInt(142, 165) : randomInt(62, 112),
            respiratoryRate: stressEvent ? randomInt(45, 56) : randomInt(14, 34),
            bloodOxygen: stressEvent ? randomInt(82, 89) : randomInt(93, 99),
        },
        behavior: {
            motion: !stressEvent,
            steps: stressEvent ? randomInt(0, 8) : randomInt(18, 120),
            lyingDown: stressEvent,
        },
        environment: {
            ambientTemperature: stressEvent ? randomBetween(38, 41) : randomBetween(24, 33),
            humidity: randomInt(42, 78),
            aqi: randomInt(35, 110),
        },
        location: {
            latitude: randomBetween(12.9, 13.1),
            longitude: randomBetween(77.5, 77.7),
            zone: stressEvent ? "isolation-watch" : "main-shed",
        },
        device: {
            batteryLevel: stressEvent ? randomInt(12, 35) : randomInt(45, 100),
            signalStrength: randomInt(65, 99),
        },
        timestamp: new Date().toISOString(),
    };
};

const main = async () => {
    const animals = await ensureAnimals();
    console.log(`MAVIS simulator connected to ${API_URL}`);
    console.log(`Streaming readings for ${animals.length} animals. Press Ctrl+C to stop.`);

    let index = 1;
    setInterval(async () => {
        try {
            const animal = animals[index % animals.length];
            const reading = await request("/api/sensor", {
                method: "POST",
                body: JSON.stringify(buildReading(animal._id, index)),
            });
            console.log(
                `${new Date().toLocaleTimeString()} ${animal.name}: ${reading.analytics.riskLevel} ${reading.analytics.riskScore}`,
            );
            index += 1;
        } catch (error) {
            console.error(error.message);
        }
    }, 3000);
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
