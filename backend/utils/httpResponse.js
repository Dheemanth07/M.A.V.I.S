/**
 * @file Small helpers for consistent HTTP JSON responses.
 */

export const sendSuccess = (res, statusCode, data, message = "Success") => {
    res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
};

export const sendMessage = (res, statusCode, message, data = null) => {
    res.status(statusCode).json({
        status: "success",
        message,
        ...(data !== null && { data }),
    });
};
