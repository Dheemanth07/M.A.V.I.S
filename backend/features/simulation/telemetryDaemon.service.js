/**
 * @file Autonomous Continuous Telemetry & Multi-Species Clinical Daemon
 * 
 * Auto-provisions diverse clinical animals across species (Cow, Dog, Cat, Horse)
 * with specific breeds, historical telemetry, and real-time Socket.IO broadcasts.
 */

import AnimalData from "../animals/animal.model.js";
import SensorData from "../sensors/sensor.model.js";
import AlertData from "../alerts/alert.model.js";
import logger from "../../utils/logger.js";

class TelemetryDaemon {
    #io;
    #intervalRef = null;
    #tick = 0;

    constructor(io) {
        this.#io = io;
    }

    /**
     * Initializes dataset and starts background streaming daemon.
     */
    async start() {
        try {
            logger.info("Initializing Autonomous Multi-Species Telemetry Daemon...");
            await this.#seedDatasetIfNeeded();
            this.#startLiveStream();
            logger.info("Autonomous Multi-Species Telemetry Daemon is LIVE and broadcasting.");
        } catch (err) {
            logger.error("Failed to start Telemetry Daemon", err);
        }
    }

    /**
     * Seeds multi-species subjects (Cow, Dog, Cat, Horse) with distinct breeds and active alerts.
     */
    async #seedDatasetIfNeeded() {
        const count = await AnimalData.countDocuments();
        const hasCompound = await AnimalData.findOne({ species: / - / });
        const hasDog = await AnimalData.findOne({ species: 'Dog' });
        const hasHorse = await AnimalData.findOne({ species: 'Horse' });

