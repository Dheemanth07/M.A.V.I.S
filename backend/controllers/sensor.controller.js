/**
 * SensorController handles the incoming HTTP requests for animal sensor data.
 * Acts as the "Traffic Cop," routing data to the Service layer and sending responses back.
 */
class SensorController {
    // Private field to ensure the service instance can't be accessed/changed from outside
    #service;

    /**
     * @param {Object} service - An instance of the SensorService (Dependency Injection)
     */
    constructor(service) {
        this.#service = service;
    }

    /**
     * POST: Creates new sensor readings and broadcasts alerts via Socket.io
     */
    createSensorData = async (req, res) => {
        // Local reference to the private service for cleaner syntax
        const service = this.#service;

        try {
            // Retrieve the Socket.io instance attached to the Express app
            const io = req.app.get("io");

            // Hand off data and socket instance to the service for processing
            const result = await service.createSensorData(req.body, io);

            // Broadcast the new data to all connected clients (Real-time monitoring)
            io.emit("sensorUpdate", result);

            // 201 Created: Success response
            res.status(201).json(result);
        } catch (err) {
            console.error("Error creating sensor data:", err);
            res.status(500).json({ error: "Failed to create sensor data" });
        }
    };

    /**
     * GET: Fetches the most recent sensor reading for a specific animal
     */
    getLatest = async (req, res) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;

            // Call service to find the single most recent document
            const latest = await service.getLatest(animalId);
            res.status(200).json(latest);
        } catch (err) {
            console.error("Error fetching latest sensor data:", err);
            res.status(500).json({
                error: "Failed to fetch latest sensor data",
            });
        }
    };

    /**
     * GET: Retrieves a list of readings for an animal within a specific timeframe
     */
    history = async (req, res) => {
        const service = this.#service;

        try {
            // animalId comes from the URL path, from/to come from the query string (?from=...&to=...)
            const { animalId } = req.params;
            const { from, to } = req.query;

            const history = await service.getLatestByRange(
                animalId,
                new Date(from),
                new Date(to),
            );

            res.status(200).json(history);
        } catch (err) {
            console.error("Error fetching history:", err);
            res.status(500).json({
                error: "Failed to fetch sensor history",
            });
        }
    };
}

export default SensorController;
