// src/app.js

import TelegramBot from "node-telegram-bot-api";
import mongoose from "mongoose";
import config from "./config.js";

// Handler funksiyalarini to'g'ri import qilish
import handleMessage from "./handlers/messageHandler.js";
import handleCallbackQuery from "./handlers/callbackQueryHandler.js";
import { setupCommands } from "./handlers/commandHandler.js"; // setupCommands ni import qilamiz
import userService from "./services/userService.js"; // Foydalanuvchi tilini olish uchun
import { getTranslation } from "./utils/i18n.js"; // Tilni boshqarish utiliti
import registerChannelPostHandler from "./handlers/channelPostHandler.js";
import registerProductManagementHandler from "./handlers/productManagementHandler.js";
import { handleAdminCommands } from "./handlers/adminCommands.js"; // Admin buyruqlari uchun
import { handleDeliveryCommands } from "./handlers/deliveryCommands.js"; // Dastavchik buyruqlari uchun
import { handleDeliveryCallbackQuery } from "./handlers/deliveryCallbackHandler.js"; // Dastavchik callback handler
import deliveryPersonService from "./services/deliveryPersonService.js"; // Dastavchik service uchun
import rateLimiter from "./utils/rateLimiter.js"; // Rate limiting uchun
import { isSpam, logSecurityEvent } from "./utils/security.js"; // Xavfsizlik uchun
import monitoring from "./utils/monitoring.js"; // Monitoring uchun
import backup from "./utils/backup.js"; // Backup uchun

// Telegram bot instansiyasini yaratish
const bot = new TelegramBot(config.telegramBotToken, { polling: true });

