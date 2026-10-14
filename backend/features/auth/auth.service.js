/**
 * @file Authentication Business Logic Service
 */
import crypto from "crypto";
import User from "./user.model.js";
import AppError from "../../utils/AppError.js";
import { seedUserHerdIfNeeded } from "../simulation/userSeed.service.js";

export class AuthService {
    #userModel;

    /**
     * @param {Object} [userModel=User]
     */
    constructor(userModel = User) {
        this.#userModel = userModel;
    }

    hashPassword(password) {
        return crypto.pbkdf2Sync(password, "mavis_salt_2026", 1000, 64, "sha512").toString("hex");
    }

    async register({ name, email, password, role }) {
        if (!email || !password || !name) {
            throw new AppError("Name, email, and password are required", 400);
        }

        const existingUser = await this.#userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new AppError("Email is already registered", 400);
        }

        const hashedPassword = this.hashPassword(password);
        const newUser = await this.#userModel.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "user"
        });

        if (newUser.email === 'dheemanth1007@gmail.com') {
            await seedUserHerdIfNeeded(newUser._id);
        }

        return {
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            },
            token: `mock_jwt_token_${newUser._id}`
        };
    }

    async login({ email, password }) {
        if (!email || !password) {
            throw new AppError("Email and password are required", 400);
        }

        const user = await this.#userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new AppError("Invalid email or password", 401);
        }

        const hashedPassword = this.hashPassword(password);
        if (user.password !== hashedPassword) {
            throw new AppError("Invalid email or password", 401);
        }

        if (user.email === 'dheemanth1007@gmail.com') {
            await seedUserHerdIfNeeded(user._id);
        }

        return {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                vetContact: user.vetContact || "",
                alertSettings: user.alertSettings || { soundAlerts: true, tempSensitivity: 1.0, hrThreshold: 100 },
                collarSettings: user.collarSettings || { syncInterval: 5, motionSensitivity: "standard" },
            },
            token: `mock_jwt_token_${user._id}`
        };
    }

    async getProfile(id) {
        const user = await this.#userModel.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            vetContact: user.vetContact || "",
            alertSettings: user.alertSettings,
            collarSettings: user.collarSettings,
        };
    }

    async updateProfile(id, { name, email, vetContact, alertSettings, collarSettings }) {
        const user = await this.#userModel.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        if (name) user.name = name;
        if (email) user.email = email.toLowerCase();
        if (vetContact !== undefined) user.vetContact = vetContact;
        if (alertSettings) user.alertSettings = { ...user.alertSettings, ...alertSettings };
        if (collarSettings) user.collarSettings = { ...user.collarSettings, ...collarSettings };

        await user.save();

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            vetContact: user.vetContact,
            alertSettings: user.alertSettings,
            collarSettings: user.collarSettings,
        };
    }

    async updatePassword(id, { currentPassword, newPassword }) {
        if (!currentPassword || !newPassword) {
            throw new AppError("Current and new passwords are required", 400);
        }
        if (newPassword.length < 6) {
            throw new AppError("New password must be at least 6 characters", 400);
        }

        const user = await this.#userModel.findById(id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const currentHashed = this.hashPassword(currentPassword);
        if (user.password !== currentHashed) {
            throw new AppError("Current password is incorrect", 401);
        }

        user.password = this.hashPassword(newPassword);
        await user.save();
        return true;
    }
}

export const authService = new AuthService();
export default AuthService;
