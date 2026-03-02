// backend/repositories/sensor.repository.js

// Pattern Used:

// Repository Pattern - Abstracts data access logic and provides a clean API for the service layer.
// Singleton Pattern - Ensures a single instance of the repository is used throughout the application, promoting consistency and resource efficiency.

import SensorData from "../models/sensor.model";

class SensorRepository {
    async create(data) {
        return await SensorData.create(data);
    }

    async findLatestByAnimal(animalId) {
        return await SensorData.findOne({ animalId }).sort({ timestamp: -1 });
    }

    async findByRange(animalId, from, to) {
        return await SensorData.find({
            animalId,
            timestamp: { $gte: from, $lte: to },
        }).sort({ timestamp: -1 });
    }
}

export default new SensorRepository();  // Singleton instance of the repository

