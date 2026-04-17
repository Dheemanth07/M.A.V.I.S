/**
 * Joi Validation Schema: sensorSchema
 * Defines the data contract for incoming sensor payloads.
 */
import Joi from "joi";

/**
 * @type {Joi.ObjectSchema}
 */
export const sensorSchema = Joi.object({
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
