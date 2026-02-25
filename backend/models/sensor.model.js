import { timeStamp } from "console";
import mongoose from "mongoose";

const sensorScheme = new mongoose.Schema(
    {
        animalId: {
            type: String,
            required: true,
            index: true,
        },

        physiology: {
            temperature: { type: Number, required: true },
            heartRate: { type: Number, required: true },
            respiratoryRate: { type: Number, required: true },
            bloodOxygen: { type: Number, required: true },
        },

        behavior: {
            motion: { type: Boolean, required: true },
            steps: { type: Number },
            lyingDown: { type: Boolean },
        },

        environment: {
            ambientTemperature: { type: Number },
            humidity: { type: Number },
            aqi: { type: Number },
        },

        location: {
            latitude: { type: Number },
            longitude: { type: Number },
            zone: { type: String },
        },

        device: {
            batteryLevel: { type: Number },
            signalStrength: { type: Number },
        },

        timestamp: {
            type: Date,
            required: true,
            index: true,
        },
    },
    { timestamps: true },
);

// Compound index for efficient querying by animalId and timestamp
sensorSchema.index({ animalId: 1, timestamp: -1 });

const SensorData = mongoose.model("SensorData", sensorSchema);

export default SensorData;
