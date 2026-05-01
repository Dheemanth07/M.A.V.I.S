/**
 * @file Express handlers for animal endpoints.
 */
import AppError from "../utils/AppError.js";

/**
 * Turns animal HTTP requests into service calls and JSON responses.
 */
class AnimalController {
    #service;

    /**
     * @param {import("../services/animal.service.js").default} service - Animal service.
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
            const animal = await service.createAnimal(req.body);
            res.status(201).json(animal);
        } catch (err) {
            next(err);
        }
    };

    /**
     * Lists all animals.
     *
     * @param {import("express").Request} req - Express request.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    getAnimals = async (req, res, next) => {
        const service = this.#service;

        try {
            const animals = await service.getAnimals();
            res.status(200).json(animals);
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
            res.status(200).json(animal);
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
            res.status(200).json(updatedAnimal);
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
            res.status(200).json(deletedAnimal);
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
            res.status(200).json(animal);
        } catch (err) {
            next(err);
        }
    };
}

export default AnimalController;
