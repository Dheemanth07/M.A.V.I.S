/**
 * @file Express route definitions for authentication.
 */
import express from "express";
import { authController as defaultAuthController } from "./auth.controller.js";

export class AuthRoutes {
    #controller;
    #router;

    /**
     * @param {import("./auth.controller.js").AuthController} [controller=defaultAuthController]
     */
    constructor(controller = defaultAuthController) {
        this.#controller = controller;
        this.#router = express.Router();
        this.#initializeRoutes();
    }

    #initializeRoutes() {
        this.#router.post("/register", this.#controller.register);
        this.#router.post("/login", this.#controller.login);
        this.#router.get("/profile/:id", this.#controller.getProfile);
        this.#router.put("/profile/:id", this.#controller.updateProfile);
        this.#router.put("/password/:id", this.#controller.updatePassword);
    }

    getRouter() {
        return this.#router;
    }
}

const defaultAuthRoutes = new AuthRoutes();
export const authRoutes = defaultAuthRoutes.getRouter();
export default defaultAuthRoutes.getRouter();
