import AppError from "../utils/AppError.js";

class AnimalService {
    #animalRepository;
    #sensorRepository;

    constructor(animalRepository, sensorRepository) {
        this.#animalRepository = animalRepository;
        this.#sensorRepository = sensorRepository;
    }

    async createAnimal(data) {
        return await this.#animalRepository.create(data);
    }

    async getAnimals() {
        return await this.#animalRepository.findAll();
    }

    async getAnimal(id) {
        const animal = await this.#animalRepository.findById(id);

        if (!animal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return animal;
    }

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
        const sanitizedData = this.#sanitizeUpdateData(data);
        const updatedAnimal = await this.#animalRepository.update(id, sanitizedData);

        if (!updatedAnimal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return updatedAnimal;
    }

    async deleteAnimal(id) {
        const deletedAnimal = await this.#animalRepository.delete(id);

        if (!deletedAnimal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return deletedAnimal;

    }

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
        let alerts = [];

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