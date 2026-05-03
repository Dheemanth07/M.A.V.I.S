/**
 * @file Data access wrapper for sensor readings.
 */

/**
 * Keeps sensor queries small and reusable across services.
 */
class SensorRepository {
    #model;

    /**
     * @param {import("mongoose").Model} model - Mongoose sensor model.
     */
    constructor(model) {
        this.#model = model;
    }

    /**
     * @param {Object} data - Validated sensor reading.
     * @returns {Promise<Object>} Created sensor document.
     */
    async create(data) {
        return await this.#model.create(data);
    }

    /**
     * @param {string} animalId - Animal ObjectId.
     * @returns {Promise<Object|null>} Latest reading for the animal.
     */
    async findLatestByAnimal(animalId) {
        return await this.#model.findOne({ animalId }).sort({ timestamp: -1 });
    }

    /**
     * @param {string} animalId - Animal ObjectId.
     * @param {Date} from - Start of the requested time range.
     * @param {Date} to - End of the requested time range.
     * @returns {Promise<Object[]>} Readings ordered from newest to oldest.
     */
    async findByRange(animalId, from, to) {
        return await this.#model.find({
            animalId,
            timestamp: { $gte: from, $lte: to },
        }).sort({ timestamp: -1 });
    }
}

export default SensorRepository;
