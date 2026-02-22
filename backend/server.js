import express from "express";
import cors from "cors";                // Middleware for enabling CORS (Cross-Origin Resource Sharing)
import { createServer } from "http";    // Built-in Nodejs module for creating HTTP servers
import { Server } from "socket.io";     // Library for real-time web applications
import corsOptions from "./middlewares/cors.js";     // Custom CORS middleware
import dotenv from "dotenv";             // Library for loading environment variables from .env file
import mongoose from "mongoose";            // MongoDB ODM library
import connectDB from "./config/db.js";     // Function to connect to MongoDB

dotenv.config();    // Load environment variables from .env file
const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors(corsOptions));     // Enable CORS with specified options
app.use(express.json());        // Middleware to parse incoming JSON requests

connectDB();    // Connect to MongoDB database

const httpServer = createServer(app);   // Create an HTTP server using the Express app

const io = new Server(httpServer, {     // Initialize Socket.IO server
    cors: corsOptions,
});

io.on("connection", (socket) => {
    // Every client gets a unique socket.id automatically
    const clientId = socket.id;
    const clientIp = socket.handshake.address;

    console.log(`\n--- NEW CONNECTION ---`);
    console.log(`ID: ${clientId}`);
    console.log(`IP: ${clientIp}`);
    console.log(`Total Active Clients: ${io.engine.clientsCount}`);

    // Listen for disconnection
    socket.on("disconnect", (reason) => {
        console.log(`\n--- CLIENT DISCONNECTED ---`);
        console.log(`ID: ${clientId}`);
        console.log(`Reason: ${reason}`);
        console.log(`Remaining Clients: ${io.engine.clientsCount}`);
    });
});

app.get("/", (req, res) => {
    res.json({
        status: "active",
        message: "MAVIS backend running",
        database:
            mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
