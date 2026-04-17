/**
 * Middleware: validateSensor
 * Ensures the request body matches the Joi schema before proceeding to the controller.
 */
import { sensorSchema } from "../validators/sensor.schema.js";

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 * @returns {void | import('express').Response}
 */
const validateSensor = (req, res, next) => {
    // abortEarly: false ensures all validation errors are captured at once
    const { error } = sensorSchema.validate(req.body, { abortEarly: false });

    if (error) {
        // Format Joi error details into a clean, comma-separated string
        const errorMessage = error.details
            .map((detail) => detail.message.replace(/"/g, ""))
            .join(", ");

        return res.status(400).json({ error: errorMessage });
    }

    next();
};

export default validateSensor;
