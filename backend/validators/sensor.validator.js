/**
 * SensorValidator Class
 * Validates incoming HTTP requests for animal sensor data.
 */
import Joi from "joi";

class SensorValidator {
  constructor() {
    // We put your exact schema inside the constructor!
    this.schema = Joi.object({
      animalId: Joi.string().required(),

      physiology: Joi.object({
        temperature: Joi.number().min(30).max(45).required(),
        heartRate: Joi.number().min(30).max(200).required(),
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
   * Express middleware to validate req.body against the schema
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