/**
 * @file Business logic for sensor readings and realtime alerts.
 */
import AppError from "../../utils/AppError.js";
import { BATTERY_WARNING_THRESHOLD, FEVER_TEMPERATURE_THRESHOLD } from "../../config/constants.js";
import { ensureValidObjectId } from "../../utils/validateObjectId.js";

/**
 * Validates animal ownership, stores sensor data, and fetches readings.
 */
class SensorService {
    #sensorRepository;
    #animalRepository;
    #alertRepository;

    /**
     * @param {Object} sensorRepository - SensorRepository instance.
     * @param {Object} animalRepository - AnimalRepository instance.
     * @param {Object} [alertRepository] - AlertRepository instance.
     */
    constructor(sensorRepository, animalRepository, alertRepository = null) {
        this.#sensorRepository = sensorRepository;
        this.#animalRepository = animalRepository;
        this.#alertRepository = alertRepository;
    }

    /**
     * Makes sure sensor readings are tied to a real animal document.
     *
     * @param {string} animalId - Animal ObjectId.
     * @returns {Promise<Object>} Matching animal.
     * @throws {AppError} When the id is invalid or missing.
     */
    async #ensureAnimalExists(animalId) {
        ensureValidObjectId(animalId, "animal ID");

        const animal = await this.#animalRepository.findById(animalId);

        if (!animal) {
            throw new AppError(`Animal with ID ${animalId} not found`, 404);
        }

