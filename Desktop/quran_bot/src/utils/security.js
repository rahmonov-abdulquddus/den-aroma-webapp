// src/utils/security.js

import logger from './logger.js';

/**
 * Xabar matnini tozalash va validatsiya qilish
 * @param {string} text - To'lanadigan matn
 * @returns {string} - Tozalangan matn
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // XSS va HTML taglarni tozalash
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 4096); // Telegram xabar chegarasi
};

/**
 * Foydalanuvchi ID sini validatsiya qilish
 * @param {any} userId - Foydalanuvchi ID
 * @returns {boolean} - To'g'rimi
 */
export const validateUserId = (userId) => {
  return userId && 
         typeof userId === 'number' && 
         userId > 0 && 
         userId < Number.MAX_SAFE_INTEGER;
};

/**
 * Narxni validatsiya qilish
 * @param {any} price - Narx
 * @returns {boolean} - To'g'rimi
 */
export const validatePrice = (price) => {
  return price && 
         typeof price === 'number' && 
         price > 0 && 
         price < 1000000000; // 1 milliard chegarasi
};

/**
 * Mahsulot nomini validatsiya qilish
 * @param {string} name - Mahsulot nomi
 * @returns {boolean} - To'g'rimi
 */
export const validateProductName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const sanitizedName = sanitizeText(name);
  return sanitizedName.length >= 2 && sanitizedName.length <= 200;
};

/**
 * Telefon raqamini validatsiya qilish
 * @param {string} phone - Telefon raqami
 * @returns {boolean} - To'g'rimi
 */
export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // O'zbekiston telefon raqami formatini tekshirish
  const phoneRegex = /^(\+998|998)?[0-9]{9}$/;
  const cleanPhone = phone.replace(/\s+/g, '');
  
  return phoneRegex.test(cleanPhone);
};

/**
 * Manzilni validatsiya qilish
 * @param {string} address - Manzil
 * @returns {boolean} - To'g'rimi
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  const sanitizedAddress = sanitizeText(address);
  return sanitizedAddress.length >= 10 && sanitizedAddress.length <= 500;
};

/**
 * Xavfsizlik hodisasini log qilish
 * @param {string} event - Hodisa turi
 * @param {number} userId - Foydalanuvchi ID
 * @param {object} details - Qo'shimcha ma'lumotlar
 */
export const logSecurityEvent = (event, userId, details = {}) => {
  logger.security(event, userId, details);
};

/**
 * Spam tekshiruvlari
 * @param {object} msg - Telegram xabar obyekti
 * @returns {boolean} - Spam emasmi
 */
export const isSpam = (msg) => {
  // Juda qisqa xabarlar
  if (msg.text && msg.text.length < 1) {
    return true;
  }
  
  // Juda uzun xabarlar
  if (msg.text && msg.text.length > 4096) {
    return true;
  }
  
  // Faqat emoji yoki maxsus belgilar
  if (msg.text && /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\s]+$/u.test(msg.text)) {
    return true;
  }
  
  return false;
};
