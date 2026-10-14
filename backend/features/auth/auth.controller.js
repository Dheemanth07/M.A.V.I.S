/**
 * @file Express handlers for authentication and user preferences.
 */
import { sendSuccess } from "../../utils/httpResponse.js";
import { authService as defaultAuthService } from "./auth.service.js";

export class AuthController {
    #service;

    /**
     * @param {import("./auth.service.js").AuthService} [service=defaultAuthService]
     */
    constructor(service = defaultAuthService) {
        this.#service = service;
    }

    register = async (req, res, next) => {
        try {
            const result = await this.#service.register(req.body);
            sendSuccess(res, 201, result, "Registration successful");
        } catch (err) {
            next(err);
        }
    };

    login = async (req, res, next) => {
        try {
            const result = await this.#service.login(req.body);
            sendSuccess(res, 200, result, "Login successful");
        } catch (err) {
            next(err);
        }
    };

    getProfile = async (req, res, next) => {
        try {
            const profile = await this.#service.getProfile(req.params.id);
            sendSuccess(res, 200, { user: profile }, "Profile fetched successfully");
        } catch (err) {
            next(err);
        }
    };

    updateProfile = async (req, res, next) => {
        try {
            const updated = await this.#service.updateProfile(req.params.id, req.body);
            sendSuccess(res, 200, { user: updated }, "Profile preferences updated successfully");
        } catch (err) {
            next(err);
        }
    };

    updatePassword = async (req, res, next) => {
        try {
            await this.#service.updatePassword(req.params.id, req.body);
            sendSuccess(res, 200, null, "Password updated successfully");
        } catch (err) {
            next(err);
        }
    };
}

export const authController = new AuthController();
export default AuthController;
