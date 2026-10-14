/**
 * @file MongoDB connection manager for the backend.
 * Encapsulates multi-tier database connection lifecycle with automatic fallback:
 * Primary (Atlas / URI) -> Local (127.0.0.1:27017) -> In-Memory (mongodb-memory-server).
 */
import mongoose from "mongoose";
import logger from "../utils/logger.js";

export class DatabaseManager {
    static DEFAULT_MAX_RETRIES = 2;
    static DEFAULT_RETRY_DELAY_MS = 1500;

    #targetUri;
    #maxRetries;
    #retryDelayMs;

    /**
     * @param {Object} [options={}]
     * @param {string} [options.uri]
     * @param {number} [options.maxRetries]
     * @param {number} [options.retryDelayMs]
     */
    constructor(options = {}) {
        this.#targetUri = options.uri || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mavis";
        this.#maxRetries = Math.max(1, Math.floor(Number(options.maxRetries || DatabaseManager.DEFAULT_MAX_RETRIES)));
        this.#retryDelayMs = Math.max(0, Number(options.retryDelayMs || DatabaseManager.DEFAULT_RETRY_DELAY_MS));
    }

    #delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Attempts connection to primary URI with retry loop.
     * @private
     */
    async #connectPrimary() {
        for (let attempt = 1; attempt <= this.#maxRetries; attempt++) {
            try {
                const conn = await mongoose.connect(this.#targetUri, {
                    serverSelectionTimeoutMS: 4000,
                });

                logger.info("MongoDB connected successfully", {
                    host: conn.connection.host,
                    database: conn.connection.name,
                    isLocal: conn.connection.host.includes("127.0.0.1") || conn.connection.host.includes("localhost"),
                });
                return true;
            } catch (error) {
                logger.warn("Database connection attempt failed", {
                    attempt,
                    maxRetries: this.#maxRetries,
                    message: error.message,
                });

                if (this.#targetUri.includes("mongodb+srv") && error.message.includes("auth")) {
                    logger.info("Atlas auth failure detected — switching to local MongoDB immediately.");
                    break;
                }

                if (attempt < this.#maxRetries) {
                    await this.#delay(this.#retryDelayMs);
                }
            }
        }
        return false;
    }

    /**
     * Attempts local MongoDB connection.
     * @private
     */
    async #connectLocalFallback() {
        try {
            const localConn = await mongoose.connect("mongodb://127.0.0.1:27017/mavis", {
                serverSelectionTimeoutMS: 2000,
            });
            logger.info("MongoDB connected (Local Fallback)", { host: localConn.connection.host });
            return true;
        } catch {
            logger.warn("Local MongoDB fallback failed. Attempting in-memory server...");
            return false;
        }
    }

    /**
     * Attempts in-memory MongoDB connection as final resort.
     * @private
     */
    async #connectInMemoryFallback() {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        const memServer = await MongoMemoryServer.create();
        const memUri = memServer.getUri();
        const memConn = await mongoose.connect(memUri);
        logger.info("MongoDB connected (In-Memory Fallback)", {
            host: memConn.connection.host,
            database: memConn.connection.name,
        });
        return true;
    }

    /**
     * Connects Mongoose using the 3-tier fallback strategy.
     * @returns {Promise<void>}
     */
    async connect() {
        if (await this.#connectPrimary()) return;
        if (await this.#connectLocalFallback()) return;

        try {
            await this.#connectInMemoryFallback();
        } catch (fallbackErr) {
            logger.error("All MongoDB connection strategies exhausted", fallbackErr);
            throw fallbackErr;
        }
    }

    /**
     * Static helper for direct connection.
     * @param {Object} [options]
     * @returns {Promise<void>}
     */
    static async connect(options) {
        const manager = new DatabaseManager(options);
        return await manager.connect();
    }
}

export const connectDB = (options) => DatabaseManager.connect(options);
export default connectDB;
