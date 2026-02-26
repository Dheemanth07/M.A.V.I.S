const validateSensor = (req, res, next) => {
    const { animalId, physiology, behavior, timestamp } = req.body;

    if (!animalId || !physiology || !behavior || !timestamp) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    if (behavior.motion == null) {
        return res.status(400).json({ error: "Motion is required" });
    }

    if (physiology.temperature == null) {
        return res.status(400).json({ error: "Temperature is required" });
    }

    // Range validations
    if (physiology.temperature < 30 || physiology.temperature > 45) {
        return res.status(400).json({ error: "Temperature out of range" });
    }

    if (
        physiology.heartRate &&
        (physiology.heartRate < 30 || physiology.heartRate > 200)
    ) {
        return res.status(400).json({ error: "Heart rate abnormal range" });
    }

    if (
        req.body.device?.batteryLevel < 0 ||
        req.body.device?.batteryLevel > 100
    ) {
        return res.status(400).json({ error: "Invalid battery level" });
    }

    if (new Date(timestamp) > new Date()) {
        return res.status(400).json({ error: "Future timestamp not allowed" });
    }

    next();
};

export default validateSensor;
