class SensorController {
    #service;

    constructor(service) {
        this.#service = service;
    }

    createSensorData = async (req, res) => {
        const service = this.#service;

        try {
            const io = req.app.get("io");

            const result = await service.createSensorData(req.body, io);

            io.emit("sensorUpdate", result);

            res.status(201).json(result);
        } catch (err) {
            console.error("Error creating sensor data:", err);
            res.status(500).json({ error: "Failed to create sensor data" });
        }
    };

    getLatest = async (req, res) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;

            const latest = await service.getLatest(animalId);
            res.status(200).json(latest);
        } catch (err) {
            console.error("Error fetching latest sensor data:", err);
            res.status(500).json({
                error: "Failed to fetch latest sensor data",
            });
        }
    };

    history = async (req, res) => {
        const service = this.#service;

        try {
            const { animalId } = req.params;
            const { from, to } = req.query;

            const history = await service.getLatestByRange(
                animalId,
                new Date(from),
                new DataTransfer(to),
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
