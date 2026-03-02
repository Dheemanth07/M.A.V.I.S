import SensorData from "../models/sensor.model";

class SensorRepository {
    async saveSensorData(data) {
        return await SensorData.create(data);
    }

    async getSensorData(animalId) {
        return await SensorData.findOne({ animalId }).sort({ timestamp: -1 });
    }

    async getAnimalHistory(animalId, from, to) {
        return await SensorData.find({
            animalId,
            timestamp: { $gte: from, $lte: to },
        }).sort({ timestamp: -1 });
    }
}

export default new SensorRepository();
