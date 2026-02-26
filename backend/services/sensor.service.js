import SensorData from "../models/sensor.model";

export const saveSensorData = async (data) => {
    try {
        return await SensorData.create(data);
    } catch (err) {
        console.log(err);
    }
};

export const getSensorData = async (animalId) => {
    try {
        return await SensorData.findOne({ animalId }).sort({ timestamp: -1 });
    } catch (err) {
        console.log(err);
    }
};

export const getAnimalHistory = async (animalId, from, to) => {
    try {
        return await SensorData.find({
            animalId,
            timestamp: { $gte: new Date(from), $lte: new Date(to) },
        }).sort({ timestamp: -1 });
    } catch (err) {
        console.log(err);
    }
};
