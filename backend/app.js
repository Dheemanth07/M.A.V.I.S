/**
 * @file Express application composition (Object-Oriented Architecture).
 *
 * Encapsulates HTTP app, Socket.IO server, and feature routes within
 * an Application class.
 */

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import "./config/env.js";
import corsOptions from "./middlewares/cors.js";
import globalErrorHandler from "./middlewares/error.middleware.js";
import { extractUser } from "./middlewares/auth.middleware.js";
import logger from "./utils/logger.js";

// --- Feature Imports ---
import AnimalData from "./features/animals/animal.model.js";
import AnimalRepository from "./features/animals/animal.repository.js";
import AnimalService from "./features/animals/animal.service.js";
import AnimalController from "./features/animals/animal.controller.js";
import AnimalValidator from "./features/animals/animal.validator.js";
import AnimalRoutes from "./features/animals/animal.routes.js";

import SensorData from "./features/sensors/sensor.model.js";
import SensorRepository from "./features/sensors/sensor.repository.js";
import SensorService from "./features/sensors/sensor.service.js";
import SensorController from "./features/sensors/sensor.controller.js";
import SensorValidator from "./features/sensors/sensor.validator.js";
import SensorRoutes from "./features/sensors/sensor.routes.js";

import AlertData from "./features/alerts/alert.model.js";
import AlertRepository from "./features/alerts/alert.repository.js";
import AlertService from "./features/alerts/alert.service.js";
import AlertController from "./features/alerts/alert.controller.js";
import AlertValidator from "./features/alerts/alert.validator.js";
import AlertRoutes from "./features/alerts/alert.routes.js";

import { AuthRoutes } from "./features/auth/auth.routes.js";
import { AIRoutes } from "./features/ai-insights/ai.routes.js";

export class Application {
    #app;
    #httpServer;
    #io;

    constructor() {
        this.#app = express();
        this.#httpServer = createServer(this.#app);
        this.#io = new Server(this.#httpServer, { cors: corsOptions });

        this.#setupMiddlewares();
        this.#setupSockets();
        this.#setupRoutes();
        this.#setupErrorHandling();
    }

    get app() {
        return this.#app;
    }

    get httpServer() {
        return this.#httpServer;
    }

    get io() {
        return this.#io;
    }

    #setupMiddlewares() {
        this.#app.use(cors(corsOptions));
        this.#app.use(express.json());
        this.#app.use(extractUser);
        this.#app.set("io", this.#io);
    }

    #setupSockets() {
        this.#io.on("connection", (socket) => {
            logger.info("Socket connected", { socketId: socket.id });

            socket.on("disconnect", (reason) => {
                logger.info("Socket disconnected", { socketId: socket.id, reason });
            });
        });
    }

    #setupRoutes() {
        const animalRepository = new AnimalRepository(AnimalData);
        const sensorRepository = new SensorRepository(SensorData);
        const alertRepository = new AlertRepository(AlertData);

        const animalService = new AnimalService(animalRepository, sensorRepository);
        const animalController = new AnimalController(animalService);
        const animalValidator = new AnimalValidator();
        const animalRoutes = new AnimalRoutes(animalController, animalValidator);

        const sensorService = new SensorService(sensorRepository, animalRepository, alertRepository);
        const sensorController = new SensorController(sensorService);
        const sensorValidator = new SensorValidator();
        const sensorRoutes = new SensorRoutes(sensorController, sensorValidator);

        const alertService = new AlertService(alertRepository);
        const alertController = new AlertController(alertService);
        const alertValidator = new AlertValidator();
        const alertRoutes = new AlertRoutes(alertController, alertValidator);

        const authRoutes = new AuthRoutes();
        const aiRoutes = new AIRoutes();

        // Liveness health-check endpoint
        this.#app.get(["/", "/health"], (req, res) => {
            res.json({
                status: "success",
                message: "MAVIS backend running",
                data: {
                    service: "MAVIS backend",
                    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
                    connectedDatabase: mongoose.connection.name,
                },
            });
        });

        // Feature API Routes
        this.#app.use("/api/animals", animalRoutes.getRouter());
        this.#app.use("/api/sensor", sensorRoutes.getRouter());
        this.#app.use("/api/sensors", sensorRoutes.getRouter());
        this.#app.use("/api/alerts", alertRoutes.getRouter());
        this.#app.use("/api/auth", authRoutes.getRouter());
        this.#app.use("/api/ai", aiRoutes.getRouter());
    }

    #setupErrorHandling() {
        this.#app.use(globalErrorHandler);
    }
}

/**
 * Creates the configured Application instance.
 * @returns {{ app: import("express").Express, httpServer: import("http").Server, io: import("socket.io").Server }}
 */
export const createApp = () => {
    const application = new Application();
    return {
        app: application.app,
        httpServer: application.httpServer,
        io: application.io,
    };
};

export default Application;
