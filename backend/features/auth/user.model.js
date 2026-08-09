import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "User name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        vetContact: {
            type: String,
            default: "",
            trim: true,
        },
        alertSettings: {
            soundAlerts: { type: Boolean, default: true },
            tempSensitivity: { type: Number, default: 1.0 },
            hrThreshold: { type: Number, default: 100 },
        },
        collarSettings: {
            syncInterval: { type: Number, default: 5 },
            motionSensitivity: { type: String, enum: ["high", "standard", "low"], default: "standard" },
        },
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);
