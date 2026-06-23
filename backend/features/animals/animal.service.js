/**
 * @file Business logic for animal profiles and health summaries.
 */
import AppError from "../../utils/AppError.js";
import { ensureValidObjectId } from "../../utils/validateObjectId.js";
import {
    BATTERY_WARNING_THRESHOLD,
    FEVER_TEMPERATURE_THRESHOLD,
    FEVER_WARNING_TEMPERATURE_THRESHOLD,
} from "../../config/constants.js";

/**
 * Coordinates animal persistence and sensor-backed health checks.
 */
class AnimalService {
    #animalRepository;
    #sensorRepository;

    /**
     * @param {import("./animal.repository.js").default} animalRepository - Animal data access.
     * @param {import("../sensors/sensor.repository.js").default} sensorRepository - Sensor data access.
     */
    constructor(animalRepository, sensorRepository) {
        this.#animalRepository = animalRepository;
        this.#sensorRepository = sensorRepository;
    }

    /**
     * @param {Object} data - Animal profile payload.
     * @returns {Promise<Object>} Created animal.
     */
    async createAnimal(data) {
        return await this.#animalRepository.create(data);
    }

    /**
     * @returns {Promise<Object[]>} All animals.
     */
    async getAnimals() {
        return await this.#animalRepository.findAll();
    }

