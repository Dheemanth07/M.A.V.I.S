/**
 * @file Express route definitions for AI insights.
 */
import express from "express";
import { aiController as defaultAiController } from "./ai.controller.js";

export class AIRoutes {
    #controller;
    #router;

    /**
     * @param {import("./ai.controller.js").AIController} [controller=defaultAiController]
     */
    constructor(controller = defaultAiController) {
        this.#controller = controller;
        this.#router = express.Router();
        this.#initializeRoutes();
    }

    #initializeRoutes() {
        this.#router.get("/:animalId", this.#controller.getAIInsight);
    }

    getRouter() {
        return this.#router;
    }
}

const defaultAiRoutes = new AIRoutes();
export default defaultAiRoutes.getRouter();
