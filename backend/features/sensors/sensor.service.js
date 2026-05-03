/**
 * @file Business logic for sensor readings and realtime alerts.
 */
import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";

/**
 * Validates animal ownership, stores sensor data, and fetches readings.
 */
class SensorService {
    #sensorRepository;
    #animalRepository;

    /**
     * @param {Object} sensorRepository - SensorRepository instance.
     * @param {Object} animalRepository - AnimalRepository instance.
     */
    constructor(sensorRepository, animalRepository) {
        this.#sensorRepository = sensorRepository;
        this.#animalRepository = animalRepository;
    }

    /**
     * Makes sure sensor readings are tied to a real animal document.
     *
     * @param {string} animalId - Animal ObjectId.
     * @returns {Promise<Object>} Matching animal.
     * @throws {AppError} When the id is invalid or missing.
     */
    async #ensureAnimalExists(animalId) {
        if (!mongoose.isValidObjectId(animalId)) {
            throw new AppError(`Invalid animal ID: ${animalId}`, 400);
        }

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
        await this.#ensureAnimalExists(data.animalId);

        const sensorData = await this.#sensorRepository.create(data);

        if (!sensorData) {
            throw new AppError("Failed to save sensor data", 500);
        }

        // Fever Detection
        if (sensorData.physiology.temperature > 45) {
            io.emit("alert", {
                animalId: sensorData.animalId,
                type: "FEVER",
                message: "Critical: High temperature detected!",
                timestamp: sensorData.timestamp,
            });
        }

        // Hardware Maintenance
        if (sensorData.device?.batteryLevel < 20) {
            io.emit("alert", {
                animalId: sensorData.animalId,
                type: "BATTERY",
                message: "Warning: Low battery level detected!",
                timestamp: sensorData.timestamp,
            });
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
}

export default SensorService;
