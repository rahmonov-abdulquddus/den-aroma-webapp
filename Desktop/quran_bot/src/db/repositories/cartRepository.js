// src/db/repositories/cartRepository.js

import Cart from "../models/Cart.js"; // YO'LNI TO'G'IRLASH
import User from "../models/User.js"; // User modelini ham import qilish

const cartRepository = {
  /**
   * Foydalanuvchining savatini topadi yoki yangisini yaratadi.
   * @param {string} userId - Foydalanuvchi IDsi (Mongoose ObjectId).
   * @returns {Promise<object>} Savat obyekti.
   */
  findOrCreateByUserId: async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!cart) {
      cart = new Cart({ user: userId, products: [], totalPrice: 0 });
      await cart.save();
    }
    return cart;
  },

  /**
   * Savatga mahsulot qo'shadi yoki miqdorini yangilaydi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @param {string} productId - Mahsulot IDsi.
   * @param {number} quantity - Qo'shiladigan miqdor.
   * @param {number} price - Mahsulotning joriy narxi.
   * @returns {Promise<object>} Yangilangan savat obyekti.
   */
  addItem: async (userId, productId, quantity, price) => {
    const cart = await cartRepository.findOrCreateByUserId(userId);
    const existingItemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.products[existingItemIndex].quantity += quantity;
      cart.products[existingItemIndex].price = price; // Narxni yangilash
    } else {
      cart.products.push({ product: productId, quantity, price });
    }
    await cart.save(); // pre('save') hooki totalPrice ni yangilaydi
    return cart.populate("products.product");
  },

  /**
   * Savatdan mahsulotni olib tashlaydi yoki miqdorini kamaytiradi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @param {string} productId - Mahsulot IDsi.
   * @param {number} [quantityToRemove] - Olib tashlanadigan miqdor. Agar berilmasa, barchasi o'chiriladi.
   * @returns {Promise<object|null>} Yangilangan savat obyekti yoki null (agar savat bo'lmasa).
   */
  removeItem: async (userId, productId, quantityToRemove) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    const existingItemIndex = cart.products.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      if (
        quantityToRemove &&
        cart.products[existingItemIndex].quantity > quantityToRemove
      ) {
        cart.products[existingItemIndex].quantity -= quantityToRemove;
      } else {
        cart.products.splice(existingItemIndex, 1); // Mahsulotni butunlay olib tashlash
      }
      await cart.save();
    }
    return cart.populate("products.product");
  },

  /**
   * Foydalanuvchining savatini tozalaydi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @returns {Promise<object|null>} Tozalangan savat obyekti yoki null.
   */
  clearCart: async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();
    return cart;
  },

  /**
   * Savatni ID bo'yicha topadi.
   * @param {string} cartId - Savat IDsi.
   * @returns {Promise<object|null>} Savat obyekti yoki null.
   */
  findById: async (cartId) => {
    return Cart.findById(cartId).populate("products.product");
  },
};

export default cartRepository;
