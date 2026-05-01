/**
 * @file CORS settings shared by Express and Socket.IO.
 */
import cors from "cors";

/**
 * Cross-origin policy for local API and realtime clients.
 *
 * @type {import("cors").CorsOptions}
 */
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

export default corsOptions;
