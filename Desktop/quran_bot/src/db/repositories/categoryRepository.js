// src/db/repositories/categoryRepository.js
import Category from '../models/Category.js';
import Product from '../models/Product.js'; // Kategoriyani o'chirishda mahsulotlarni ham o'chirish uchun

export class CategoryRepository {
    async addCategory(name) {
        const newCategory = new Category({ name });
        return await newCategory.save();
    }

    async getCategoryByName(name) {
        return await Category.findOne({ name });
    }

    async getCategoryById(id) {
        return await Category.findById(id);
    }

    async getAllCategories() {
        return await Category.find({});
    }

    async updateCategory(id, newName) {
        return await Category.findByIdAndUpdate(id, { name: newName }, { new: true });
    }

    async deleteCategory(id) {
        // Kategoriyaga tegishli mahsulotlarni ham o'chirish
        await Product.deleteMany({ categoryId: id });
        return await Category.findByIdAndDelete(id);
    }
}