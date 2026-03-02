/**
 * SensorService
 * * Pattern: Service Layer
 * Purpose: This class encapsulates the "Core Intelligence" of Mavis.
 * It handles business rules (like fever alerts) and coordinates between the
 * Repository (Database) and Socket.IO (Real-time events).
 * * Pattern: Dependency Injection
 * Purpose: Receives a repository instance via the constructor, making the service
 * easy to test without needing a live database.
 */
class SensorService {
    // Private field to protect the repository instance from external access
    #repository;

    /**
     * @param {Object} repository - An instance of SensorRepository (Singleton).
     */
    constructor(repository) {
        this.#repository = repository;
    }

    /**
     * Processes new sensor readings and triggers real-time alerts if anomalies are found.
     * * @param {Object} data - The validated sensor data from the controller.
     * @param {Object} io - The Socket.IO instance for broadcasting alerts.
     * @returns {Promise<Object>} The saved sensor document.
     */
    async createSensorData(data, io) {
        const repository = this.#repository;

        // Persist the data via the repository
        // Note: Ensure repository has a .create() or .save() method matching this call
        const sensorData = await repository.create(data);

        /**
         * Business Logic: Health Monitoring
         * ---------------------------------
         * Rule 1: Fever Detection
         * Trigger an alert if the animal's temperature exceeds the safety threshold.
         */
        if (sensorData.physiology.temperature > 45) {
            io.emit("alert", {
                animalId: sensorData.animalId,
                type: "FEVER",
                message: "Critical: High temperature detected!",
                timestamp: sensorData.timestamp,
            });
        }

        /**
         * Rule 2: Hardware Maintenance
         * Trigger an alert if the wearable device's battery drops below 20%.
         */
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
     * Fetches the most recent status of an animal.
     * * @param {string} animalId - The ID of the animal to query.
     * @returns {Promise<Object|null>} The latest sensor reading.
     */
    async getLatest(animalId) {
        const repository = this.#repository;
        return await repository.findLatestByAnimal(animalId);
    }

    /**
     * Retrieves historical data for trend analysis or graphing.
     * * @param {string} animalId - The ID of the animal.
     * @param {Date} from - Start date of the range.
     * @param {Date} to - End date of the range.
     * @returns {Promise<Array>} List of readings within the timeframe.
     */
    async getLatestByRange(animalId, from, to) {
        const repository = this.#repository;
        return await repository.findByRange(animalId, from, to);
    }
}

export default SensorService;
