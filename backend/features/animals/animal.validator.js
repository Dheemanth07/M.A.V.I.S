/**
 * @file Joi validation for animal request bodies and route params.
 */
import Joi from "joi";
import AppError from "../../utils/AppError.js";

/**
 * Validates payloads before they reach the animal controller.
 */
class AnimalValidator {
    /**
     * Builds reusable Joi schemas.
     */
    constructor() {
        this.createSchema = Joi.object({
            name: Joi.string().trim().required(),
            species: Joi.string().trim().required(),
            breed: Joi.string().trim().optional(),
            age: Joi.number().min(0).optional(),
            weight: Joi.number().min(0).optional(),
            healthStatus: Joi.string().valid("healthy", "warning", "critical"),
            location: Joi.object({
                lat: Joi.number(),
                lng: Joi.number(),
            }).optional(),
            isActive: Joi.boolean().optional(),
        });

        this.updateSchema = this.createSchema
            .fork(["name", "species"], (schema) => schema.optional())
            .min(1);

        this.objectIdParamSchema = Joi.object({
            id: Joi.string().hex().length(24).required().messages({
                "string.hex": "id must be a valid MongoDB ObjectId",
                "string.length": "id must be a valid MongoDB ObjectId",
            }),
        });
    }

    #validateSchema(schema, source, next) {
        const { error } = schema.validate(source, { abortEarly: false });

        if (error) {
            const errorMessage = error.details
                .map((detail) => detail.message.replace(/"/g, ""))
                .join(", ");

            return next(new AppError(errorMessage, 400));
        }

        next();
    }

    /**
     * Express middleware for animal create payloads.
     */
    validateCreate = (req, res, next) => {
        this.#validateSchema(this.createSchema, req.body, next);
    };

    /**
     * Express middleware for animal update payloads.
     */
    validateUpdate = (req, res, next) => {
        this.#validateSchema(this.updateSchema, req.body, next);
    };

    /**
     * Express middleware for animal ObjectId route params.
     */
    validateIdParam = (req, res, next) => {
        this.#validateSchema(this.objectIdParamSchema, req.params, next);
    };
}

export default AnimalValidator;
