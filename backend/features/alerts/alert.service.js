import mavisEvents, { EVENTS } from "../../config/events.js";
import { evaluateHealth } from "../health-engine/healthEngine.service.js";

class AlertService {
    /**
     * @param {import("./alert.repository.js").default} alertRepository 
     */
    constructor(alertRepository) {
        this.alertRepository = alertRepository;

        this.setupEventListeners();
    }

    setupEventListeners() {
        mavisEvents.on(EVENTS.SENSOR_DATA_RECEIVED, async ({ animalId, payload }) => {
            try {
                // 1. Run the raw data through the Health Engine
                const healthReport = evaluateHealth(payload);

                // 2. If there are alerts, process and save them
                if (healthReport.mergedAlerts && healthReport.mergedAlerts.length > 0) {
                    await this.processNewAlerts(animalId, healthReport.mergedAlerts);

                    // Optional: If you want real-time UI updates later, 
                    // you can trigger your Socket.io emit right here!
                }
            } catch (error) {
                // Background errors won't crash the server, but we should log them
                console.error(`Background Alert Processing Failed for Animal ${animalId}:`, error);
            }
        });
    }

    /**
     * Takes the alerts array from the Health Engine and saves them to the DB.
     */
    async processNewAlerts(animalId, activeAlerts) {
        if (!activeAlerts || activeAlerts.length === 0) {
            return [];
        }

        // Map the Health Engine output to match the Mongoose Schema
        const alertsToInsert = activeAlerts.map(alert => ({
            animalId,
            type: alert.type,
            severity: alert.severity,
            message: alert.message,
            metric: alert.metric,
            value: alert.value,
            status: "active"
        }));

        return await this.alertRepository.createMany(alertsToInsert);
    }

    async getActiveAlerts() {
        return await this.alertRepository.findActiveAlerts();
    }

    async getAlertsByAnimal(animalId) {
        return await this.alertRepository.findByAnimalId(animalId);
    }

    async updateStatus(alertId, newStatus) {
        const updatedAlert = await this.alertRepository.updateStatus(alertId, newStatus);

        if (!updatedAlert) {
            throw new Error("Alert not found"); // Handled by controller/AppError
        }

        return updatedAlert;
    }
}

export default AlertService;