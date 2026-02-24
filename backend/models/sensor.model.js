import { timeStamp } from "console";
import mongoose from "mongoose";

const sensorScheme = new mongoose.Schema(
    {
        animalId: {
            type: String,
            required: true,
            index: true,
        },
        temperature: {
            type: Number,
            required: true,
        },
        motion: {
            type: Boolean,
            required: true,
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