        return animal;
    }

    /**
     * Saves a reading and emits alert events for important conditions.
     *
     * @param {Object} data - Validated sensor payload.
     * @param {import("socket.io").Server} io - Socket.IO server.
     * @returns {Promise<Object>} Saved sensor reading.
     */
    async createSensorData(data, io) {
        const animal = await this.#ensureAnimalExists(data.animalId);

        const sensorData = await this.#sensorRepository.create(data);

        if (!sensorData) {
            throw new AppError("Failed to save sensor data", 500);
        }

        const { temperature, heartRate, respiratoryRate, bloodOxygen } = sensorData.physiology;

        if (animal.baselineReadingsCount < 10) {
            // Baseline Initialization Phase: Accumulate first 10 readings
            const count = animal.baselineReadingsCount + 1;
            const currentAccumulator = animal.baselineAccumulator || { temperature: 0, heartRate: 0, respiratoryRate: 0, bloodOxygen: 0 };
            const newAccumulator = {
                temperature: currentAccumulator.temperature + temperature,
                heartRate: currentAccumulator.heartRate + heartRate,
                respiratoryRate: currentAccumulator.respiratoryRate + respiratoryRate,
                bloodOxygen: currentAccumulator.bloodOxygen + bloodOxygen
            };

            let newBaselines = animal.baselines || { temperature: 0, heartRate: 0, respiratoryRate: 0, bloodOxygen: 0 };
            if (count === 10) {
                newBaselines = {
                    temperature: Math.round((newAccumulator.temperature / 10) * 10) / 10,
                    heartRate: Math.round(newAccumulator.heartRate / 10),
                    respiratoryRate: Math.round(newAccumulator.respiratoryRate / 10),
                    bloodOxygen: Math.round(newAccumulator.bloodOxygen / 10)
                };
            }

            await this.#animalRepository.update(animal._id, {
                baselineReadingsCount: count,
                baselineAccumulator: newAccumulator,
                baselines: newBaselines
            });
            // Section 3 Compliance: Adaptive Moving Baseline Engine B(t) = alpha * X(t) + (1 - alpha) * B(t-1)
            const alpha = 0.05; // Adaptive learning rate (0 < alpha < 1)
            const updatedBaselines = {
                temperature: Math.round((alpha * temperature + (1 - alpha) * tempBaseline) * 10) / 10,
                heartRate: Math.round(alpha * heartRate + (1 - alpha) * hrBaseline),
                respiratoryRate: Math.round(alpha * respiratoryRate + (1 - alpha) * rrBaseline),
                bloodOxygen: Math.round(alpha * bloodOxygen + (1 - alpha) * boBaseline)
            };

            // Update digital twin baseline state in MongoDB
            await this.#animalRepository.update(animal._id, { baselines: updatedBaselines });

            let hasAnomaly = false;
            let anomalyDetails = [];

            if (tempDev > 1.0) {
                hasAnomaly = true;
                anomalyDetails.push(`Temperature deviated by ${tempDev.toFixed(1)}°C (current: ${temperature}°C, baseline: ${tempBaseline}°C)`);
            }
            if (hrDev > 20) {
                hasAnomaly = true;
                anomalyDetails.push(`Heart Rate deviated by ${hrDev} BPM (current: ${heartRate} BPM, baseline: ${hrBaseline} BPM)`);
            }
            if (rrDev > 5) {
                hasAnomaly = true;
                anomalyDetails.push(`Respiratory Rate deviated by ${rrDev} (current: ${respiratoryRate}, baseline: ${rrBaseline})`);
            }
            if (boDev > 5) {
                hasAnomaly = true;
                anomalyDetails.push(`Blood Oxygen deviated by ${boDev}% (current: ${bloodOxygen}%, baseline: ${boBaseline}%)`);
            }

            if (hasAnomaly) {
                // Emit Socket.IO alert, do NOT update baseline
                const alertMessage = `Deviation detected: ${anomalyDetails.join("; ")}`;
                io.emit("alert", {
                    animalId: sensorData.animalId,
                    type: "ANOMALY",
                    message: alertMessage,
                    timestamp: sensorData.timestamp
                });

                if (this.#alertRepository) {
                    await this.#alertRepository.createMany([{
                        animalId: sensorData.animalId,
                        type: "ANOMALY",
                        severity: "critical",
                        message: alertMessage,
                        metric: "physiology",
                        value: temperature,
                        status: "active"
                    }]);
                }
            } else {
                // Happy path: Update baseline using EMA (learning rate alpha = 0.1)
                const alpha = 0.1;
                const newBaselines = {
                    temperature: Math.round((alpha * temperature + (1 - alpha) * tempBaseline) * 10) / 10,
                    heartRate: Math.round(alpha * heartRate + (1 - alpha) * hrBaseline),
                    respiratoryRate: Math.round(alpha * respiratoryRate + (1 - alpha) * rrBaseline),
                    bloodOxygen: Math.round(alpha * bloodOxygen + (1 - alpha) * boBaseline)
                };

                await this.#animalRepository.update(animal._id, { baselines: newBaselines });
            }
        }

        // Hardware Maintenance
        if (sensorData.device?.batteryLevel < BATTERY_WARNING_THRESHOLD) {
            const batteryMessage = `Warning: Low battery level detected! (${sensorData.device.batteryLevel}%)`;
            io.emit("alert", {
                animalId: sensorData.animalId,
                type: "BATTERY",
                message: batteryMessage,
                timestamp: sensorData.timestamp,
            });

            if (this.#alertRepository) {
                await this.#alertRepository.createMany([{
                    animalId: sensorData.animalId,
                    type: "BATTERY",
                    severity: "warning",
                    message: batteryMessage,
                    metric: "batteryLevel",
                    value: sensorData.device.batteryLevel,
                    status: "active"
                }]);
            }
        }

        return sensorData;
    }

    /**
     * @param {string} animalId
     * @returns {Promise<Object>} Latest sensor reading.
     * @throws {AppError} When the animal or reading is not found.
     */
    async getLatest(animalId) {
        await this.#ensureAnimalExists(animalId);

        const data = await this.#sensorRepository.findLatestByAnimal(animalId);

        if (!data) {
            throw new AppError(
                `No sensor data found for animal ID: ${animalId}`,
                404,
            );
        }

        return data;
    }

    /**
     * @param {string} animalId
     * @param {Date} from
     * @param {Date} to
     * @returns {Promise<Object[]>} Sensor readings in the requested range.
     * @throws {AppError} When the animal or readings are not found.
     */
    async getLatestByRange(animalId, from, to) {
        await this.#ensureAnimalExists(animalId);

        const data = await this.#sensorRepository.findByRange(animalId, from, to);

        if (!data || data.length === 0) {
            throw new AppError(
                "No data found for the specified date range",
                404,
            );
        }

        return data;
    }

    async ingestData(animalId, payload) {
        // 1. Save the raw IoT data to MongoDB
        const savedData = await this.#sensorRepository.create({ animalId, ...payload });

        // 2. Fire the event in the background! 
        mavisEvents.emit(EVENTS.SENSOR_DATA_RECEIVED, {
            animalId,
            payload: savedData
        });

        // 3. Return immediately so the controller can respond to the hardware
        return savedData;
    }
}

export default SensorService;
