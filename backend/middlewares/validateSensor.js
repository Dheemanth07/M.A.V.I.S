/**
 * Middleware: validateSensor
 * * Acts as a data integrity layer for the /sensors route.
 * It ensures that the incoming request body matches the predefined Joi schema
 * before allowing the request to proceed to the controller.
 */
import { sensorSchema } from "../schemas/sensor.schema.js";

/**
 * Validates the sensor data payload using Joi.
 * * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The next middleware function in the stack.
 * @returns {void | import('express').Response} Returns a 400 response if validation fails, otherwise calls next().
 */
const validateSensor = (req, res, next) => {
    /**
     * Step 1: Validate the request body against the schema.
     * { abortEarly: false } is used to capture ALL validation errors (e.g., missing ID AND invalid temp)
     * rather than stopping at the first mistake found.
     */
    const { error } = sensorSchema.validate(req.body, { abortEarly: false });

    if (error) {
        /**
         * Step 2: Format the Joi error details.
         * Joi provides an array of error objects. We map through them to create a
         * human-readable string, removing extra quotes for a cleaner API response.
         */
        const errorMessage = error.details
            .map((detail) => detail.message.replace(/"/g, ""))
            .join(", ");

        // 400 Bad Request: Indicates the client sent data that doesn't meet the requirements
        return res.status(400).json({ error: errorMessage });
    }

    /**
     * Step 3: Pass control to the next function.
     * If validation passes, the data is guaranteed to be clean for the Controller.
     */
    next();
};

export default validateSensor;
