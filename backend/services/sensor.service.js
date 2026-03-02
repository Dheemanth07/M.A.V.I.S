// backend/services/sensor.service.js

// Pattern Used:

// Dependency Injection - The service class receives the repository as a dependency, allowing for better modularity and 
//                        testability. This promotes loose coupling between the service and repository layers, making it easier to swap out 
//                        implementations or mock dependencies during testing.

// Service Layer Pattern - Encapsulates business logic and coordinates interactions between the repository and 
//                         other parts of the application, such as controllers or real-time communication (e.g., Socket.IO). 
//                         This separation of concerns enhances maintainability and scalability of the application.

class SensorService {
    #repository;

    constructor(repository) {
        this.#repository = repository;
    }

    async createSensorData(data, io) {
        const repository = this.#repository;
        const sensorData = await repository.create(data);

        // Business Logic
        if (sensorData.physiology.temperature > 40) {
            io.emit("alert", {
                animalId: sensorData.animalId,
                message: "High temperature detected!",
                timestamp: sensorData.timestamp,
            });
        }

        if (sensorData.device.batteryLevel < 20) {
            io.emit("alert", {
                animalId: sensorData.animalId,
                message: "Low battery level!",
                timestamp: sensorData.timestamp,
            });
        }

        return sensorData;
    }

    async getLatest(animalId) {
        const repository = this.#repository;

        return await repository.findLatestByAnimal(animalId);
    }

    async getLatestByRange(animalId, from, to) {
        const repository = this.#repository;

        return await repository.findByRange(animalId, from, to);
    }
}

export default SensorService;