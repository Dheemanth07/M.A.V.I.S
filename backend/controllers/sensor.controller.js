/**
 * SensorController
 * Handles incoming HTTP requests for animal sensor data.
 */

import AppError from "../utils/AppError.js";

class SensorController {
    #service;

    /**
     * @param {Object} service - SensorService instance (Dependency Injection)
     */
    constructor(service) {
        this.#service = service;
    }

    /**
     * POST: Creates readings and broadcasts alerts via Socket.io
     */
    createSensorData = async (req, res, next) => {
        const service = this.#service;

        try {
            const io = req.app.get("io");
            const result = await service.createSensorData(req.body, io);

            io.emit("sensorUpdate", result);

            res.status(201).json(result);
        } catch (err) {
            next(err); // Pass error to global error handler
        }
    };

    /**
     * GET: Fetches the most recent reading for a specific animal
     */
    getLatest = async (req, res, next) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;
            const latest = await service.getLatest(animalId);

            res.status(200).json(latest);
        } catch (err) {
            next(err); // Pass error to global error handler
        }
    };

    /**
     * GET: Retrieves readings within a specific timeframe
     */
    history = async (req, res, next) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;
            const { from, to } = req.query;

            // Validate that from and to parameters are provided
            if (!from || !to) {
                return res.status(400).json({
                    error: "Missing required query parameters: 'from' and 'to'",
                });
            }

            // Parse and validate date strings
            const fromDate = new Date(from);
            const toDate = new Date(to);

            // Check if dates are valid
            if (isNaN(fromDate.getTime())) {
                return res.status(400).json({
                    error: `Invalid 'from' date format: ${from}. Use ISO format (e.g., 2026-04-17T10:00:00Z)`,
                });
            }

            if (isNaN(toDate.getTime())) {
                return res.status(400).json({
                    error: `Invalid 'to' date format: ${to}. Use ISO format (e.g., 2026-04-17T10:00:00Z)`,
                });
            }

            const history = await service.getLatestByRange(
                animalId,
                fromDate,
                toDate,
            );

            res.status(200).json(history);
        } catch (err) {
            next(err); // Pass error to global error handler
        }
    };
}

export default SensorController;
