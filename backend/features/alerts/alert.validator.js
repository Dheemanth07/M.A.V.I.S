import Joi from "joi";
import AppError from "../../utils/AppError.js";

class AlertValidator {
    /**
     * Validates the payload for updating an alert's status.
     */
    validateStatusUpdate(req, res, next) {
        const schema = Joi.object({
            status: Joi.string()
                .valid("active", "acknowledged", "resolved")
                .required()
                .messages({
                    "any.only": "Status must be active, acknowledged, or resolved",
                    "any.required": "Status is required for this update"
                })
        });

        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            return next(new AppError(errorMessages.join(", "), 400));
        }

        next();
    }
}

export default AlertValidator;