/**
 * @file Joi validation for sensor request bodies.
 */
import Joi from "joi";
import { SENSOR_TEMPERATURE_MAX } from "../../config/constants.js";

/**
 * Validates sensor readings before they are stored.
 */
class SensorValidator {
  /**
   * Builds the reusable Joi schema.
   */
  constructor() {
    this.schema = Joi.object({
      animalId: Joi.string().hex().length(24).required().messages({
        "string.hex": "animalId must be a valid MongoDB ObjectId",
        "string.length": "animalId must be a valid MongoDB ObjectId",
      }),

      physiology: Joi.object({
        temperature: Joi.number().min(30).max(SENSOR_TEMPERATURE_MAX).required(),
        respiratoryRate: Joi.number().min(5).max(60).required(),
        bloodOxygen: Joi.number().min(70).max(100).required(),
      }).required(),

      behavior: Joi.object({
        motion: Joi.boolean().required(),
        steps: Joi.number().optional(),
        lyingDown: Joi.boolean().optional(),
      }).required(),

      environment: Joi.object({
        ambientTemperature: Joi.number().optional(),
        humidity: Joi.number().min(0).max(100).optional(),
        aqi: Joi.number().optional(),
      }).optional(),

      location: Joi.object({
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        zone: Joi.string().optional(),
      }).optional(),

      device: Joi.object({
        batteryLevel: Joi.number().min(0).max(100).optional(),
        signalStrength: Joi.number().optional(),
      }).optional(),

      timestamp: Joi.date().max("now").optional(),
    });
  }

  /**
   * Express middleware for sensor create payloads.
   *
   * @param {import("express").Request} req - Express request.
   * @param {import("express").Response} res - Express response.
   * @param {import("express").NextFunction} next - Next middleware callback.
   * @returns {void}
   */
  validate = (req, res, next) => {
    const { error } = this.schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message.replace(/"/g, ""))
        .join(", ");

      return res.status(400).json({ error: errorMessage });
    }

    next();
  };
}

export default SensorValidator;
