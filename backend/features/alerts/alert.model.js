import mongoose from "mongoose";
import { SEVERITY_LEVELS } from "../health-engine/constants/riskLevels.js";

const alertSchema = new mongoose.Schema(
    {
        animalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Animal_Data",
            required: [true, "Animal ID is required to log an alert"],
            index: true // Speeds up queries for a specific animal's dashboard
        },
        type: {
            type: String,
            required: true,
            trim: true
        },
        severity: {
            type: String,
            enum: Object.values(SEVERITY_LEVELS),
            required: true
        },
        message: {
            type: String,
            required: true
        },
        metric: {
            type: String,
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["active", "acknowledged", "resolved"],
            default: "active",
            index: true // Speeds up queries for "Show me all active alerts"
        }
    },
    {
        timestamps: true // Automatically gives us createdAt and updatedAt
    }
);

const Alert = mongoose.model("Alert", alertSchema);
export default Alert;