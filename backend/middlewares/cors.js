import cors from "cors";

/**
 * @type {import('cors').CorsOptions}
 * Configuration for Cross-Origin Resource Sharing (CORS).
 */
const corsOptions = {
    /**
     * Allowed origins. Set to "*" for development;
     * update to specific domain for production.
     */
    origin: "*",

    /**
     * Allowed HTTP verbs for API interaction.
     */
    methods: ["GET", "POST", "PUT", "DELETE"],

    /**
     * Enable cross-origin cookies and authorization headers.
     */
    credentials: true,
};

export default corsOptions;
