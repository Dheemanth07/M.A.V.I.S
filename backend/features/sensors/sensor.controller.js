/**
 * @file Express handlers for sensor reading endpoints.
 */

/**
 * Turns sensor HTTP requests into service calls and realtime events.
 */
class SensorController {
    #service;

    /**
     * @param {import("./sensor.service.js").default} service - Sensor service.
     */
    constructor(service) {
        this.#service = service;
    }

    /**
     * Creates a sensor reading and broadcasts the saved record.
     *
     * @param {import("express").Request} req - Request containing sensor data.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    createSensorData = async (req, res, next) => {
        const service = this.#service;

        try {
            const io = req.app.get("io");
            const result = await service.createSensorData(req.body, io);

            io.emit("sensorUpdate", result);

            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    };

    /**
     * Returns the most recent sensor reading for an animal.
     *
     * @param {import("express").Request} req - Request with `animalId` route param.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    getLatest = async (req, res, next) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;
            const latest = await service.getLatest(animalId);

            res.status(200).json(latest);
        } catch (err) {
            next(err);
        }
    };

    /**
     * Returns sensor readings between two ISO date query params.
     *
     * @param {import("express").Request} req - Request with `animalId`, `from`, and `to`.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Error handler callback.
     * @returns {Promise<void>}
     */
    history = async (req, res, next) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;
            const { from, to } = req.query;

            if (!from || !to) {
                return res.status(400).json({
                    error: "Missing required query parameters: 'from' and 'to'",
                });
            }

            const fromDate = new Date(from);
            const toDate = new Date(to);

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
            next(err);
        }
    };
}

export default SensorController;
