/**
 * @file Mongoose model for animal sensor readings.
 */
import mongoose from "mongoose";

/**
 * Stores time-series sensor readings for a real animal document.
 */
const sensorSchema = new mongoose.Schema(
    {
        animalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Animal",
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
            default: Date.now,
            index: true,
        },
    },
    { timestamps: true },
);

// Keeps latest/history lookups quick for each animal.
sensorSchema.index({ animalId: 1, timestamp: -1 });

/**
 * Sensor reading collection model.
 *
 * @type {mongoose.Model}
 */
const SensorData = mongoose.model("Sensor_Data", sensorSchema);

export default SensorData;
