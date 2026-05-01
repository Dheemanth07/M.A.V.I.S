/**
 * @file Data access wrapper for the animal model.
 */

/**
 * Keeps animal database calls in one place so services stay focused on rules.
 */
class AnimalRepository {
    #model;

    /**
     * @param {import("mongoose").Model} model - Mongoose animal model.
     */
    constructor(model) {
        this.#model = model;
    }

    /**
     * @param {Object} data - Animal profile data.
     * @returns {Promise<Object>} Created animal document.
     */
    async create(data) {
        return await this.#model.create(data);
    }

    /**
     * @returns {Promise<Object[]>} All animal documents.
     */
    async findAll() {
        return await this.#model.find();
    }

    /**
     * @param {string} id - Animal ObjectId.
     * @returns {Promise<Object|null>} Matching animal, if found.
     */
    async findById(id) {
        return await this.#model.findById(id);
    }

    /**
     * @param {string} id - Animal ObjectId.
     * @param {Object} data - Fields to update.
     * @returns {Promise<Object|null>} Updated animal, if found.
     */
    async update(id, data) {
        return await this.#model.findByIdAndUpdate(id, data, { new: true });
    }

    /**
     * @param {string} id - Animal ObjectId.
     * @returns {Promise<Object|null>} Deleted animal, if found.
     */
    async delete(id) {
        return await this.#model.findByIdAndDelete(id);
    }
}

export default AnimalRepository;
