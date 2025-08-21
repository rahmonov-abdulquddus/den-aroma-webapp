// src/handlers/adminCommands.js

import monitoring from "../utils/monitoring.js";
import backup from "../utils/backup.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";
import userService from "../services/userService.js";
import productService from "../services/productService.js";
import orderService from "../services/orderService.js";

/**
 * Admin buyruqlarini boshqarish
 * @param {object} bot - Telegram bot instansi
 * @param {object} msg - Xabar obyekti
 */
export const handleAdminCommands = async (bot, msg) => {
  const { text, chat } = msg;
  const adminId = parseInt(config.adminId);

  // Faqat admin buyruqlarni bajarishi mumkin
  if (chat.id !== adminId) {
    return;
  }

  const command = text.toLowerCase();

  try {
    switch (command) {
      case "/stats":
        await handleStatsCommand(bot, chat.id);
        break;

      case "/backup":
        await handleBackupCommand(bot, chat.id);
        break;

      case "/memory":
        await handleMemoryCommand(bot, chat.id);
        break;

      case "/users":
        await handleUsersCommand(bot, chat.id);
        break;

      case "/products":
        await handleProductsCommand(bot, chat.id);
        break;

      case "/orders":
        await handleOrdersCommand(bot, chat.id);
        break;

      case "/restart":
        await handleRestartCommand(bot, chat.id);
        break;

      case "/help":
        await handleHelpCommand(bot, chat.id);
        break;

      default:
        if (command.startsWith("/")) {
          await bot.sendMessage(chat.id, "❌ Noma'lum buyruq. /help yozing.");
        }
    }
  } catch (error) {
    await monitoring.logError(error, "Admin Commands", bot);
    await bot.sendMessage(chat.id, "❌ Buyruq bajarilishida xato yuz berdi.");
  }
};

/**
 * Statistika buyrug'i
 */
async function handleStatsCommand(bot, chatId) {
  const stats = monitoring.getStats();
  const memory = monitoring.getMemoryUsage();

  const message =
    `📊 <b>Bot statistikasi</b>\n\n` +
    `❌ <b>Jami xatolar:</b> ${stats.totalErrors}\n` +
    `⚠️ <b>So'nggi soatdagi xatolar:</b> ${stats.recentErrors}\n` +
    `⚡ <b>O'rtacha javob vaqti:</b> ${Math.round(
      stats.averageResponseTime
    )}ms\n\n` +
    `💾 <b>Memory usage:</b>\n` +
    `• RSS: ${memory.rss} MB\n` +
    `• Heap Total: ${memory.heapTotal} MB\n` +
    `• Heap Used: ${memory.heapUsed} MB\n` +
    `• External: ${memory.external} MB\n\n` +
    `🐌 <b>Eng sekin operatsiyalar:</b>\n` +
    (stats.slowestOperations.length > 0
      ? stats.slowestOperations
          .map((op) => `• ${op.operation}: ${op.duration}ms`)
          .join("\n")
      : "• Hozircha ma'lumot yo'q");

  await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}

/**
 * Backup buyrug'i
 */
async function handleBackupCommand(bot, chatId) {
  await bot.sendMessage(chatId, "🔄 Database backup yaratilmoqda...");

  try {
    const backupPath = await backup.createBackup();
    const backups = backup.getBackupList();

    const message =
      `✅ <b>Backup muvaffaqiyatli yaratildi!</b>\n\n` +
      `📁 <b>Fayl:</b> ${backupPath}\n` +
      `📊 <b>Jami backup fayllar:</b> ${backups.length}\n\n` +
      `📋 <b>So'nggi 5 ta backup:</b>\n` +
      backups
        .slice(0, 5)
        .map((b) => `• ${b.name} (${b.sizeFormatted})`)
        .join("\n");

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(
      chatId,
      `❌ Backup yaratishda xato: ${error.message}`
    );
  }
}

/**
 * Memory buyrug'i
 */
