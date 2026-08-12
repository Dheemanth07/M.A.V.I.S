import mongoose from "mongoose";
import AppError from "../../utils/AppError.js";
import Animal from "../animals/animal.model.js";

class AlertController {
    /**
     * @param {import("./alert.service.js").default} alertService 
     */
    constructor(alertService) {
        this.alertService = alertService;
    }

    /**
     * GET /api/alerts/active
     * Fetches all unresolved alerts for the main farm dashboard (filtered by user ownership).
     */
    getActiveAlerts = async (req, res, next) => {
        try {
            let alerts = [];
            if (req.user && req.user.role !== 'admin' && req.user.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
                const userAnimals = await Animal.find({ owner: req.user.id }).select('_id');
                const animalIds = userAnimals.map(a => a._id);
                alerts = await this.alertService.getActiveAlertsForAnimals(animalIds);
            } else if (req.user && req.user.role !== 'admin') {
                alerts = [];
            } else {
                alerts = await this.alertService.getActiveAlerts();
            }

            res.status(200).json({
                status: "success",
                results: alerts.length,
                data: { alerts }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * GET /api/alerts/animal/:animalId
     * Fetches the complete alert history for a specific animal.
     */
    getAnimalAlerts = async (req, res, next) => {
        try {
            const { animalId } = req.params;
            if (req.user && req.user.role !== 'admin') {
                const animal = await Animal.findById(animalId);
                if (!animal || (animal.owner && String(animal.owner) !== String(req.user.id))) {
                    return res.status(403).json({ status: "fail", message: "Access denied. Animal belongs to another account." });
                }
            }
            const alerts = await this.alertService.getAlertsByAnimal(animalId);

            res.status(200).json({
                status: "success",
                results: alerts.length,
                data: { alerts }
            });
        } catch (error) {
            next(error);
        }
    };

    /**
     * PATCH /api/alerts/:alertId/status
     * Updates an alert (e.g., vet marks a critical alert as "acknowledged").
     */
    updateAlertStatus = async (req, res, next) => {
        try {
            const { alertId } = req.params;
            const { status } = req.body;

            const updatedAlert = await this.alertService.updateStatus(alertId, status);

            res.status(200).json({
                status: "success",
                message: `Alert successfully marked as ${status}`,
                data: { alert: updatedAlert }
            });
        } catch (error) {
            if (error.message === "Alert not found") {
                return next(new AppError("No alert found with that ID", 404));
            }
            next(error);
        }
    };
}

export default AlertController;