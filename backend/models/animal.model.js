import mongoose from 'mongoose';

const animalSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        species: {
            type: String,
            required: true,
            trim: true
        },

        breed: {
            type: String,
            trim: true
        },

        age: {
            type: Number,
            min: 0
        },

        weight: {
            type: Number
        },

        healthStatus: {
            type: String,
            enum: ['healthy', 'warning', 'critical'],
            default: 'healthy'
        },

        location: {
            lat: Number,
            lng: Number
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Animal = mongoose.model('Animal', animalSchema);

export default Animal;