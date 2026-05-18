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
    {
        timestamps: true,
        timeseries: {
            timeField: "timestamp",
            metaField: "animalId",
            granularity: "minutes",
        },
    },
);

// Keeps latest/history lookups quick for each animal.
sensorSchema.index({ animalId: 1, timestamp: -1 });

/**
 * Sensor reading collection model.
 *
 * @type {mongoose.Model}
 */
const SensorData = mongoose.model("Sensor_Data", sensorSchema);

/**
 * Ensures MongoDB creates the sensor collection as a native time-series collection.
 *
 * MongoDB cannot convert an existing normal collection to time-series in place.
 *
 * @returns {Promise<void>}
 */
export const ensureSensorTimeSeriesCollection = async () => {
    const collectionName = SensorData.collection.name;
    const collectionInfo = await mongoose.connection.db
        .listCollections({ name: collectionName })
        .next();

    if (!collectionInfo) {
        await SensorData.createCollection();
        await SensorData.createIndexes();
        return;
    }

    if (collectionInfo.type !== "timeseries") {
        throw new Error(
            `Collection "${collectionName}" already exists as "${collectionInfo.type}". ` +
                "Create a migration or drop/rename the existing collection before using MongoDB time-series storage.",
        );
    }

    await SensorData.createIndexes();
};

export default SensorData;
