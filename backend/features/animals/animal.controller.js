/**
 * @file Express handlers for animal endpoints.
 */
import { sendMessage, sendSuccess } from "../../utils/httpResponse.js";

/**
 * Turns animal HTTP requests into service calls and JSON responses.
 */
class AnimalController {
    #service;

    /**
     * @param {import("./animal.service.js").default} service - Animal service.
     */
    constructor(service) {
        this.#service = service;
    }

    /**
     * Creates a new animal profile.
     *
     * @param {import("express").Request} req - Request containing animal data.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    createAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const payload = { ...req.body };
            if (req.user && req.user.id && !payload.owner) {
                payload.owner = req.user.id;
            }
            const animal = await service.createAnimal(payload);
            sendSuccess(res, 201, animal, "Animal created successfully");
        } catch (err) {
            next(err);
        }
    };

    /**
     * Lists animals (filtered by owner for pet owners, global for admins).
     *
     * @param {import("express").Request} req - Express request.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    getAnimals = async (req, res, next) => {
        const service = this.#service;

        try {
            let filter = {};
            if (req.user && req.user.role !== 'admin') {
                filter = {
                    $or: [
                        { owner: req.user.id },
                        { owner: { $exists: false } },
                        { owner: null }
                    ]
                };
            }
            const animals = await service.getAnimals(filter);
            sendSuccess(res, 200, animals, "Animals fetched successfully");
        } catch (err) {
            next(err);
        }
    };

    /**
     * Returns one animal by Mongo ObjectId.
     *
     * @param {import("express").Request} req - Request with `id` route param.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    getAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const { id } = req.params;
            const animal = await service.getAnimal(id);
            sendSuccess(res, 200, animal, "Animal fetched successfully");
        } catch (err) {
            next(err);
        }
    };

    /**
     * Updates an animal profile by Mongo ObjectId.
     *
     * @param {import("express").Request} req - Request with `id` param and update body.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    updateAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const { id } = req.params;
            const updatedAnimal = await service.updateAnimal(id, req.body);
            sendSuccess(res, 200, updatedAnimal, "Animal updated successfully");
        } catch (err) {
            next(err);
        }
    };

    /**
     * Deletes an animal profile by Mongo ObjectId.
     *
     * @param {import("express").Request} req - Request with `id` route param.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    deleteAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const { id } = req.params;
            const deletedAnimal = await service.deleteAnimal(id);
            sendMessage(res, 200, "Animal deleted successfully", deletedAnimal);
        } catch (err) {
            next(err);
        }
    };

    /**
     * Returns the latest computed health summary for an animal.
     *
     * @param {import("express").Request} req - Request with `id` route param.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    getHealthStatus = async (req, res, next) => {
        const service = this.#service;

        try {
            const animal = await service.getHealthStatus(req.params.id);
            sendSuccess(res, 200, animal, "Animal health status fetched successfully");
        } catch (err) {
            next(err);
        }
    };
}

export default AnimalController;
