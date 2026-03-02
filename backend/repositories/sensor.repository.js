/**
 * SensorRepository
 * * Pattern: Repository Pattern
 * Purpose: Abstracts all Mongoose/MongoDB specific logic away from the rest of the application.
 * If the database changes in the future, only this file needs to be updated.
 * * Pattern: Singleton Pattern
 * Purpose: By exporting a 'new' instance, we ensure that every service uses the same
 * database connection and logic, saving memory and preventing inconsistent states.
 */
import SensorData from "../models/sensor.model";

class SensorRepository {
    /**
     * Persists a new sensor reading to the database.
     * * @param {Object} data - The validated sensor data object.
     * @returns {Promise<Object>} The document created in MongoDB.
     */
    async save(data) {
        // Mongoose .create() handles the insertion and returns the saved document
        return await SensorData.create(data);
    }

    /**
     * Retrieves the single most recent reading for a specific animal.
     * * @param {string} animalId - The unique identifier for the animal.
     * @returns {Promise<Object|null>} The latest reading or null if none found.
     */
    async findLatestByAnimal(animalId) {
        /**
         * We filter by animalId and sort by timestamp in descending order (-1)
         * to ensure the very first result is the "latest" one.
         */
        return await SensorData.findOne({ animalId }).sort({ timestamp: -1 });
    }

    /**
     * Retrieves all sensor readings for an animal within a specific time window.
     * * @param {string} animalId - The unique identifier for the animal.
     * @param {Date} from - The start of the date range.
     * @param {Date} to - The end of the date range.
     * @returns {Promise<Array>} A list of sensor readings sorted by time.
     */
    async findByRange(animalId, from, to) {
        /**
         * Uses MongoDB comparison operators:
         * $gte: Greater Than or Equal to
         * $lte: Less Than or Equal to
         */
        return await SensorData.find({
            animalId,
            timestamp: { $gte: from, $lte: to },
        }).sort({ timestamp: -1 });
    }
}

/**
 * Exporting a new instance ensures that the Singleton pattern is enforced.
 * When other files import this, they receive the same initialized object.
 */
export default new SensorRepository();
