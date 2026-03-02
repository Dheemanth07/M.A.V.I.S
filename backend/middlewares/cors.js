/**
 * Configuration for Cross-Origin Resource Sharing (CORS).
 * * CORS is a security feature that allows or restricts resources on a web page
 * to be requested from another domain outside the domain from which the first resource was served.
 * * In this project, it allows your frontend (likely on a different port)
 * to securely communicate with this Express backend.
 */
import cors from "cors";

/**
 * @type {import('cors').CorsOptions}
 * corsOptions defines the rules for how external clients can interact with this API.
 */
const corsOptions = {
    /**
     * Origin defines which domains are allowed to access your API.
     * "*" means all origins are allowed (Useful for development).
     * For production, you would change this to your specific frontend URL.
     */
    origin: "*",

    /**
     * Methods defines the HTTP verbs allowed when accessing the resource.
     * Common verbs for Mavis: GET (Fetch data), POST (Create data), PUT (Update), DELETE.
     */
    methods: ["GET", "POST", "PUT", "DELETE"],

    /**
     * Credentials allows the browser to send cookies or authorization headers
     * across different domains.
     */
    credentials: true,
};

export default corsOptions;
