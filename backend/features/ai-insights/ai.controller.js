import aiService from "./ai.service.js";
import AnimalData from "../animals/animal.model.js";
import SensorData from "../sensors/sensor.model.js";
import { sendSuccess } from "../../utils/httpResponse.js";

export const getAIInsight = async (req, res, next) => {
    try {
        const { animalId } = req.params;
        const animal = await AnimalData.findById(animalId);
        if (!animal) {
            return res.status(404).json({ success: false, message: "Animal not found" });
        }

        const latestSensor = await SensorData.findOne({ animalId }).sort({ createdAt: -1 });
        const vitals = latestSensor ? latestSensor.physiology : {};

        const insight = aiService.generateAnimalInsight(animal, vitals);
        sendSuccess(res, 200, insight, "AI insights generated successfully");
    } catch (err) {
        next(err);
    }
};
