import express from "express";

import validateSensorData from "../middlewares/validateSensorData.middleware";

import SensorRepository from "../repositories/sensor.repository";
import SensorService from "../services/sensor.service";
import SensorController from "../controllers/sensor.controller";

const router = express.Router();

// Manual Dependency Injection
const sensorRepository = new SensorRepository();
const sensorService = new SensorService(sensorRepository);
const sensorController = new SensorController(sensorService);

// Routes
router.post("/sensor", validateSensorData, sensorController.createSensorData);
router.get("/sensor/latest/:animalId", sensorController.getLatest);
router.get("/sensor/history/:animalId", sensorController.history);

export default router;
