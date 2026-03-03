/**
 * Global Error Handler
 * Centralizes all error responses and handles environment-specific logging.
 */
const globalErrorHandler = (err, req, res, next) => {
    const isDev = process.env.NODE_ENV === "development";

    // Standardize error properties
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    // DEVELOPER LOGGING: Terminal output for debugging
    console.error(`\n--- [${err.status.toUpperCase()}] ERROR LOG ---`);
    console.error(`Method: ${req.method} | URL: ${req.originalUrl}`);
    console.error(`Message: ${err.message}`);
    if (isDev) console.error(`Stack: ${err.stack}`);
    console.error("-------------------------------\n");

    // RESPONSE TO CLIENT: Structured JSON response
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message || "An unexpected error occurred",
        // Spread operator conditionally adds stack trace in development
        ...(isDev && { stack: err.stack }),
    });
};

export default globalErrorHandler;