    /**
     * @param {string} id - Animal ObjectId.
     * @returns {Promise<Object>} Matching animal.
     * @throws {AppError} When the animal is not found.
     */
    async getAnimal(id) {
        ensureValidObjectId(id, "animal ID");

        const animal = await this.#animalRepository.findById(id);

        if (!animal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return animal;
    }

    /**
     * @param {string} id - Animal ObjectId.
     * @param {Object} data - Fields to update.
     * @returns {Promise<Object>} Updated animal.
     * @throws {AppError} When the animal is not found.
     */
    #sanitizeUpdateData(data) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new AppError("Invalid update payload", 400);
        }

        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith("$") || key.includes(".")) {
                continue;
            }
            sanitized[key] = value;
        }

        return sanitized;
    }

    async updateAnimal(id, data) {
        ensureValidObjectId(id, "animal ID");

        const sanitizedData = this.#sanitizeUpdateData(data);
        const updatedAnimal = await this.#animalRepository.update(id, sanitizedData);

        if (!updatedAnimal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return updatedAnimal;
    }

    /**
     * @param {string} id - Animal ObjectId.
     * @returns {Promise<Object>} Deleted animal.
     * @throws {AppError} When the animal is not found.
     */
    async deleteAnimal(id) {
        ensureValidObjectId(id, "animal ID");

        const deletedAnimal = await this.#animalRepository.delete(id);

        if (!deletedAnimal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return deletedAnimal;

    }

    /**
     * Builds a simple health summary from the latest sensor reading.
     *
     * @param {string} animalId - Animal ObjectId.
     * @returns {Promise<Object>} Current health status, alerts, and key metrics.
     * @throws {AppError} When the animal is not found.
     */
    async getHealthStatus(animalId) {
        ensureValidObjectId(animalId, "animal ID");

        const animal = await this.#animalRepository.findById(animalId);
        if (!animal) {
            throw new AppError(`Animal with ID ${animalId} not found`, 404);
        }

        const latestSensor = await this.#sensorRepository.findLatestByAnimal(animalId);

        if (!latestSensor) {
            return {
                animalId: animal._id,
                name: animal.name,
                status: "unknown",
                alerts: [],
                message: "No sensor data available",
            };
        }

        let computedHealth = "healthy";
        let activeAlerts = [];

        const { temperature, heartRate } = latestSensor.physiology;
        const { ambientTemperature, humidity } = latestSensor.environment || {};

        if (animal.baselineReadingsCount < 10) {
            computedHealth = "healthy";
            activeAlerts.push(`Baseline initializing (${animal.baselineReadingsCount}/10 readings received).`);
        } else {
            const tempBaseline = animal.baselines.temperature;
            const hrBaseline = animal.baselines.heartRate;
            const rrBaseline = animal.baselines.respiratoryRate;
            const boBaseline = animal.baselines.bloodOxygen;

            const tempDev = Math.abs(temperature - tempBaseline);
            const hrDev = Math.abs(heartRate - hrBaseline);
            const rrDev = Math.abs(latestSensor.physiology.respiratoryRate - rrBaseline);
            const boDev = Math.abs(latestSensor.physiology.bloodOxygen - boBaseline);

            // Classification
            if (tempDev > 1.0 || hrDev > 20 || rrDev > 5 || boDev > 5) {
                computedHealth = "critical";
                if (tempDev > 1.0) activeAlerts.push(`CRITICAL: Temperature deviated by ${tempDev.toFixed(1)}°C (current: ${temperature}°C, baseline: ${tempBaseline}°C)`);
                if (hrDev > 20) activeAlerts.push(`CRITICAL: Heart Rate deviated by ${hrDev} BPM (current: ${heartRate} BPM, baseline: ${hrBaseline} BPM)`);
                if (rrDev > 5) activeAlerts.push(`CRITICAL: Respiratory Rate deviated by ${rrDev} (current: ${latestSensor.physiology.respiratoryRate}, baseline: ${rrBaseline})`);
                if (boDev > 5) activeAlerts.push(`CRITICAL: Blood Oxygen deviated by ${boDev}% (current: ${latestSensor.physiology.bloodOxygen}%, baseline: ${boBaseline}%)`);
            } else if (tempDev > 0.5 || hrDev > 10) {
                computedHealth = "warning";
                if (tempDev > 0.5) activeAlerts.push(`WARNING: Temperature elevated by ${tempDev.toFixed(1)}°C from baseline.`);
                if (hrDev > 10) activeAlerts.push(`WARNING: Heart Rate elevated by ${hrDev} BPM from baseline.`);
            }

            // Environmental warning correlations
            if (ambientTemperature && ambientTemperature > 35) {
                if (heartRate > (hrBaseline + 15)) {
                    computedHealth = "critical";
                    activeAlerts.push(`DANGER: Potential heat exhaustion. Ambient temperature is ${ambientTemperature}°C with elevated heart rate.`);
                } else if (humidity && humidity > 80) {
                    if (computedHealth !== "critical") computedHealth = "warning";
                    activeAlerts.push(`WARNING: High heat index. Ambient temp is ${ambientTemperature}°C with ${humidity}% humidity.`);
                }
            }
        }

        if (latestSensor.device && latestSensor.device.batteryLevel < BATTERY_WARNING_THRESHOLD) {
            activeAlerts.push(`DEVICE WARNING: Collar battery is low (${latestSensor.device.batteryLevel}%).`);
        }

        if (animal.healthStatus !== computedHealth) {
            await this.#animalRepository.update(animalId, { healthStatus: computedHealth });
        }

        return {
            animalId: animal._id,
            name: animal.name,
            status: computedHealth,
            alerts: activeAlerts,
            lastReading: latestSensor.timestamp,
            baselineReadingsCount: animal.baselineReadingsCount,
            baselines: animal.baselines,
            currentMetrics: {
                temperature,
                heartRate,
                respiratoryRate: latestSensor.physiology.respiratoryRate,
                bloodOxygen: latestSensor.physiology.bloodOxygen,
                motion: latestSensor.behavior.motion,
                ambientTemperature: ambientTemperature || "N/A",
                battery: latestSensor.device?.batteryLevel || "N/A"
            },
            deviations: animal.baselineReadingsCount >= 10 ? {
                temperature: Math.round(Math.abs(temperature - animal.baselines.temperature) * 10) / 10,
                heartRate: Math.abs(heartRate - animal.baselines.heartRate),
                respiratoryRate: Math.abs(latestSensor.physiology.respiratoryRate - animal.baselines.respiratoryRate),
                bloodOxygen: Math.abs(latestSensor.physiology.bloodOxygen - animal.baselines.bloodOxygen)
            } : {
                temperature: 0,
                heartRate: 0,
                respiratoryRate: 0,
                bloodOxygen: 0
            }
        };
    }
}

export default AnimalService;
