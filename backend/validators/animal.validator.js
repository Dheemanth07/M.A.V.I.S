import Joi from 'joi';

class AnimalValidator {
    constructor() {
        this.schema = Joi.object({
            name: Joi.string().required(),
            species: Joi.string().required(),
            breed: Joi.string().optional(),
            age: Joi.number().min(0).optional(),
            weight: Joi.number().optional(),
            healthStatus: Joi.string().valid('healthy', 'warning', 'critical'),
            location: Joi.object({
                lat: Joi.number(),
                lng: Joi.number()
            }),
            isActive: Joi.boolean()
        });
    }

    validate = (req, res, next) => {
        const { error } = this.schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        next();
    };
}

export default AnimalValidator;