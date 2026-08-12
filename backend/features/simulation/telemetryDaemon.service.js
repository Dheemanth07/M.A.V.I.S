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
            logger.info("Initializing Autonomous Multi-Species Telemetry Daemon for Demo Account...");
            const { ensureDemoAccountAndHerd } = await import("./userSeed.service.js");
            await ensureDemoAccountAndHerd();
            this.#startLiveStream();
            logger.info("Autonomous Multi-Species Telemetry Daemon is LIVE and broadcasting for Demo Herd.");
        } catch (err) {
            logger.error("Failed to start Telemetry Daemon", err);
        }
    }

    /**
     * Starts continuous background streaming loop ONLY for the demo account's herd.
     * Real registered users' animals will never receive fake simulated telemetry.
     */
    #startLiveStream() {
        if (this.#intervalRef) return;

        this.#intervalRef = setInterval(async () => {
            this.#tick++;
            try {
                const User = (await import("../auth/user.model.js")).default;
                const demoUser = await User.findOne({ email: "dheemanth1007@gmail.com" });
                if (!demoUser) return;

                const animals = await AnimalData.find({ owner: demoUser._id, isActive: true });
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
