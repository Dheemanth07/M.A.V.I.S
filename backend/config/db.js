/**
 * @file MongoDB connection setup for the backend.
 * Attempts primary MONGO_URI first (Atlas or local), falls back to
 * local 127.0.0.1:27017, and finally to an in-memory MongoDB server.
 */
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1500;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connects Mongoose to MongoDB with retry + local fallback.
 *
 * @param {{maxRetries?: number, retryDelayMs?: number}} options
 * @returns {Promise<void>}
 */
const connectDB = async ({
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
} = {}) => {
    const targetUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mavis";
    const maxR = Math.max(1, Math.floor(Number(maxRetries)));
    const delayMs = Math.max(0, Number(retryDelayMs));

    // 1. Primary connection with retry loop
    for (let attempt = 1; attempt <= maxR; attempt++) {
        try {
            const conn = await mongoose.connect(targetUri, {
                serverSelectionTimeoutMS: 4000,
            });

            logger.info("MongoDB connected successfully", {
                host: conn.connection.host,
                database: conn.connection.name,
                isLocal:
                    conn.connection.host.includes("127.0.0.1") ||
                    conn.connection.host.includes("localhost"),
            });
            return;

        } catch (error) {
            logger.warn("Database connection attempt failed", {
                attempt,
                maxRetries: maxR,
                message: error.message,
            });

            // Atlas auth failure — skip retries, jump straight to local fallback
            if (targetUri.includes("mongodb+srv") && error.message.includes("auth")) {
                logger.info("Atlas auth failure detected — switching to local MongoDB immediately.");
                break;
            }

            if (attempt < maxR) {
                await delay(delayMs);
            }
        }
    }

    logger.warn("Primary MongoDB connection failed. Attempting local fallback (127.0.0.1:27017)...");

    // 2. Local MongoDB fallback
    try {
        const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/mavis", {
            serverSelectionTimeoutMS: 2000,
        });
        logger.info("MongoDB connected (Local Fallback)", { host: localConn.connection.host });
        return;
    } catch {
        logger.warn("Local MongoDB fallback failed. Attempting in-memory server...");
    }

    // 3. In-memory MongoDB last resort
    try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const memServer = await MongoMemoryServer.create();
        const memUri = memServer.getUri();
        const memConn = await mongoose.connect(memUri);
        logger.info("MongoDB connected (In-Memory Fallback)", {
            host: memConn.connection.host,
            database: memConn.connection.name,
        });
        return;
    } catch (fallbackErr) {
        logger.error("All MongoDB connection strategies exhausted", fallbackErr);
        throw fallbackErr;
    }
};

export default connectDB;