async function handleMemoryCommand(bot, chatId) {
  const memory = monitoring.getMemoryUsage();
  const usage = process.cpuUsage();

  const message =
    `💾 <b>System ma'lumotlari</b>\n\n` +
    `🖥️ <b>Memory:</b>\n` +
    `• RSS: ${memory.rss} MB\n` +
    `• Heap Total: ${memory.heapTotal} MB\n` +
    `• Heap Used: ${memory.heapUsed} MB\n` +
    `• External: ${memory.external} MB\n\n` +
    `⚡ <b>CPU:</b>\n` +
    `• User: ${Math.round(usage.user / 1000)}ms\n` +
    `• System: ${Math.round(usage.system / 1000)}ms\n\n` +
    `⏰ <b>Uptime:</b> ${Math.round(process.uptime())} soniya`;

  await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}

/**
 * Foydalanuvchilar buyrug'i
 */
async function handleUsersCommand(bot, chatId) {
  try {
    const totalUsers = await userService.getTotalUsers();
    const todayUsers = await userService.getTodayUsers();
    const activeUsers = await userService.getActiveUsers();

    const message =
      `👥 <b>Foydalanuvchilar statistikasi</b>\n\n` +
      `📊 <b>Jami foydalanuvchilar:</b> ${totalUsers}\n` +
      `📅 <b>Bugun qo'shilgan:</b> ${todayUsers}\n` +
      `🟢 <b>Faol foydalanuvchilar (7 kun):</b> ${activeUsers}`;

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(
      chatId,
      `❌ Foydalanuvchilar statistikasini olishda xato: ${error.message}`
    );
  }
}

/**
 * Mahsulotlar buyrug'i
 */
async function handleProductsCommand(bot, chatId) {
  try {
    const totalProducts = await productService.getTotalProducts();
    const activeProducts = await productService.getActiveProducts();
    const pendingProducts = await productService.getPendingProducts();

    const message =
      `📦 <b>Mahsulotlar statistikasi</b>\n\n` +
      `📊 <b>Jami mahsulotlar:</b> ${totalProducts}\n` +
      `🟢 <b>Faol mahsulotlar:</b> ${activeProducts}\n` +
      `⏳ <b>Kutilayotgan mahsulotlar:</b> ${pendingProducts}`;

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(
      chatId,
      `❌ Mahsulotlar statistikasini olishda xato: ${error.message}`
    );
  }
}

/**
 * Buyurtmalar buyrug'i
 */
async function handleOrdersCommand(bot, chatId) {
  try {
    const totalOrders = await orderService.getTotalOrders();
    const todayOrders = await orderService.getTodayOrders();
    const pendingOrders = await orderService.getPendingOrders();

    const message =
      `🛒 <b>Buyurtmalar statistikasi</b>\n\n` +
      `📊 <b>Jami buyurtmalar:</b> ${totalOrders}\n` +
      `📅 <b>Bugungi buyurtmalar:</b> ${todayOrders}\n` +
      `⏳ <b>Kutilayotgan buyurtmalar:</b> ${pendingOrders}`;

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(
      chatId,
      `❌ Buyurtmalar statistikasini olishda xato: ${error.message}`
    );
  }
}

/**
 * Qayta ishga tushirish buyrug'i
 */
async function handleRestartCommand(bot, chatId) {
  await bot.sendMessage(chatId, "🔄 Bot qayta ishga tushirilmoqda...");

  // 3 soniya kutib, process ni qayta ishga tushirish
  setTimeout(() => {
    process.exit(0);
  }, 3000);
}

/**
 * Yordam buyrug'i
 */
async function handleHelpCommand(bot, chatId) {
  const message =
    `🔧 <b>Admin buyruqlari</b>\n\n` +
    `/stats - Bot statistikasi\n` +
    `/backup - Database backup yaratish\n` +
    `/memory - Memory va CPU ma'lumotlari\n` +
    `/users - Foydalanuvchilar statistikasi\n` +
    `/products - Mahsulotlar statistikasi\n` +
    `/orders - Buyurtmalar statistikasi\n` +
    `/restart - Botni qayta ishga tushirish\n` +
    `/help - Bu yordam xabari`;

  await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}