// Asosiy ishga tushirish funksiyasi
const startBot = async () => {
  // MongoDB ulanishi
  mongoose
    .connect(config.mongoUri)
    .then(() => console.log("MongoDB ga muvaffaqiyatli ulanildi!"))
    .catch((err) => console.error("MongoDB ga ulanishda xato:", err));

  // Bot buyruqlarini o'rnatish (Telegram menyusiga)
  // setupCommands funksiyasi Telegramga buyruqlarni o'rnatish uchun
  // Umumiy tilni aniqlash uchun oddiy foydalanuvchi holati yo'qligi sababli, uzbek tilini default beramiz
  try {
    await setupCommands(bot, "uzbek"); // <<< setupCommands ga tilni uzatamiz
    console.log("Bot buyruqlari muvaffaqiyatli o'rnatildi.");
  } catch (e) {
    console.error("Buyruqlar menyusini o'rnatishda xato:", e);
  }

  console.log("Bot ishga tushdi...");

  // Avtomatik backup va monitoring ni ishga tushirish
  backup.scheduleBackups();

  // Har soat statistika yuborish
  setInterval(async () => {
    try {
      await monitoring.sendStatsToAdmin(bot);
    } catch (error) {
      console.error("Statistika yuborishda xato:", error);
    }
  }, 60 * 60 * 1000); // Har soat

  // Global xato tutqichi
  bot.on("polling_error", (err) => {
    console.error("Polling xatosi:", err);
    monitoring.logError(err, "Polling Error", bot);
  });
  bot.on("webhook_error", (error) => {
    console.error("Webhook xatosi:", error);
    monitoring.logError(error, "Webhook Error", bot);
  });

  // Har qanday xabarni tinglash
  bot.on("message", async (msg) => {
    try {
      if (!msg.chat || !msg.chat.id) {
        console.error("Xabarda chat ID topilmadi:", msg);
        return;
      }

      // Rate limiting tekshiruvlari
      if (!rateLimiter.isAllowed(msg.chat.id)) {
        console.warn(`Rate limit oshdi: ${msg.chat.id}`);
        await bot.sendMessage(
          msg.chat.id,
          "Juda ko'p so'rov yubordingiz. Iltimos, biroz kutib turing."
        );
        return;
      }

      // Spam va xavfsizlik tekshiruvlari
      if (isSpam(msg)) {
        logSecurityEvent("spam_detected", msg.chat.id, { text: msg.text });
        console.warn(`Spam xabar bloklandi: ${msg.chat.id}`);
        return;
      }

      // Admin buyruqlarini tekshirish
      if (
        msg.text &&
        msg.text.startsWith("/") &&
        [
          "/stats",
          "/backup",
          "/memory",
          "/users",
          "/products",
          "/orders",
          "/restart",
          "/help",
        ].includes(msg.text.toLowerCase())
      ) {
        await handleAdminCommands(bot, msg);
        return;
      }

      // Dastavchik buyruqlarini tekshirish (faqat dastavchik bo'lgan foydalanuvchilar uchun)
      if (
        msg.text &&
        msg.text.startsWith("/") &&
        ["/online", "/offline", "/orders", "/stats", "/help"].includes(
          msg.text.toLowerCase()
        )
      ) {
        // Dastavchik ekanligini tekshirish
        const deliveryPerson =
          await deliveryPersonService.getDeliveryPersonByTelegramId(
            msg.chat.id
          );
        if (deliveryPerson && deliveryPerson.isActive) {
          await handleDeliveryCommands(bot, msg);
          return;
        }
      }

      // Performance monitoring
      const startTime = Date.now();

      // Barcha matnli xabarlar handleMessage ga boradi.
      // Buyruqlar (/start, /admin) ham messageHandler ichida boshqariladi.
      await handleMessage(bot, msg);

      // Performance log
      const duration = Date.now() - startTime;
      monitoring.logPerformance("message_handling", duration, {
        userId: msg.chat.id,
        messageType: msg.text ? "text" : "other",
      });
    } catch (error) {
      console.error("Message handler xatosi:", error);
      // Foydalanuvchiga xabar yuborishga harakat qilish
      try {
        await bot.sendMessage(
          msg.chat.id,
          "Kechirasiz, xato yuz berdi. Iltimos, qaytadan urinib ko'ring."
        );
      } catch (sendError) {
        console.error("Xabar yuborishda xato:", sendError);
      }
    }
  });

  // Callback Query handler
  bot.on("callback_query", async (callbackQuery) => {
    try {
      if (
        !callbackQuery.message ||
        !callbackQuery.message.chat ||
        !callbackQuery.message.chat.id
      ) {
        console.error("Callback queryda chat ID topilmadi:", callbackQuery);
        return;
      }

      // Spam tekshiruvlari
      if (callbackQuery.data && callbackQuery.data.length > 64) {
        console.warn(
          `Uzun callback data bloklandi: ${callbackQuery.message.chat.id}`
        );
        return;
      }

      // Dastavchik callback querylarini tekshirish (faqat dastavchi bo'lgan foydalanuvchilar uchun)
      if (callbackQuery.data && callbackQuery.data.startsWith("delivery_")) {
        // Dastavchik ekanligini tekshirish
        const deliveryPerson =
          await deliveryPersonService.getDeliveryPersonByTelegramId(
            callbackQuery.message.chat.id
          );
        if (deliveryPerson && deliveryPerson.isActive) {
          await handleDeliveryCallbackQuery(bot, callbackQuery);
          return;
        }
        // Agar dastavchi bo'lmasa, asosiy callback handler'ga yuborish
      }

      await handleCallbackQuery(bot, callbackQuery);
    } catch (error) {
      console.error("Callback query handler xatosi:", error);
      try {
        await bot.answerCallbackQuery(callbackQuery.id, {
          text: "Xato yuz berdi. Iltimos, qaytadan urinib ko'ring.",
          show_alert: true,
        });
      } catch (sendError) {
        console.error("Callback answer xatosi:", sendError);
      }
    }
  });
};

// Botni ishga tushirish
startBot();

registerChannelPostHandler(bot); // Kanal postidan mahsulot import qilish handleri
registerProductManagementHandler(bot); // Mahsulot boshqarish handleri

// Kanal postidan kanal ID ni olish uchun handler
bot.on("channel_post", (msg) => {
  console.log("Kanal ID:", msg.chat.id);
});
