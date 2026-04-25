/**
 * Sensor Routes
 * Connects API endpoints to controller methods.
 */
import express from "express";

class SensorRoutes {
    constructor(sensorController, sensorValidator) {
        this.router = express.Router();
        this.sensorController = sensorController;
        this.sensorValidator = sensorValidator;

        this.initializeRoutes();
    }

    initializeRoutes() {
        // Notice the paths are just "/", "/latest/:animalId", etc.
        // We will add the "/api/sensor" prefix in server.js!
        this.router.post("/", this.sensorValidator.validate, this.sensorController.createSensorData);
        this.router.get("/latest/:animalId", this.sensorController.getLatest);
        this.router.get("/history/:animalId", this.sensorController.history);
    }

    getRouter() {
        return this.router;
    }
}

export default SensorRoutes;