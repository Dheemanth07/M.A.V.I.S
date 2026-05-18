/**
 * @file MongoDB connection setup for the backend.
 */
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_RETRY_DELAY_MS = 5000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeRetryOptions = (maxRetries, retryDelayMs) => {
    const normalizedMaxRetries = Math.max(1, Math.floor(Number(maxRetries)));
    const normalizedRetryDelayMs = Number(retryDelayMs);

    if (!Number.isFinite(normalizedMaxRetries)) {
        throw new Error("connectDB option maxRetries must be a positive number");
    }

    if (!Number.isFinite(normalizedRetryDelayMs) || normalizedRetryDelayMs < 0) {
        throw new Error("connectDB option retryDelayMs must be a non-negative number");
    }

    return {
        maxRetries: normalizedMaxRetries,
        retryDelayMs: normalizedRetryDelayMs,
    };
};

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
    const retryOptions = normalizeRetryOptions(maxRetries, retryDelayMs);
    let attempt = 1;
    let lastError;

    while (attempt <= retryOptions.maxRetries) {
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
                maxRetries: retryOptions.maxRetries,
                message: error.message,
            });

            if (attempt < retryOptions.maxRetries) {
                await delay(retryOptions.retryDelayMs);
            }

            attempt += 1;
        }
    }

    throw lastError;
};

export default connectDB;
