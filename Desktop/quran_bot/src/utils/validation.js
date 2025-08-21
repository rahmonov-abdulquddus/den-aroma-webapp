// src/utils/validation.js

import logger from "./logger.js";

/**
 * Barcha validatsiya funksiyalari
 */
export const validation = {
  /**
   * Telefon raqamini validatsiya qilish
   * @param {string} phone - Telefon raqami
   * @returns {boolean} - To'g'rimi
   */
  isValidPhone: (phone) => {
    if (!phone || typeof phone !== "string") return false;

    // O'zbekiston telefon raqami formatini tekshirish
    const cleanPhone = phone.replace(/\s+/g, "");
    const phoneRegex = /^(\+998|998)?[0-9]{9}$/;

    return phoneRegex.test(cleanPhone);
  },

  /**
   * Manzilni validatsiya qilish
   * @param {string} address - Manzil
   * @returns {boolean} - To'g'rimi
   */
  isValidAddress: (address) => {
    if (!address || typeof address !== "string") return false;

    const cleanAddress = address.trim();
    return cleanAddress.length >= 3 && cleanAddress.length <= 500;
  },

  /**
   * Narxni validatsiya qilish
   * @param {any} price - Narx
   * @returns {boolean} - To'g'rimi
   */
  isValidPrice: (price) => {
    if (!price || typeof price !== "number") return false;
    return price > 0 && price < 1000000000; // 1 milliard chegarasi
  },

  /**
   * Miqdorni validatsiya qilish
   * @param {any} quantity - Miqdor
   * @returns {boolean} - To'g'rimi
   */
  isValidQuantity: (quantity) => {
    if (!quantity || typeof quantity !== "number") return false;
    return quantity > 0 && quantity <= 1000; // 1000 dona chegarasi
  },

  /**
   * Mahsulot nomini validatsiya qilish
   * @param {string} name - Mahsulot nomi
   * @returns {boolean} - To'g'rimi
   */
  isValidProductName: (name) => {
    if (!name || typeof name !== "string") return false;

    const cleanName = name.trim();
    return cleanName.length >= 2 && cleanName.length <= 200;
  },

  /**
   * Mahsulot tavsifini validatsiya qilish
   * @param {string} description - Tavsif
   * @returns {boolean} - To'g'rimi
   */
  isValidDescription: (description) => {
    if (!description || typeof description !== "string") return false;

    const cleanDescription = description.trim();
    return cleanDescription.length >= 10 && cleanDescription.length <= 2000;
  },

  /**
   * Kategoriya nomini validatsiya qilish
   * @param {string} name - Kategoriya nomi
   * @returns {boolean} - To'g'rimi
   */
  isValidCategoryName: (name) => {
    if (!name || typeof name !== "string") return false;

    const cleanName = name.trim();
    return cleanName.length >= 2 && cleanName.length <= 100;
  },

  /**
   * ObjectId ni validatsiya qilish
   * @param {string} id - ObjectId
   * @returns {boolean} - To'g'rimi
   */
  isValidObjectId: (id) => {
    if (!id || typeof id !== "string") return false;

    const mongoose = require("mongoose");
    return mongoose.Types.ObjectId.isValid(id);
  },

  /**
   * Foydalanuvchi ID sini validatsiya qilish
   * @param {any} userId - Foydalanuvchi ID
   * @returns {boolean} - To'g'rimi
   */
  isValidUserId: (userId) => {
    return (
      userId &&
      typeof userId === "number" &&
      userId > 0 &&
      userId < Number.MAX_SAFE_INTEGER
    );
  },

  /**
   * Xabar matnini validatsiya qilish
   * @param {string} text - Xabar matni
   * @returns {boolean} - To'g'rimi
   */
  isValidMessageText: (text) => {
    if (!text || typeof text !== "string") return false;

    const cleanText = text.trim();
    return cleanText.length >= 1 && cleanText.length <= 4096;
  },

  /**
   * Buyurtma ma'lumotlarini validatsiya qilish
   * @param {object} orderData - Buyurtma ma'lumotlari
   * @returns {object} - Validatsiya natijasi
   */
  validateOrderData: (orderData) => {
    const errors = [];

    if (!orderData.contact || !validation.isValidPhone(orderData.contact)) {
      errors.push("Telefon raqami noto'g'ri");
    }

    if (!orderData.address || !validation.isValidAddress(orderData.address)) {
      errors.push("Manzil noto'g'ri");
    }

    if (
      !orderData.totalPrice ||
      !validation.isValidPrice(orderData.totalPrice)
    ) {
      errors.push("Narx noto'g'ri");
    }

    if (
      !orderData.products ||
      !Array.isArray(orderData.products) ||
      orderData.products.length === 0
    ) {
      errors.push("Mahsulotlar ro'yxati bo'sh");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Mahsulot ma'lumotlarini validatsiya qilish
   * @param {object} productData - Mahsulot ma'lumotlari
   * @returns {object} - Validatsiya natijasi
   */
  validateProductData: (productData) => {
    const errors = [];

    if (!productData.name || !validation.isValidProductName(productData.name)) {
      errors.push("Mahsulot nomi noto'g'ri");
    }

    if (!productData.price || !validation.isValidPrice(productData.price)) {
      errors.push("Narx noto'g'ri");
    }

    if (
      productData.description &&
      !validation.isValidDescription(productData.description)
    ) {
      errors.push("Tavsif juda qisqa yoki uzun");
    }

    if (productData.stock && !validation.isValidQuantity(productData.stock)) {
      errors.push("Miqdor noto'g'ri");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Xatoni log qilish va foydalanuvchiga xabar berish
   * @param {object} bot - Telegram bot
   * @param {number} chatId - Chat ID
   * @param {Array} errors - Xatolar ro'yxati
   * @param {string} context - Xato konteksti
   */
  logValidationErrors: (bot, chatId, errors, context) => {
    logger.error(`Validation errors in ${context}:`, errors);

    const errorMessage =
      `❌ <b>Ma'lumotlar noto'g'ri:</b>\n\n` +
      errors.map((error) => `• ${error}`).join("\n") +
      `\n\nIltimos, qaytadan urinib ko'ring.`;

    bot.sendMessage(chatId, errorMessage, { parse_mode: "HTML" });
  },
};

export default validation;
