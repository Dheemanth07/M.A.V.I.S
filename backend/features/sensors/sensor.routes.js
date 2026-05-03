/**
 * @file Sensor route registration.
 */
import express from "express";

/**
 * Owns the Express router for sensor reading endpoints.
 */
class SensorRoutes {
    /**
     * @param {import("./sensor.controller.js").default} sensorController - Sensor controller.
     * @param {import("./sensor.validator.js").default} sensorValidator - Sensor request validator.
     */
    constructor(sensorController, sensorValidator) {
        this.router = express.Router();
        this.sensorController = sensorController;
        this.sensorValidator = sensorValidator;

        this.initializeRoutes();
    }

    /**
     * Registers create, latest, and history routes for sensor data.
     *
     * @returns {void}
     */
    initializeRoutes() {
        this.router.post("/", this.sensorValidator.validate, this.sensorController.createSensorData);
        this.router.get("/latest/:animalId", this.sensorController.getLatest);
        this.router.get("/history/:animalId", this.sensorController.history);
    }

    /**
     * @returns {import("express").Router} Configured sensor router.
     */
    getRouter() {
        return this.router;
    }
}

export default SensorRoutes;
