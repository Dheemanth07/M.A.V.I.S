import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import connectDB from "./config/db.js";

connectDB();
dotenv.config();
console.log("MONGO_URI:", process.env.MONGO_URI);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "MAVIS Backend Running" });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
