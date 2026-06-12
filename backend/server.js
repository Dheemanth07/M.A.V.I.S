/**
 * @file Application entry point.
 *
 * Connects dependencies and starts the HTTP listener.
 */

import dotenv from "dotenv";

import connectDB from "./config/db.js";
import globalErrorHandler from "./middlewares/error.middleware.js";
import logger from "./utils/logger.js";

// --- Feature Imports ---
import AnimalData from "./features/animals/animal.model.js";
import AnimalRepository from "./features/animals/animal.repository.js";
import AnimalService from "./features/animals/animal.service.js";
import AnimalController from "./features/animals/animal.controller.js";
import AnimalValidator from "./features/animals/animal.validator.js";
import AnimalRoutes from "./features/animals/animal.routes.js";

import SensorData, {
    ensureSensorTimeSeriesCollection,
} from "./features/sensors/sensor.model.js";
import SensorRepository from "./features/sensors/sensor.repository.js";
import SensorService from "./features/sensors/sensor.service.js";
import SensorController from "./features/sensors/sensor.controller.js";
import SensorValidator from "./features/sensors/sensor.validator.js";
import SensorRoutes from "./features/sensors/sensor.routes.js";

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors(corsOptions));
app.use(express.json());

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

/**
 * Basic liveness endpoint with database connection state.
 */
app.get("/", (req, res) => {
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

app.use("/api/animals", animalRoutes.getRouter());
app.use("/api/sensor", sensorRoutes.getRouter());

app.use(globalErrorHandler);

/**
 * Connects to MongoDB before accepting HTTP requests.
 *
 * @returns {Promise<void>}
 */
const startServer = async () => {
    try {
        await connectDB();
        await ensureSensorTimeSeriesCollection();

        httpServer.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (err) {
        logger.error("Failed to start server", err);
        process.exit(1);
    }
};

startServer();
