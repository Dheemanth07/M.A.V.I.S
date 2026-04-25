/**
 * MAVIS Server Entry Point
 * Initializes Express, Socket.io, Database connections, and Domain wiring.
 */

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";

import corsOptions from "./middlewares/cors.js";
import connectDB from "./config/db.js";
import globalErrorHandler from "./middlewares/error.middleware.js";

// --- Domain Imports ---
import Animal from "./models/animal.model.js";
import AnimalRepository from "./repositories/animal.repository.js";
import AnimalService from "./services/animal.service.js";
import AnimalController from "./controllers/animal.controller.js";
import AnimalValidator from "./validators/animal.validator.js";
import AnimalRoutes from "./routes/animal.routes.js";

import SensorData from "./models/sensor.model.js";
import SensorRepository from "./repositories/sensor.repository.js";
import SensorService from "./services/sensor.service.js";
import SensorController from "./controllers/sensor.controller.js";
import SensorValidator from "./validators/sensor.validator.js"; // Assuming you wrapped your schema in a class!
import SensorRoutes from "./routes/sensor.routes.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

/* -------------------- Core Middlewares -------------------- */

app.use(cors(corsOptions));
app.use(express.json());

/* -------------------- Socket.IO Setup -------------------- */

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: corsOptions });

// Make Socket.IO accessible in controllers via req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
    console.log(`\n--- NEW CONNECTION: ${socket.id} ---`);

    socket.on("disconnect", (reason) => {
        console.log(`--- CLIENT DISCONNECTED: ${socket.id} (${reason}) ---`);
    });
});

/* -------------------- Domain Wiring (Dependency Injection) -------------------- */

// 1. Animal Domain Wiring
const animalRepository = new AnimalRepository(Animal);
const animalService = new AnimalService(animalRepository);
const animalController = new AnimalController(animalService);
const animalValidator = new AnimalValidator();
const animalRoutes = new AnimalRoutes(animalController, animalValidator);

// 2. Sensor Domain Wiring
const sensorRepository = new SensorRepository(SensorData);
// Inject BOTH repositories into SensorService so it can verify the animal exists!
const sensorService = new SensorService(sensorRepository, animalRepository);
const sensorController = new SensorController(sensorService);
const sensorValidator = new SensorValidator();
const sensorRoutes = new SensorRoutes(sensorController, sensorValidator);

/* -------------------- Routes -------------------- */

// Health Check
app.get("/", (req, res) => {
    res.json({
        status: "active",
        message: "MAVIS backend running",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        connected_DB: mongoose.connection.name,
    });
});

// API Routes
app.use("/api/animals", animalRoutes.getRouter());
app.use("/api/sensor", sensorRoutes.getRouter());

/* -------------------- Error Handling -------------------- */

// Must be the last middleware!
app.use(globalErrorHandler);

/* -------------------- Server Startup -------------------- */

const startServer = async () => {
    try {
        // Connect to DB first
        await connectDB();

        // Start server ONLY after DB is connected
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (err) {
        console.error("Failed to start server:", err.message);
        process.exit(1);
    }
};

startServer();