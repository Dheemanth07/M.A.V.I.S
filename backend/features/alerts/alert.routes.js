import express from "express";

class AlertRoutes {
    /**
     * @param {import("./alert.controller.js").default} alertController 
     * @param {import("./alert.validator.js").default} alertValidator 
     */
    constructor(alertController, alertValidator) {
        this.router = express.Router();
        this.alertController = alertController;
        this.alertValidator = alertValidator;

        this.initializeRoutes();
    }

    initializeRoutes() {
        // Fetch operations
        this.router.get("/active", this.alertController.getActiveAlerts);
        this.router.get("/animal/:animalId", this.alertController.getAnimalAlerts);

        // Update operations
        this.router.patch(
            "/:alertId/status",
            this.alertValidator.validateStatusUpdate,
            this.alertController.updateAlertStatus
        );
    }

    getRouter() {
        return this.router;
    }
}

export default AlertRoutes;