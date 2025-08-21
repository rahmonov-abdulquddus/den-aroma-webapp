// src/handlers/commandHandler.js

import { getTranslation } from "../utils/i18n.js";
import userService from "../services/userService.js"; // Foydalanuvchi tilini olish uchun

export const setupCommands = async (bot) => {
  // userLanguage parametri olib tashlandi, dinamik bo'ladi
  // Bot ishga tushganda yoki buyruqlar yangilanishi kerak bo'lganda bu funksiya chaqiriladi
  // `setMyCommands` to'g'ridan-to'g'ri tilga bog'liq bo'lmagan buyruqlarni o'rnatadi.
  // getTranslation funktsiyasi har bir foydalanuvchining tiliga qarab tarjima qilishi kerak.
  // Buyruqlar Telegram interfeysida ko'rinadigan universal buyruqlar bo'ladi.
  // Shuning uchun bu yerda muayyan tilni belgilash shart emas.
  // Faqatgina bot ishga tushganida qaysi buyruqlar mavjudligini e'lon qilamiz.

  // Tilga bog'liq bo'lmagan umumiy buyruqlar
  // Bu yerda getTranslation ga default tilni beramiz, chunki buyruqlar global o'rnatiladi.
  const _ = (key, replacements) => getTranslation(key, replacements, "uzbek"); // Botning default tili 'uzbek' deb olindi

  await bot.setMyCommands(
    [
      { command: "start", description: _("start_command_description") },
      { command: "admin", description: _("admin_command_description") },
      // Qo'shimcha buyruqlar
    ],
    { scope: { type: "all_private_chats" } }
  ); // Barcha shaxsiy chatlar uchun
  // Yoki ma'lum bir chat_id uchun:
  // { scope: { type: 'chat', chat_id: YOUR_ADMIN_ID } }
};

/**
 * Dastavchik buyruqlarini o'rnatish
 * @param {object} bot - Telegram bot instansi
 * @param {string} deliveryPersonId - Dastavchik Telegram ID
 */
export const setupDeliveryCommands = async (bot, deliveryPersonId) => {
  await bot.setMyCommands(
    [
      { command: "start", description: "Dastavchik paneli" },
      { command: "online", description: "Online holatga o'tish" },
      { command: "offline", description: "Offline holatga o'tish" },
      { command: "orders", description: "Buyurtmalarni ko'rish" },
      { command: "stats", description: "Statistika" },
      { command: "help", description: "Yordam" },
    ],
    { scope: { type: "chat", chat_id: deliveryPersonId } }
  );
};

/**
 * Dastavchik buyruqlarini olib tashlash
 * @param {object} bot - Telegram bot instansi
 * @param {string} deliveryPersonId - Dastavchik Telegram ID
 */
export const removeDeliveryCommands = async (bot, deliveryPersonId) => {
  await bot.deleteMyCommands({
    scope: { type: "chat", chat_id: deliveryPersonId },
  });
};
