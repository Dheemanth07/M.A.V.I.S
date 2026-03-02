/**
 * Joi Validation Schema: sensorSchema
 * * Purpose: Defines the strict "Data Contract" for incoming sensor readings.
 * Any request body that does not match this structure will be rejected by the
 * validateSensor middleware before reaching the controller.
 * * Use Case: Ensures that physiological and environmental data from animal
 * wearable devices are within realistic, biological, and technical bounds.
 */
import Joi from "joi";

/**
 * @type {Joi.ObjectSchema}
 * Schema definition for a complete sensor payload.
 */
export const sensorSchema = Joi.object({
    /**
     * Unique identifier for the animal.
     * Must be a string (e.g., UUID or custom ID).
     */
    animalId: Joi.string().required(),

    /**
     * Physiological Data: Vital signs.
     * Nested object validation ensures all sub-fields exist and meet thresholds.
     */
    physiology: Joi.object({
        /**
         * Temperature in Celsius.
         * Range [30-45] covers most livestock/pets; custom messages provide
         * better feedback for frontend debugging.
         */
        temperature: Joi.number().min(30).max(45).required().messages({
            "number.min": "Temperature is too low",
            "number.max": "Temperature is too high",
        }),

        /**
         * heartRate in BPM.
         * Optional, but if provided, must be within a realistic biological range.
         */
        heartRate: Joi.number().min(30).max(200).optional(),
    }).required(),

    /**
     * Behavioral Data: Physical activity.
     */
    behavior: Joi.object({
        // Describes current movement status (e.g., "running", "idle", "grazing")
        motion: Joi.string().required(),
    }).required(),

    /**
     * Device Metadata: Hardware health.
     */
    device: Joi.object({
        // Battery percentage must be between empty (0) and full (100)
        batteryLevel: Joi.number().min(0).max(100).optional(),
    }).optional(),

    /**
     * Temporal Data:
     * Ensures the record is not backdated to the future.
     * Accepts ISO strings or Date objects.
     */
    timestamp: Joi.date().max("now").required(),
});
