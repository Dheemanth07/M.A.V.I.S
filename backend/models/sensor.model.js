/**
 * Mongoose Schema: SensorData
 * * Defines the structure and indexing of the sensor readings for the Mavis project.
 * This model captures physiological, behavioral, environmental, and location-based data
 * sent from smart collars/devices on animals.
 */
import mongoose from "mongoose";

/**
 * The blueprint for a single sensor data entry.
 * Includes nested objects for better data organization (Normalization).
 */
const sensorSchema = new mongoose.Schema(
    {
        /**
         * Unique identifier for the animal.
         * Indexed for faster lookups when searching for a specific animal's data.
         */
        animalId: {
            type: String,
            required: true,
            index: true,
        },

        // Physiological data: Vital signs of the animal
        physiology: {
            temperature: { type: Number, required: true },
            heartRate: { type: Number, required: true },
            respiratoryRate: { type: Number, required: true },
            bloodOxygen: { type: Number, required: true },
        },

        // Behavioral data: Movement and activity patterns
        behavior: {
            motion: { type: Boolean, required: true },
            steps: { type: Number },
            lyingDown: { type: Boolean },
        },

        // Environmental data: Conditions surrounding the animal
        environment: {
            ambientTemperature: { type: Number },
            humidity: { type: Number },
            aqi: { type: Number }, // Air Quality Index
        },

        // Geographical data: GPS coordinates and specific zones
        location: {
            latitude: { type: Number },
            longitude: { type: Number },
            zone: { type: String },
        },

        // Hardware health: Monitoring the physical device status
        device: {
            batteryLevel: { type: Number },
            signalStrength: { type: Number },
        },

        /**
         * The exact time the reading was taken by the device.
         * Indexed in descending order (-1) because we usually want the most recent data first.
         */
        timestamp: {
            type: Date,
            required: true,
            index: true,
        },
    },
    /**
     * Options:
     * timestamps: true adds 'createdAt' and 'updatedAt' fields automatically.
     */
    { timestamps: true },
);

/**
 * Compound Index
 * * Optimizes queries that filter by animalId AND sort by timestamp.
 * This is essential for the 'getLatest' and 'getHistory' features.
 */
sensorSchema.index({ animalId: 1, timestamp: -1 });

/**
 * Mongoose Model
 * * The interface used to interact with the 'sensordatas' collection in MongoDB.
 * @type {mongoose.Model}
 */
const SensorData = mongoose.model("SensorData", sensorSchema);

export default SensorData;
