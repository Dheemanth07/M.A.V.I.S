import mongoose from "mongoose";
import aiService from "./ai.service.js";
import AnimalData from "../animals/animal.model.js";
import SensorData from "../sensors/sensor.model.js";
import { evaluateHealth } from "../health-engine/healthEngine.service.js";
import { sendSuccess } from "../../utils/httpResponse.js";

export const getAIInsight = async (req, res, next) => {
    try {
        const { animalId } = req.params;
        let animal = null;

        const isUserAdmin = req.user && req.user.role === 'admin';
        const isValidUserId = req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id);
        const userFilter = isUserAdmin ? {} : (isValidUserId ? { owner: req.user.id } : {});

        if (mongoose.Types.ObjectId.isValid(animalId)) {
            animal = await AnimalData.findOne({ _id: animalId, ...userFilter });
        }

        if (!animal) {
            animal = await AnimalData.findOne(userFilter);
        }

        if (!animal) {
            animal = {
                _id: animalId,
                name: "Tracked Subject",
                species: "Canine / Livestock",
                healthStatus: "healthy",
                baselines: { temperature: 38.5, heartRate: 75 }
            };
        }

        let vitals = {};
        let healthReport = {};

        if (animal._id && mongoose.Types.ObjectId.isValid(animal._id)) {
            const latestSensor = await SensorData.findOne({ animalId: animal._id }).sort({ createdAt: -1 });
            if (latestSensor) {
                vitals = {
                    ...(latestSensor.physiology || {}),
                    motion: latestSensor.behavior?.motion ?? true,
                    lyingDown: latestSensor.behavior?.lyingDown ?? false,
                    ambientTemperature: latestSensor.environment?.ambientTemperature,
                    humidity: latestSensor.environment?.humidity,
                    battery: latestSensor.device?.batteryLevel,
                };

                // Run deterministic multi-modal HealthEngine evaluation
                try {
                    healthReport = evaluateHealth({
                        temperature: vitals.temperature,
                        heartRate: vitals.heartRate,
                        oxygen: vitals.bloodOxygen,
                        humidity: vitals.humidity,
                        battery: vitals.battery,
                        motion: vitals.motion,
                        lyingDown: vitals.lyingDown
                    });
                } catch {
                    healthReport = {};
                }
            }
        }

        const insight = await aiService.generateAnimalInsight(animal, vitals, healthReport);
        sendSuccess(res, 200, insight, "Clinical insights generated successfully");
    } catch (err) {
        next(err);
    }
};
