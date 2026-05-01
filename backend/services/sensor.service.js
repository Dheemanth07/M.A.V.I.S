/**
 * SensorService
 * Handles business logic, health monitoring, and real-time alerts.
 */
import AppError from "../utils/AppError.js";

class SensorService {
    #sensorRepository;

    /**
     * @param {Object} sensorRepository - SensorRepository instance.
     */
    constructor(sensorRepository) {
        this.#sensorRepository = sensorRepository;
    }

    /**
     * Processes readings and broadcasts alerts for physiological anomalies.
     * @param {Object} data - Validated sensor data.
     * @param {Object} io - Socket.IO instance.
     * @returns {Promise<Object>}
     */
    async createSensorData(data, io) {
        const sensorData = await this.#sensorRepository.create(data);

        if (!sensorData) {
            throw new Error("Failed to save sensor data", 500);
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
        if (sensorData.device.batteryLevel < 20) {
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
     * @returns {Promise<Object|null>}
     */
    async getLatest(animalId) {
        console.log("animalId received:", animalId);
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
     * @returns {Promise<Array>}
     */
    async getLatestByRange(animalId, from, to) {
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
