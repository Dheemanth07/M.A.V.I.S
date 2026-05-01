import AppError from "../utils/AppError.js";

class AnimalController {
    #service;

    constructor(service) {
        this.#service = service;
    }

    createAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const animal = await service.createAnimal(req.body);
            res.status(201).json(animal);
        } catch (err) {
            next(err);
        }
    };

    getAnimals = async (req, res, next) => {
        const service = this.#service;

        try {
            const animals = await service.getAnimals();
            res.status(200).json(animals);
        } catch (err) {
            next(err);
        }
    };

    getAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const { id } = req.params;
            const animal = await service.getAnimal(id);
            res.status(200).json(animal);
        } catch (err) {
            next(err);
        }
    };

    updateAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const { id } = req.params;
            const updatedAnimal = await service.updateAnimal(id, req.body);
            res.status(200).json(updatedAnimal);
        } catch (err) {
            next(err);
        }
    };

    deleteAnimal = async (req, res, next) => {
        const service = this.#service;

        try {
            const { id } = req.params;
            const deletedAnimal = await service.deleteAnimal(id);
            res.status(200).json(deletedAnimal);
        } catch (err) {
            next(err);
        }
    };
}

export default AnimalController;