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
        // Temperature in Celsius [30-45]
        temperature: Joi.number().min(30).max(45).required().messages({
            "number.min": "Temperature is too low",
            "number.max": "Temperature is too high",
        }),

        heartRate: Joi.number().min(30).max(200).optional(),
    }).required(),

    behavior: Joi.object({
        motion: Joi.string().required(),
    }).required(),

    device: Joi.object({
        batteryLevel: Joi.number().min(0).max(100).optional(),
    }).optional(),

    // Ensures the timestamp is not in the future
    timestamp: Joi.date().max("now").required(),
});
