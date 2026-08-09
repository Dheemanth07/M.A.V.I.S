/**
 * @file MongoDB connection setup for the backend.
 * Supports primary database connection (e.g. Atlas/Local) with an automatic
 * in-memory MongoDB fallback when primary connection credentials or network fail.
 */
import mongoose from "mongoose";
import logger from "../utils/logger.js";

const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 1500;

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

let mongoMemoryServer = null;

/**
 * Connects Mongoose to the configured MongoDB database.
 * Attempts primary connection first, then falls back to in-memory server if unavailable.
 *
 * @param {{maxRetries?: number, retryDelayMs?: number}} options - Retry settings.
 * @returns {Promise<void>}
 */
const connectDB = async ({
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
} = {}) => {
    const retryOptions = normalizeRetryOptions(maxRetries, retryDelayMs);
    const mongoUri = process.env.MONGO_URI;

    // 2. Single, clean retry loop with local edge fallback
    const targetUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mavis";

    while (attempt <= retryOptions.maxRetries) {
        try {
            const uriToTry = (attempt > 2 && targetUri.includes("mongodb+srv")) 
                ? "mongodb://127.0.0.1:27017/mavis" 
                : targetUri;

            const conn = await mongoose.connect(uriToTry, {
                serverSelectionTimeoutMS: 4000,
            });

            logger.info("MongoDB connected successfully", { 
                host: conn.connection.host,
                database: conn.connection.name,
                isLocal: conn.connection.host.includes("127.0.0.1") || conn.connection.host.includes("localhost")
            });
            return;

        } catch (error) {
            lastError = error;

            logger.warn("Database connection failed", {
                attempt,
                maxRetries: retryOptions.maxRetries,
                message: error.message,
            });

            // If remote Atlas failed with auth error, immediately switch to local MongoDB
            if (targetUri.includes("mongodb+srv") && error.message.includes("auth")) {
                try {
                    logger.info("Falling back to local Edge MongoDB at 127.0.0.1:27017/mavis...");
                    const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/mavis", {
                        serverSelectionTimeoutMS: 3000,
                    });
                    logger.info("Connected to local Edge MongoDB", { host: localConn.connection.host });
                    return;
                } catch (localErr) {
                    logger.warn("Local MongoDB fallback also failed", { message: localErr.message });
                }
            }

            // 3. Wait before trying again (if not on the last attempt)
            if (attempt < retryOptions.maxRetries) {
                await delay(retryOptions.retryDelayMs);
            }
        }
        logger.warn("Primary MongoDB connection failed. Attempting local / in-memory fallback...");
    }

    // 2. Local MongoDB connection attempt (127.0.0.1:27017)
    try {
        const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/mavis", {
            serverSelectionTimeoutMS: 2000,
        });
        logger.info("MongoDB connected (Local Fallback)", { host: localConn.connection.host });
        return;
    } catch {
        // Local MongoDB non-existent, proceed to in-memory server
    }

    // 3. In-Memory MongoDB Server Fallback
    try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        mongoMemoryServer = await MongoMemoryServer.create();
        const memUri = mongoMemoryServer.getUri();
        const memConn = await mongoose.connect(memUri);
        logger.info("MongoDB connected (In-Memory Server Fallback)", {
            host: memConn.connection.host,
            database: memConn.connection.name,
        });
        return;
    } catch (fallbackErr) {
        logger.error("Failed to initialize in-memory MongoDB fallback", fallbackErr);
        throw fallbackErr;
    }
};

export default connectDB;
