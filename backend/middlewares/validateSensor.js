import { sensorSchema } from "../schemas/sensor.schema.js";

const validateSensor = (req, res, next) => {
    // 1. Validate the body against the schema
    // abortEarly: false allows Joi to find ALL errors, not just stop at the first one
    const { error } = sensorSchema.validate(req.body, { abortEarly: false });

    if (error) {
        // 2. Map the error details into a readable string
        const errorMessage = error.details
            .map((detail) => detail.message.replace(/"/g, ""))
            .join(", ");

        return res.status(400).json({ error: errorMessage });
    }

    // 3. If everything is fine, move to the Controller
    next();
};

export default validateSensor;
