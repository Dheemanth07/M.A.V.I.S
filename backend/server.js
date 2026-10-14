/**
 * @file Application entry point (Object-Oriented Bootstrap).
 * Connects database, starts background services, and begins HTTP listening.
 */
import "./config/env.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import { Application } from "./app.js";
import TelemetryDaemon from "./features/simulation/telemetryDaemon.service.js";

export class ServerBootstrap {
    #application;
    #port;

    constructor(port = process.env.PORT || 5000) {
        this.#port = port;
        this.#application = new Application();
    }

    get application() {
        return this.#application;
    }

    get app() {
        return this.#application.app;
    }

    get httpServer() {
        return this.#application.httpServer;
    }

    get io() {
        return this.#application.io;
    }

    /**
     * Connects to database and starts services.
     */
    async start() {
        try {
            await connectDB();

            const daemon = new TelemetryDaemon(this.#application.io);
            await daemon.start();

            this.#application.httpServer.listen(this.#port, () => {
                logger.info(`Server running on port ${this.#port}`);
            });
        } catch (err) {
            logger.error("Failed to start server", err);
            process.exit(1);
        }
    }
}

const bootstrap = new ServerBootstrap();
bootstrap.start();

export const { app, httpServer, io } = bootstrap;
export default bootstrap;
