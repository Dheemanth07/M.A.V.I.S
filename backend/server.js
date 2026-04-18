/**
 * MAVIS Server Entry Point
 * Initializes Express, Socket.io, and Database connections.
 */

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import mongoose from "mongoose";

import corsOptions from "./middlewares/cors.js";
import connectDB from "./config/db.js";
import sensorRoutes from "./routes/sensor.routes.js";
import globalErrorHandler from "./middlewares/error.middleware.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

/* -------------------- Core Middlewares -------------------- */

app.use(cors(corsOptions));
app.use(express.json());

/* -------------------- Socket.IO Setup -------------------- */

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: corsOptions });

// Make Socket.IO accessible in controllers
app.set("io", io);

io.on("connection", (socket) => {
    console.log(`\n--- NEW CONNECTION: ${socket.id} ---`);

    socket.on("disconnect", (reason) => {
        console.log(`--- CLIENT DISCONNECTED: ${socket.id} (${reason}) ---`);
    });
});

/* -------------------- Routes -------------------- */

// Health Check
app.get("/", (req, res) => {
    res.json({
        status: "active",
        message: "MAVIS backend running",
        database:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        connected_DB: mongoose.connection.name,
    });
});

// API Routes
app.use("/api", sensorRoutes);

/* -------------------- Error Handling -------------------- */

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