        // If we don't have multi-species or have old compound strings or old horse entries, seed clean dataset
        if (count < 6 || hasCompound || !hasDog || hasHorse) {
            logger.info("Auto-provisioning multi-species clinical herd (Cow, Dog, Cat)...");
            
            await AnimalData.deleteMany({});
            await SensorData.deleteMany({});
            await AlertData.deleteMany({});

            const defaultSubjects = [
                // 🐄 Cows / Bovine
                {
                    name: "Bessie-01 (Holstein)",
                    species: "Cow",
                    breed: "Holstein Friesian",
                    age: 4,
                    weight: 650,
                    zone: "Barn-Alpha",
                    deviceId: "COLLAR-B01",
                    healthStatus: "healthy",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.5,
                        heartRate: 72,
                        respiratoryRate: 22,
                        bloodOxygen: 98
                    }
                },
                {
                    name: "Luna-02 (Jersey)",
                    species: "Cow",
                    breed: "Jersey",
                    age: 3,
                    weight: 480,
                    zone: "Barn-Alpha",
                    deviceId: "COLLAR-L02",
                    healthStatus: "critical",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.4,
                        heartRate: 74,
                        respiratoryRate: 24,
                        bloodOxygen: 98
                    }
                },
                {
                    name: "Bella-03 (Guernsey)",
                    species: "Cow",
                    breed: "Guernsey",
                    age: 5,
                    weight: 540,
                    zone: "Barn-Alpha",
                    deviceId: "COLLAR-G03",
                    healthStatus: "warning",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.6,
                        heartRate: 70,
                        respiratoryRate: 21,
                        bloodOxygen: 99
                    }
                },
                {
                    name: "Daisy-04 (Ayrshire)",
                    species: "Cow",
                    breed: "Ayrshire",
                    age: 4,
                    weight: 580,
                    zone: "Pasture-North",
                    deviceId: "COLLAR-A04",
                    healthStatus: "warning",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.5,
                        heartRate: 68,
                        respiratoryRate: 20,
                        bloodOxygen: 98
                    }
                },
                // 🐕 Dogs / Canine
                {
                    name: "Max-05 (Labrador)",
                    species: "Dog",
                    breed: "Labrador Retriever",
                    age: 3,
                    weight: 32,
                    zone: "K9-Wing",
                    deviceId: "COLLAR-D05",
                    healthStatus: "healthy",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.6,
                        heartRate: 88,
                        respiratoryRate: 24,
                        bloodOxygen: 99
                    }
                },
                {
                    name: "Buddy-06 (Shepherd)",
                    species: "Dog",
                    breed: "German Shepherd",
                    age: 4,
                    weight: 36,
                    zone: "K9-Wing",
                    deviceId: "COLLAR-D06",
                    healthStatus: "warning",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.8,
                        heartRate: 94,
                        respiratoryRate: 26,
                        bloodOxygen: 97
                    }
                },
                // 🐈 Cats / Feline
                {
                    name: "Oliver-07 (Persian)",
                    species: "Cat",
                    breed: "Persian",
                    age: 2,
                    weight: 4.5,
                    zone: "Feline-Care",
                    deviceId: "COLLAR-C07",
                    healthStatus: "healthy",
                    isActive: true,
                    baselineReadingsCount: 10,
                    baselines: {
                        temperature: 38.4,
                        heartRate: 140,
                        respiratoryRate: 28,
                        bloodOxygen: 99
                    }
                }
            ];

            const createdAnimals = await AnimalData.insertMany(defaultSubjects);
            logger.info(`Provisioned ${createdAnimals.length} multi-species subjects (Cow, Dog, Cat, Horse).`);

            // Seed historical telemetry packets
            const now = Date.now();
            const historicalPackets = [];

            for (const animal of createdAnimals) {
                const isLuna = animal.name.includes("Luna");
                const isBella = animal.name.includes("Bella");
                const isDaisy = animal.name.includes("Daisy");
                const isBuddy = animal.name.includes("Buddy");

                for (let i = 24; i >= 0; i--) {
                    const timestamp = new Date(now - i * 60 * 60 * 1000);
                    const sin = Math.sin(i * 0.4);

                    let temp = (animal.baselines?.temperature || 38.5) + sin * 0.2;
                    let hr = Math.round((animal.baselines?.heartRate || 72) + sin * 4);
                    let rr = Math.round((animal.baselines?.respiratoryRate || 22) + sin * 2);
                    let bo = Math.round(98 - Math.abs(sin * 0.8));
                    let battery = Math.round(95 - i * 0.3);

                    if (isLuna && i <= 5) {
                        temp = 39.8;
                        hr = 104;
                        rr = 48;
                        bo = 88;
                    } else if (isBella && i <= 4) {
                        temp = 40.3;
                        hr = 94;
                        rr = 34;
                    } else if (isDaisy && i <= 3) {
                        battery = 12;
                    } else if (isBuddy && i <= 3) {
                        temp = 39.2;
                        hr = 108;
                    }

                    historicalPackets.push({
                        animalId: animal._id,
                        collarId: animal.deviceId,
                        physiology: {
                            temperature: parseFloat(temp.toFixed(1)),
                            heartRate: hr,
                            respiratoryRate: rr,
                            bloodOxygen: bo
                        },
                        behavior: {
                            motion: true,
                            steps: Math.round(300 + Math.random() * 20),
                            lyingDown: false
                        },
                        device: {
                            batteryLevel: battery,
                            signalStrength: -62
                        },
                        timestamp
                    });
                }
            }

            await SensorData.insertMany(historicalPackets);
            logger.info(`Seeded ${historicalPackets.length} historical sensor packets.`);

            // Seed active clinical alerts
            const luna = createdAnimals.find(a => a.name.includes("Luna"));
            const bella = createdAnimals.find(a => a.name.includes("Bella"));
            const daisy = createdAnimals.find(a => a.name.includes("Daisy"));
            const buddy = createdAnimals.find(a => a.name.includes("Buddy"));

            const alertsToSeed = [];
            if (luna) {
                alertsToSeed.push({
                    animalId: luna._id,
                    type: "ANOMALY",
                    severity: "critical",
                    message: "Acute Tachypnea & Hypoxia: Respiratory rate elevated to 48 BPM and SpO2 depressed to 88%. Clinical auscultation advised.",
                    metric: "physiology",
                    value: 48,
                    status: "active"
                });
            }
            if (bella) {
                alertsToSeed.push({
                    animalId: bella._id,
                    type: "THERMAL",
                    severity: "warning",
                    message: "Core Heat Index Spike: Body temperature elevated to 40.3°C under high barn heat index. Misting and hydration recommended.",
                    metric: "physiology",
                    value: 40.3,
                    status: "active"
                });
            }
            if (daisy) {
                alertsToSeed.push({
                    animalId: daisy._id,
                    type: "BATTERY",
                    severity: "warning",
                    message: "Hardware Maintenance: Collar battery level dropped to 12% (<15% threshold). Schedule recharge.",
                    metric: "batteryLevel",
                    value: 12,
                    status: "active"
                });
            }
            if (buddy) {
                alertsToSeed.push({
                    animalId: buddy._id,
                    type: "ANOMALY",
                    severity: "warning",
                    message: "Elevated Heart Rate: Post-activity sustained tachycardia (108 BPM). Resting period advised.",
                    metric: "heartRate",
                    value: 108,
                    status: "active"
                });
            }

            if (alertsToSeed.length > 0) {
                await AlertData.insertMany(alertsToSeed);
                logger.info(`Seeded ${alertsToSeed.length} multi-species clinical alerts.`);
            }
        }
    }

    /**
     * Starts continuous background streaming loop for all active animals.
     */
    #startLiveStream() {
        if (this.#intervalRef) return;

        this.#intervalRef = setInterval(async () => {
            this.#tick++;
            try {
                const animals = await AnimalData.find({ isActive: true });
                if (!animals || animals.length === 0) return;

                for (const animal of animals) {
                    const isLuna = animal.name.includes("Luna");
                    const isBella = animal.name.includes("Bella");
                    const isDaisy = animal.name.includes("Daisy");
                    const isBuddy = animal.name.includes("Buddy");
                    const sin = Math.sin(this.#tick * 0.3);

                    let baseTemp = animal.baselines?.temperature || 38.5;
                    let baseHr = animal.baselines?.heartRate || 72;
                    let baseRr = animal.baselines?.respiratoryRate || 22;

                    let temp = baseTemp + sin * 0.15;
                    let hr = Math.round(baseHr + sin * 3);
                    let rr = Math.round(baseRr + sin * 2);
                    let bo = 98;
                    let battery = 92;

                    if (isLuna) {
                        temp = 39.8;
                        hr = 104;
                        rr = 48;
                        bo = 88;
                    } else if (isBella) {
                        temp = 40.2;
                        hr = 92;
                        rr = 32;
                    } else if (isDaisy) {
                        battery = 12;
                    } else if (isBuddy) {
                        temp = 39.0;
                        hr = 104;
                    }

                    const payload = {
                        animalId: animal._id,
                        collarId: animal.deviceId || `COLLAR-${animal._id.toString().substring(0, 4).toUpperCase()}`,
                        physiology: {
                            temperature: parseFloat(temp.toFixed(1)),
                            heartRate: hr,
                            respiratoryRate: rr,
                            bloodOxygen: bo
                        },
                        behavior: {
                            motion: true,
                            steps: Math.round(150 + this.#tick * 2),
                            lyingDown: false
                        },
                        device: {
                            batteryLevel: battery,
                            signalStrength: -62
                        },
                        timestamp: new Date().toISOString()
                    };

                    // Broadcast to Socket.IO clients
                    this.#io.emit("sensorUpdate", payload);

                    if (this.#tick % 5 === 0) {
                        await SensorData.create(payload);
                    }
                }
            } catch (err) {}
        }, 3000);
    }
}

export default TelemetryDaemon;
