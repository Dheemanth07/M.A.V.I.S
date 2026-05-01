import AppError from "../utils/AppError.js";

class AnimalService {
    #animalRepository;

    constructor(animalRepository) {
        this.#animalRepository = animalRepository;
    }

    async createAnimal(data) {
        return await this.#animalRepository.create(data);
    }

    async getAnimals() {
        return await this.#animalRepository.findAll();
    }

    async getAnimal(id) {
        const animal = await this.#animalRepository.findById(id);

        if (!animal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return animal;
    }

    async updateAnimal(id, data) {
        const updatedAnimal = await this.#animalRepository.update(id, data);

        if (!updatedAnimal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return updatedAnimal;
    }

    async deleteAnimal(id) {
        const deletedAnimal = await this.#animalRepository.delete(id);

        if (!deletedAnimal)
            throw new AppError(`Animal with ID ${id} not found`, 404);

        return deletedAnimal;

    }
}

export default AnimalService;