// src/db/repositories/productRepository.js
import Product from '../models/Product.js';

export class ProductRepository {
    async addProduct(productData) {
        const newProduct = new Product(productData); // To'liq productData obyektini qabul qiladi
        return await newProduct.save();
    }

    async getProductById(id) {
        return await Product.findById(id).populate('categoryId'); // Kategoriya nomini olish uchun populate
    }

    async getProductsByCategoryId(categoryId) {
        return await Product.find({ categoryId: categoryId }).populate('categoryId'); // Populate
    }

    async getAllProducts() {
        return await Product.find({}).populate('categoryId'); // Populate
    }

    async updateProduct(id, updates) {
        return await Product.findByIdAndUpdate(id, updates, { new: true });
    }

    async deleteProduct(id) {
        return await Product.findByIdAndDelete(id);
    }

    async findProductsByQuery(queryRegex) {
        return await Product.find({
            $or: [
                { name: { $regex: queryRegex } },
                { description: { $regex: queryRegex } }
            ]
        }).populate('categoryId'); // Populate
    }
}