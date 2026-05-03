/**
 * @file Joi validation for animal request bodies.
 */
import Joi from 'joi';

/**
 * Validates payloads before they reach the animal controller.
 */
class AnimalValidator {
    /**
     * Builds the reusable Joi schema.
     */
    constructor() {
        this.schema = Joi.object({
            name: Joi.string().required(),
            species: Joi.string().required(),
            breed: Joi.string().optional(),
            age: Joi.number().min(0).optional(),
            weight: Joi.number().min(0).optional(),
            healthStatus: Joi.string().valid('healthy', 'warning', 'critical'),
            location: Joi.object({
                lat: Joi.number(),
                lng: Joi.number()
            }),
            isActive: Joi.boolean()
        });
    }

    /**
     * Express middleware for animal create/update payloads.
     *
     * @param {import("express").Request} req - Express request.
     * @param {import("express").Response} res - Express response.
     * @param {import("express").NextFunction} next - Next middleware callback.
     * @returns {void}
     */
    validate = (req, res, next) => {
        const { error } = this.schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        next();
    };
}

export default AnimalValidator;
