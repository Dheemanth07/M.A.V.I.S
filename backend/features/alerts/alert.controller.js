import AppError from "../../utils/AppError.js";

class AlertController {
    /**
     * @param {import("./alert.service.js").default} alertService 
     */
    constructor(alertService) {
        this.alertService = alertService;
    }

    /**
     * GET /api/alerts/active
     * Fetches all unresolved alerts for the main farm dashboard.
     */
    getActiveAlerts = async (req, res, next) => {
        try {
            const alerts = await this.alertService.getActiveAlerts();

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