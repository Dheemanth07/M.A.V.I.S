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
        // 1. Ingest new sensor data
        this.router.post(
            "/",
            this.sensorValidator.validate,
            this.sensorController.createSensorData,
        );

        // 2. Get the most recent reading for a specific animal
        this.router.get(
            "/latest/:animalId",
            this.sensorValidator.validateAnimalIdParam,
            this.sensorController.getLatest,
        );

        // 3. Get historical data for charts
        this.router.get(
            "/history/:animalId",
            this.sensorValidator.validateAnimalIdParam,
            this.sensorValidator.validateHistoryQuery,
            this.sensorController.history,
        );
    }

    /**
     * @returns {import("express").Router} Configured sensor router.
     */
    getRouter() {
        return this.router;
    }
}

export default SensorRoutes;
