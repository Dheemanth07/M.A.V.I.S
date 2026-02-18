import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express(); // Create an Express application
const server = http.createServer(app); // Create an HTTP server using the Express app

const io = new Server(server, {
    // Create a WebSocket server attached to HTTP server
    cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 5000;

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "MAVIS Backend Running" });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
