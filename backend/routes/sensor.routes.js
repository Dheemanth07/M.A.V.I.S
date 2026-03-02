/**
 * Sensor Routes
 * * This file defines the API endpoints for the Sensor module and connects them
 * to the appropriate controller methods.
 * * It also handles the "Wiring" of the architecture via Manual Dependency Injection.
 */
import express from "express";
import validateSensorData from "../middlewares/validateSensorData.middleware";

// Importing the Repository instance (Singleton)
import sensorRepository from "../repositories/sensor.repository";
import SensorService from "../services/sensor.service";
import SensorController from "../controllers/sensor.controller";

const router = express.Router();

/**
 * Manual Dependency Injection
 * ----------------------------
 * 1. The Service needs the Repository to talk to the Database.
 * 2. The Controller needs the Service to run Business Logic.
 * 3. By passing them in the constructor, we make the code "Testable" and "Decoupled."
 */
const sensorService = new SensorService(sensorRepository);
const sensorController = new SensorController(sensorService);

/**
 * Route Definitions
 */

/**
 * @route   POST /api/sensor
 * @desc    Receive new data from a sensor, validate it, and process alerts
 * @access  Public (or Private with Auth middleware)
 */
router.post("/sensor", validateSensorData, sensorController.createSensorData);

/**
 * @route   GET /api/sensor/latest/:animalId
 * @desc    Fetch the most recent reading for a specific animal
 * @access  Public
 */
router.get("/sensor/latest/:animalId", sensorController.getLatest);

/**
 * @route   GET /api/sensor/history/:animalId
 * @desc    Fetch a range of historical data for graphing/analysis
 * @access  Public
 */
router.get("/sensor/history/:animalId", sensorController.history);

export default router;
