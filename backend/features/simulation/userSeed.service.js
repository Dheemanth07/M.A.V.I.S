/**
 * @file Demo Account & Starter Herd Provisioning Service
 * Simulation data is strictly reserved for the demo account (dheemanth1007@gmail.com).
 * All other newly registered users start with a clean, empty account.
 */

import crypto from "crypto";
import AnimalData from "../animals/animal.model.js";
import SensorData from "../sensors/sensor.model.js";
import AlertData from "../alerts/alert.model.js";
import User from "../auth/user.model.js";
import logger from "../../utils/logger.js";

const DEMO_EMAIL = "dheemanth1007@gmail.com";
const DEMO_PASSWORD_RAW = "dheemanth@123";

function hashPassword(password) {
    return crypto.pbkdf2Sync(password, "mavis_salt_2026", 1000, 64, "sha512").toString("hex");
}

/**
 * Ensures the primary demo account (dheemanth1007@gmail.com / dheemanth@123)
 * exists with its 8 multi-species demo subjects, historical trends, and active alerts.
 */
export async function ensureDemoAccountAndHerd() {
    try {
        let demoUser = await User.findOne({ email: DEMO_EMAIL });
        if (!demoUser) {
            demoUser = await User.create({
                name: "Dheemanth",
                email: DEMO_EMAIL,
                password: hashPassword(DEMO_PASSWORD_RAW),
                role: "admin",
                vetContact: "+1 (555) 019-2834",
                alertSettings: { soundAlerts: true, tempSensitivity: 1.0, hrThreshold: 100 },
                collarSettings: { syncInterval: 5, motionSensitivity: "standard" }
            });
            logger.info(`Initialized primary demo user account: ${DEMO_EMAIL}`);
        }

        // Clean up any fake starter animals that were mistakenly created for non-demo users
        const nonDemoUsers = await User.find({ email: { $ne: DEMO_EMAIL } });
        const nonDemoUserIds = nonDemoUsers.map(u => u._id);
        if (nonDemoUserIds.length > 0) {
            const fakeAnimals = await AnimalData.find({
                owner: { $in: nonDemoUserIds },
                name: { $in: [
                    "Bessie-01 (Holstein)",
                    "Luna-02 (Jersey)",
                    "Bella-03 (Guernsey)",
                    "Daisy-04 (Ayrshire)",
                    "Max-05 (Labrador)",
                    "Buddy-06 (Shepherd)",
                    "Oliver-07 (Persian)",
                    "Rocky-08 (Golden)"
                ]}
            });

            if (fakeAnimals.length > 0) {
                const fakeIds = fakeAnimals.map(a => a._id);
                await SensorData.deleteMany({ animalId: { $in: fakeIds } });
                await AlertData.deleteMany({ animalId: { $in: fakeIds } });
                await AnimalData.deleteMany({ _id: { $in: fakeIds } });
                logger.info(`Cleaned up ${fakeAnimals.length} auto-seeded animals from non-demo accounts to ensure clean empty state.`);
            }
        }

        // Seed demo herd for dheemanth1007@gmail.com if missing
        await seedUserHerdIfNeeded(demoUser._id);
    } catch (err) {
        logger.error("Error ensuring demo account and herd:", err);
    }
}

/**
 * Seeds an isolated dataset ONLY if the user is the primary demo user (dheemanth1007@gmail.com).
 * For all other accounts, this returns empty without seeding anything.
 * 
 * @param {string|import("mongoose").Types.ObjectId} userId - User ObjectId.
 * @returns {Promise<Array>} List of user animals.
 */
export async function seedUserHerdIfNeeded(userId) {
    if (!userId || userId === 'guest') return [];

    try {
        const user = await User.findById(userId);
        if (!user || user.email.toLowerCase() !== DEMO_EMAIL) {
            // All non-demo users start with an empty account!
            return [];
        }

        const existingCount = await AnimalData.countDocuments({ owner: userId });
        if (existingCount >= 8) {
            return await AnimalData.find({ owner: userId }).sort({ createdAt: 1, _id: 1 });
        }

        logger.info(`Provisioning 8-subject simulation herd for demo account (${DEMO_EMAIL})...`);

        // If partial demo data existed, clean it up for a pristine 8-subject set
        const existingDemoAnimals = await AnimalData.find({ owner: userId });
        if (existingDemoAnimals.length > 0) {
            const ids = existingDemoAnimals.map(a => a._id);
            await SensorData.deleteMany({ animalId: { $in: ids } });
            await AlertData.deleteMany({ animalId: { $in: ids } });
            await AnimalData.deleteMany({ owner: userId });
        }

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
                owner: userId,
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
                owner: userId,
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
                owner: userId,
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
                owner: userId,
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
                owner: userId,
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
                owner: userId,
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
                owner: userId,
                isActive: true,
                baselineReadingsCount: 10,
                baselines: {
                    temperature: 38.4,
                    heartRate: 140,
                    respiratoryRate: 28,
                    bloodOxygen: 99
                }
            },
            // 🐕 Added Dog
            {
                name: "Rocky-08 (Golden)",
                species: "Dog",
                breed: "Golden Retriever",
                age: 2,
                weight: 29,
                zone: "K9-Wing",
                deviceId: "COLLAR-D08",
                healthStatus: "healthy",
                owner: userId,
                isActive: true,
                baselineReadingsCount: 10,
                baselines: {
                    temperature: 38.5,
                    heartRate: 82,
                    respiratoryRate: 22,
                    bloodOxygen: 99
                }
            }
        ];

        const createdAnimals = await AnimalData.insertMany(defaultSubjects);

        // Seed 24 hours of historical telemetry packets for demo herd
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

        if (historicalPackets.length > 0) {
            await SensorData.insertMany(historicalPackets);
        }

        // Seed initial clinical alerts for demo herd
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
        }

        logger.info(`Successfully provisioned demo herd for ${DEMO_EMAIL}.`);
        return createdAnimals;
    } catch (err) {
        logger.error(`Error provisioning starter herd for demo user:`, err);
        return [];
    }
}
