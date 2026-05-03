/**
 * @file Animal route registration.
 */
import express from 'express';

/**
 * Owns the Express router for animal profile endpoints.
 */
class AnimalRoutes {
    /**
     * @param {import("./animal.controller.js").default} animalController - Animal controller.
     * @param {import("./animal.validator.js").default} animalValidator - Animal request validator.
     */
    constructor(animalController, animalValidator) {
        this.router = express.Router();
        this.animalController = animalController;
        this.animalValidator = animalValidator;

        this.initializeRoutes();
    }

    /**
     * Registers animal CRUD routes and the health summary route.
     *
     * @returns {void}
     */
    initializeRoutes() {
        this.router.post('/', this.animalValidator.validate, this.animalController.createAnimal);
        this.router.get('/', this.animalController.getAnimals);
        this.router.get('/:id', this.animalController.getAnimal);
        this.router.put('/:id', this.animalValidator.validate, this.animalController.updateAnimal);
        this.router.delete('/:id', this.animalController.deleteAnimal);
        this.router.get('/:id/health', this.animalController.getHealthStatus);
    }

    /**
     * @returns {import("express").Router} Configured animal router.
     */
    getRouter() {
        return this.router;
    }
}

export default AnimalRoutes;
