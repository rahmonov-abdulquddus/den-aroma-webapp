// src/services/cartService.js

import cartRepository from "../db/repositories/cartRepository.js"; // YO'LNI TO'G'IRLASH
import productService from "./productService.js"; // productServiceni ham import qilish

const cartService = {
  /**
   * Foydalanuvchining savatini oladi.
   * @param {string} userId - Foydalanuvchining MongoDB IDsi.
   * @returns {Promise<object>} Savat obyekti.
   */
  getUserCart: async (userId) => {
    return cartRepository.findOrCreateByUserId(userId);
  },

  /**
   * Savatga mahsulot qo'shadi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @param {string} productId - Mahsulot IDsi.
   * @param {number} quantity - Miqdor.
   * @returns {Promise<object>} Yangilangan savat obyekti.
   * @throws {Error} Agar mahsulot topilmasa.
   */
  addToCart: async (userId, productId, quantity = 1) => {
    const product = await productService.getProduct(productId);
    console.log("addToCart: product:", product);
    if (!product) {
      throw new Error("Mahsulot topilmadi yoki mavjud emas.");
    }
    // isActive va stock ni tekshirish
    if (product.isActive === false || product.stock <= 0) {
      throw new Error("Mahsulot mavjud emas yoki sotuvda yo'q.");
    }
    return cartRepository.addItem(userId, productId, quantity, product.price);
  },

  /**
   * Savatdan mahsulotni olib tashlaydi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @param {string} productId - Mahsulot IDsi.
   * @param {number} [quantityToRemove] - Olib tashlanadigan miqdor.
   * @returns {Promise<object|null>} Yangilangan savat obyekti.
   */
  removeProductFromCart: async (userId, productId, quantityToRemove) => {
    return cartRepository.removeItem(userId, productId, quantityToRemove);
  },

  /**
   * Savatni tozalaydi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @returns {Promise<object|null>} Tozalangan savat obyekti.
   */
  clearUserCart: async (userId) => {
    return cartRepository.clearCart(userId);
  },

  // Boshqa savatga oid servislar
};

export default cartService;
