/**
 * @file Global Express error middleware.
 */

/**
 * Sends a consistent error response and logs enough context for debugging.
 *
 * @param {Error & {statusCode?: number, status?: string}} err - Error raised by a route.
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @param {import("express").NextFunction} next - Express next callback.
 * @returns {void}
 */
const globalErrorHandler = (err, req, res, next) => {
    const isDev = process.env.NODE_ENV === "development";

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    console.error(`\n--- [${err.status.toUpperCase()}] ERROR LOG ---`);
    console.error(`Method: ${req.method} | URL: ${req.originalUrl}`);
    console.error(`Message: ${err.message}`);
    if (isDev) console.error(`Stack: ${err.stack}`);
    console.error("-------------------------------\n");

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message || "An unexpected error occurred",
        ...(isDev && { stack: err.stack }),
    });
};

export default globalErrorHandler;
