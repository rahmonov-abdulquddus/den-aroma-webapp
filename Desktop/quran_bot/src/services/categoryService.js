// src/services/categoryService.js

import { CategoryRepository } from '../db/repositories/categoryRepository.js'; // <-- categoryRepository.js named export qilgani uchun qavslar bilan import

class CategoryService {
    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async addCategory(name) {
        return await this.categoryRepository.addCategory(name);
    }

    async getCategoryByName(name) {
        return await this.categoryRepository.getCategoryByName(name);
    }

    async getCategoryById(id) {
        return await this.categoryRepository.getCategoryById(id);
    }

    async getAllCategories() {
        return await this.categoryRepository.getAllCategories();
    }

    async updateCategory(id, newName) {
        return await this.categoryRepository.updateCategory(id, newName);
    }

    async deleteCategory(id) {
        return await this.categoryRepository.deleteCategory(id);
    }
}

export default new CategoryService(); // <-- CategoryService obyektini default export qilamiz