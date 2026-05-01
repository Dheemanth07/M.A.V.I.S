/**
 * @file MongoDB connection setup for the backend.
 */
import mongoose from "mongoose";

/**
 * Connects Mongoose to the configured MongoDB database.
 *
 * Retries after a short delay so Docker/local startup has time to settle.
 *
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
