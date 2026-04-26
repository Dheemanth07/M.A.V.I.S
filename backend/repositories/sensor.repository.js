/**
 * SensorRepository
 * Abstracts data access logic using the Repository and Singleton patterns.
 */
import SensorData from "../models/sensor.model.js";

class SensorRepository {
    #model;

    constructor(model) {
        this.#model = model;
    }

    /**
     * @param {Object} data - Validated sensor data.
     * @returns {Promise<Object>}
     */
    async create(data) {
        return await this.#model.create(data);
    }

    /**
     * @param {string} animalId
     * @returns {Promise<Object|null>}
     */
    async findLatestByAnimal(animalId) {
        // Sort by timestamp descending to retrieve the most recent record
        return await this.#model.findOne({ animalId }).sort({ timestamp: -1 });
    }

    /**
     * @param {string} animalId
     * @param {Date} from
     * @param {Date} to
     * @returns {Promise<Array>}
     */
    async findByRange(animalId, from, to) {
        return await this.#model.find({
            animalId,
            timestamp: { $gte: from, $lte: to },
        }).sort({ timestamp: -1 });
    }
}

export default new SensorRepository();
