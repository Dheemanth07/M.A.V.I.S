/**
 * @file Business logic for animal profiles and health summaries.
 */
import AppError from "../utils/AppError.js";

/**
 * Coordinates animal persistence and sensor-backed health checks.
 */
class AnimalService {
    #animalRepository;
    #sensorRepository;

    /**
     * @param {import("../repositories/animal.repository.js").default} animalRepository - Animal data access.
     * @param {import("../repositories/sensor.repository.js").default} sensorRepository - Sensor data access.
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
    async updateAnimal(id, data) {
        const updatedAnimal = await this.#animalRepository.update(id, data);

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
        const animal = await this.#animalRepository.findById(animalId);
        if (!animal) {
            throw new AppError(`Animal with ID ${animalId} not found`, 404);
        }

        const latestSensor = await this.#sensorRepository.findLatestByAnimalId(animalId);

        if (!latestSensor) {
            return {
                animalId: animal._id,
                name: animal.name,
                healthStatus: "unknown",
                message: "No sensor data available"
            };
        }

        let computedHealth = "healthy";
        let activeAlerts = [];

        const { temperature, heartRate } = latestSensor.physiology;
        if (temperature > 40) {
            computedHealth = "critical";
            activeAlerts.push(`Fever detected: Body temperature is ${temperature}°C.`);
        } else if (temperature > 39) {
            computedHealth = "warning";
            activeAlerts.push(`Elevated body temperature detected (${temperature}°C).`);
        }

        const { ambientTemperature, humidity } = latestSensor.environment || {};
        if (ambientTemperature && ambientTemperature > 35) {
            if (heartRate > 100) {
                computedHealth = "critical";
                activeAlerts.push(`DANGER: Potential heat exhaustion. Ambient temp is ${ambientTemperature}°C with elevated heart rate.`);
            } else if (humidity && humidity > 80) {
                // High heat + High humidity is dangerous even if HR is normal
                if (computedHealth !== "critical") computedHealth = "warning";
                activeAlerts.push(`WARNING: High heat index. Ambient temp is ${ambientTemperature}°C with ${humidity}% humidity. Ensure access to water/shade.`);
            }
        }

        if (latestSensor.device && latestSensor.device.batteryLevel < 15) {
            activeAlerts.push(`DEVICE WARNING: Collar battery is critically low (${latestSensor.device.batteryLevel}%).`);
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
            metrics: {
                bodyTemperature: temperature,
                heartRate,
                motion: latestSensor.behavior.motion,
                ambientTemperature: ambientTemperature || "N/A",
                battery: latestSensor.device?.batteryLevel || "N/A"
            }
        };

    };
}

export default AnimalService;
