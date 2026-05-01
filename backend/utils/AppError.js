/**
 * @file Small HTTP-aware error class used by services and controllers.
 */

/**
 * Error type that carries an HTTP status code for the global error handler.
 */
class AppError extends Error {
    /**
     * @param {string} message - Message returned to the client.
     * @param {number} statusCode - HTTP status code for the response.
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;
