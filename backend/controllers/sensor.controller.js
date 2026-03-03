/**
 * SensorController
 * Handles incoming HTTP requests for animal sensor data.
 */

import AppError from "../utils/AppError";

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

            const history = await service.getLatestByRange(
                animalId,
                new Date(from),
                new Date(to),
            );

            res.status(200).json(history);
        } catch (err) {
            next(err); // Pass error to global error handler
        }
    };
}

export default SensorController;
