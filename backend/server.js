/**
 * @file Application entry point.
 *
 * Connects dependencies and starts the HTTP listener.
 */

import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { createApp } from "./app.js";
import logger from "./utils/logger.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;
const { httpServer } = createApp();

/**
 * Connects to MongoDB before accepting HTTP requests.
 *
 * @returns {Promise<void>}
 */
const startServer = async () => {
    try {
        await connectDB();

        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (err) {
        logger.error("Failed to start server", err);
        process.exit(1);
    }
};

startServer();
