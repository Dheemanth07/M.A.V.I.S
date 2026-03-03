/**
 * Sensor Routes
 * Connects API endpoints to controller methods and handles dependency injection.
 */
import express from "express";
import validateSensorData from "../middlewares/validateSensorData.middleware";
import sensorRepository from "../repositories/sensor.repository";
import SensorService from "../services/sensor.service";
import SensorController from "../controllers/sensor.controller";

const router = express.Router();

// Manual Dependency Injection
const sensorService = new SensorService(sensorRepository);
const sensorController = new SensorController(sensorService);

/**
 * @route   POST /api/sensor
 * @desc    Process new sensor data and alerts
 */
router.post("/sensor", validateSensorData, sensorController.createSensorData);

/**
 * @route   GET /api/sensor/latest/:animalId
 * @desc    Get most recent reading for an animal
 */
router.get("/sensor/latest/:animalId", sensorController.getLatest);

/**
 * @route   GET /api/sensor/history/:animalId
 * @desc    Get historical data for an animal
 */
router.get("/sensor/history/:animalId", sensorController.history);

export default router;
