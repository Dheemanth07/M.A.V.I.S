import express from 'express';

class AnimalRoutes {
    constructor(animalController, animalValidator) {
        this.router = express.Router();
        this.animalController = animalController;
        this.animalValidator = animalValidator;

        this.initializeRoutes();
    }

    initializeRoutes() {
        this.router.post('/', this.animalValidator.validate, this.animalController.createAnimal);
        this.router.get('/', this.animalController.getAnimals);
        this.router.get('/:id', this.animalController.getAnimal);
        this.router.put('/:id', this.animalValidator.validate, this.animalController.updateAnimal);
        this.router.delete('/:id', this.animalController.deleteAnimal);
        this.router.get('/:id/health', this.animalController.getHealthStatus);
    }

    getRouter() {
        return this.router;
    }
}

export default AnimalRoutes;