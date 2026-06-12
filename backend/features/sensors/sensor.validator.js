/**
 * @file Joi validation for sensor request bodies, params, and query strings.
 */
import Joi from "joi";
import { SENSOR_TEMPERATURE_MAX } from "../../config/constants.js";
import AppError from "../../utils/AppError.js";

/**
 * Validates sensor readings before they are stored.
 */
class SensorValidator {
    /**
     * Builds reusable Joi schemas.
     */
    constructor() {
        this.createSchema = Joi.object({
            animalId: Joi.string().hex().length(24).required().messages({
                "string.hex": "animalId must be a valid MongoDB ObjectId",
                "string.length": "animalId must be a valid MongoDB ObjectId",
            }),

            physiology: Joi.object({
                temperature: Joi.number().min(30).max(SENSOR_TEMPERATURE_MAX).required(),
                heartRate: Joi.number().min(20).max(240).required(),
                respiratoryRate: Joi.number().min(5).max(60).required(),
                bloodOxygen: Joi.number().min(70).max(100).required(),
            }).required(),

            behavior: Joi.object({
                motion: Joi.boolean().required(),
                steps: Joi.number().min(0).optional(),
                lyingDown: Joi.boolean().optional(),
            }).required(),

            environment: Joi.object({
                ambientTemperature: Joi.number().optional(),
                humidity: Joi.number().min(0).max(100).optional(),
                aqi: Joi.number().min(0).optional(),
            }).optional(),

            location: Joi.object({
                latitude: Joi.number().min(-90).max(90).optional(),
                longitude: Joi.number().min(-180).max(180).optional(),
                zone: Joi.string().trim().optional(),
            }).optional(),

            device: Joi.object({
                batteryLevel: Joi.number().min(0).max(100).optional(),
                signalStrength: Joi.number().optional(),
            }).optional(),

            timestamp: Joi.date().max("now").optional(),
        });

        this.animalIdParamSchema = Joi.object({
            animalId: Joi.string().hex().length(24).required().messages({
                "string.hex": "animalId must be a valid MongoDB ObjectId",
                "string.length": "animalId must be a valid MongoDB ObjectId",
            }),
        });
    }

    #formatError(error) {
        return error.details
            .map((detail) => detail.message.replace(/"/g, ""))
            .join(", ");
    }

    /**
     * Express middleware for sensor create payloads.
     */
    validate = (req, res, next) => {
        const { error } = this.createSchema.validate(req.body, { abortEarly: false });

        if (error) {
            return next(new AppError(this.#formatError(error), 400));
        }

        next();
    };

    /**
     * Express middleware for routes that contain `animalId`.
     */
    validateAnimalIdParam = (req, res, next) => {
        const { error } = this.animalIdParamSchema.validate(req.params, {
            abortEarly: false,
        });

        if (error) {
            return next(new AppError(this.#formatError(error), 400));
        }

        next();
    };

    /**
     * Express middleware for sensor history query parameters.
     */
    validateHistoryQuery = (req, res, next) => {
        const { from, to } = req.query;

        if (!from || !to) {
            return next(
                new AppError("Missing required query parameters: 'from' and 'to'", 400),
            );
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        if (Number.isNaN(fromDate.getTime())) {
            return next(
                new AppError(
                    `Invalid 'from' date format: ${from}. Use ISO format (e.g., 2026-04-17T10:00:00Z)`,
                    400,
                ),
            );
        }

        if (Number.isNaN(toDate.getTime())) {
            return next(
                new AppError(
                    `Invalid 'to' date format: ${to}. Use ISO format (e.g., 2026-04-17T10:00:00Z)`,
                    400,
                ),
            );
        }

        if (fromDate > toDate) {
            return next(
                new AppError("'from' must be earlier than or equal to 'to'", 400),
            );
        }

        req.validatedQuery = { fromDate, toDate };
        next();
    };
}

export default SensorValidator;
