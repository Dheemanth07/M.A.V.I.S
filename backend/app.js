/**
 * @file Express application composition.
 *
 * Builds the HTTP app, Socket.IO server, and feature routes without starting
 * the process listener.
 */

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";

import corsOptions from "./middlewares/cors.js";
import globalErrorHandler from "./middlewares/error.middleware.js";
import { extractUser } from "./middlewares/auth.middleware.js";
import logger from "./utils/logger.js";

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

dotenv.config({ quiet: true });

/**
 * Creates the configured Express app and backing HTTP server.
 *
 * @returns {{ app: import("express").Express, httpServer: import("http").Server, io: import("socket.io").Server }}
 */
export const createApp = () => {
    const app = express();

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(extractUser);

    const httpServer = createServer(app);
    const io = new Server(httpServer, { cors: corsOptions });

    // Controllers pull this from req.app when they need to emit realtime events.
    app.set("io", io);

    io.on("connection", (socket) => {
        logger.info("Socket connected", { socketId: socket.id });

        socket.on("disconnect", (reason) => {
            logger.info("Socket disconnected", { socketId: socket.id, reason });
        });
    });

    const animalRepository = new AnimalRepository(AnimalData);
    const sensorRepository = new SensorRepository(SensorData);
    const animalService = new AnimalService(animalRepository, sensorRepository);
    const animalController = new AnimalController(animalService);
    const animalValidator = new AnimalValidator();
    const animalRoutes = new AnimalRoutes(animalController, animalValidator);

    const sensorService = new SensorService(sensorRepository, animalRepository);
    const sensorController = new SensorController(sensorService);
    const sensorValidator = new SensorValidator();
    const sensorRoutes = new SensorRoutes(sensorController, sensorValidator);

    app.get("/", (req, res) => {
        res.json({
            status: "active",
            message: "MAVIS backend running",
            database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
            connected_DB: mongoose.connection.name,
        });
    });

    app.use("/api/animals", animalRoutes.getRouter());
    app.use("/api/sensor", sensorRoutes.getRouter());

    app.use(globalErrorHandler);

    return { app, httpServer, io };
};
