/**
 * @file MongoDB connection setup for the backend.
 */
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 5000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects Mongoose to the configured MongoDB database.
 *
 * Retries after a short delay so Docker/local startup has time to settle.
 *
 * @param {{maxRetries?: number, retryDelayMs?: number}} options - Retry settings.
 * @returns {Promise<void>}
 */
const connectDB = async ({
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
} = {}) => {
    let attempt = 1;
    let lastError;

    while (attempt <= maxRetries) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
            });

            logger.info("MongoDB connected", { host: conn.connection.host });
            return;
        } catch (error) {
            lastError = error;
            logger.warn("Database connection failed", {
                attempt,
                maxRetries,
                message: error.message,
            });

            if (attempt < maxRetries) {
                await delay(retryDelayMs);
            }

            attempt += 1;
        }
    }

    throw lastError;
};

export default connectDB;
