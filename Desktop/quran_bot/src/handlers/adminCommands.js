// src/handlers/adminCommands.js

import monitoring from "../utils/monitoring.js";
import backup from "../utils/backup.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";
import userService from "../services/userService.js";
import productService from "../services/productService.js";
import orderService from "../services/orderService.js";
import Product from "../db/models/Product.js";
import Category from "../db/models/Category.js";
import Order from "../db/models/Order.js";
import { isAdmin } from "../utils/adminUtils.js";

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

      case "/admin":
        await handleAdminPanelCommand(bot, chat.id);
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
 * Admin panel command handler
 */
async function handleAdminPanelCommand(bot, chatId) {
  try {
    const adminPanelUrl = `${config.baseUrl}/admin-panel.html`;

    const message =
      `👑 <b>Admin Panel</b>\n\n` +
      `Professional admin panel orqali mahsulotlarni boshqarish:\n\n` +
      `📱 <a href="${adminPanelUrl}">Admin Panel'ni ochish</a>\n\n` +
      `💡 <b>Yangi imkoniyatlar:</b>\n` +
      `• 📊 Dashboard - tizim statistikasi\n` +
      `• ⏳ Ko'rib chiqilishi kerak - import qilingan mahsulotlar\n` +
      `• 📦 Mahsulotlar - barcha mahsulotlar\n` +
      `• ➕ Mahsulot qo'shish - yangi mahsulot\n` +
      `• 🏷️ Kategoriyalar - kategoriyalarni boshqarish\n` +
      `• 📥 Import - avtomatik import holati\n\n` +
      `✨ <b>Professional va qulay interfeys!</b>`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    });
  } catch (error) {
    console.error("Admin panel command'da xatolik:", error);
    await bot.sendMessage(chatId, "❌ Admin panel ochishda xatolik yuz berdi!");
  }
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
    `/admin - Admin panel (Web App)\n` +
    `/help - Bu yordam xabari`;

  await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}

// Admin panel asosiy menyu
async function showAdminPanel(msg) {
  if (!isAdmin(msg.from.id)) {
    return bot.sendMessage(msg.chat.id, "❌ Siz admin emassiz!");
  }

  const adminKeyboard = {
    inline_keyboard: [
      [
        { text: "📁 Kategoriyalar", callback_data: "admin_categories" },
        { text: "🛍️ Mahsulotlar", callback_data: "admin_products" },
      ],
      [
        { text: "📝 Post tashlash", callback_data: "admin_post" },
        { text: "📊 Buyurtmalar", callback_data: "admin_orders" },
      ],
      [
        { text: "📈 Statistika", callback_data: "admin_stats" },
        { text: "⚙️ Sozlamalar", callback_data: "admin_settings" },
      ],
    ],
  };

  bot.sendMessage(
    msg.chat.id,
    "👑 *Admin Panel*\n\nQaysi bo'limni boshqarmoqchisiz?",
    {
      reply_markup: adminKeyboard,
      parse_mode: "Markdown",
    }
  );
}

// Kategoriyalar boshqaruvi
async function showCategoryManagement(msg) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "➕ Yangi kategoriya", callback_data: "add_category" },
        { text: "✏️ Tahrirlash", callback_data: "edit_category" },
      ],
      [
        { text: "🗑️ O'chirish", callback_data: "delete_category" },
        { text: "📋 Ro'yxat", callback_data: "list_categories" },
      ],
      [{ text: "🔙 Orqaga", callback_data: "admin_menu" }],
    ],
  };

  bot.sendMessage(
    msg.chat.id,
    "📁 *Kategoriyalar boshqaruvi*\n\nKategoriyalar bilan bog'liq amallarni tanlang:",
    {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    }
  );
}

// Mahsulotlar boshqaruvi
async function showProductManagement(msg) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: "➕ Yangi mahsulot", callback_data: "add_product" },
        { text: "✏️ Tahrirlash", callback_data: "edit_product" },
      ],
      [
        { text: "🗑️ O'chirish", callback_data: "delete_product" },
        { text: "📋 Ro'yxat", callback_data: "list_products" },
      ],
      [{ text: "🔙 Orqaga", callback_data: "admin_menu" }],
    ],
  };

  bot.sendMessage(
    msg.chat.id,
    "🛍️ *Mahsulotlar boshqaruvi*\n\nMahsulotlar bilan bog'liq amallarni tanlang:",
    {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    }
  );
}

// Post tashlash (mahsulot qo'shish)
async function startProductCreation(msg) {
  const userState = {
    state: "waiting_product_name",
    step: 1,
    productData: {},
  };

  // User state'ni saqlash
  global.userStates = global.userStates || {};
  global.userStates[msg.from.id] = userState;

  const keyboard = {
    inline_keyboard: [
      [{ text: "❌ Bekor qilish", callback_data: "cancel_product_creation" }],
    ],
  };

  bot.sendMessage(
    msg.chat.id,
    "📝 *Yangi mahsulot qo'shish*\n\n1️⃣ Mahsulot nomini kiriting:",
    {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    }
  );
}

// Mahsulot ma'lumotlarini olish
async function handleProductCreation(msg) {
  const userState = global.userStates[msg.from.id];
  if (!userState || userState.state !== "waiting_product_name") return;

  switch (userState.step) {
    case 1: // Nomi
      userState.productData.name = msg.text;
      userState.step = 2;
      bot.sendMessage(msg.chat.id, "2️⃣ Mahsulot narxini kiriting (so'm):");
      break;

    case 2: // Narxi
      const price = parseFloat(msg.text);
      if (isNaN(price) || price <= 0) {
        return bot.sendMessage(
          msg.chat.id,
          "❌ Noto'g'ri narx! Qaytadan kiriting:"
        );
      }
      userState.productData.price = price;
      userState.step = 3;
      bot.sendMessage(
        msg.chat.id,
        "3️⃣ Eski narxini kiriting (agar chegirma bo'lsa):"
      );
      break;

    case 3: // Eski narxi
      const originalPrice = parseFloat(msg.text);
      if (isNaN(originalPrice) || originalPrice <= 0) {
        userState.productData.originalPrice = price;
      } else {
        userState.productData.originalPrice = originalPrice;
        userState.productData.discount = Math.round(
          ((originalPrice - price) / originalPrice) * 100
        );
      }
      userState.step = 4;
      bot.sendMessage(msg.chat.id, "4️⃣ Mahsulot tavsifini kiriting:");
      break;

    case 4: // Tavsif
      userState.productData.description = msg.text;
      userState.step = 5;

      const categoryKeyboard = {
        inline_keyboard: [
          [
            { text: "Premium", callback_data: "category_premium" },
            { text: "Classic", callback_data: "category_classic" },
            { text: "Deluxe", callback_data: "category_deluxe" },
          ],
          [
            { text: "Organic", callback_data: "category_organic" },
            { text: "Limited", callback_data: "category_limited" },
          ],
        ],
      };

      bot.sendMessage(msg.chat.id, "5️⃣ Kategoriyani tanlang:", {
        reply_markup: categoryKeyboard,
      });
      break;

    case 5: // Kategoriya
      userState.productData.category = msg.text.toLowerCase();
      userState.step = 6;
      bot.sendMessage(msg.chat.id, "6️⃣ Mahsulot rasmini yuboring:");
      break;

    case 6: // Rasm
      if (msg.photo && msg.photo.length > 0) {
        const photo = msg.photo[msg.photo.length - 1];
        userState.productData.image = photo.file_id;
        userState.step = 7;

        // Mahsulot ma'lumotlarini ko'rsatish
        await showProductSummary(msg.chat.id, userState.productData);
      } else {
        bot.sendMessage(msg.chat.id, "❌ Rasm yuborilmadi! Qaytadan yuboring:");
      }
      break;
  }
}

// Mahsulot ma'lumotlarini ko'rsatish
async function showProductSummary(chatId, productData) {
  const summary = `
📋 *Mahsulot ma'lumotlari:*

🏷️ *Nomi:* ${productData.name}
💰 *Narxi:* ${productData.price.toLocaleString()} so'm
${
  productData.originalPrice
    ? `💸 *Eski narxi:* ${productData.originalPrice.toLocaleString()} so'm`
    : ""
}
${productData.discount ? `🎯 *Chegirma:* -${productData.discount}%` : ""}
📝 *Tavsif:* ${productData.description}
🏷️ *Kategoriya:* ${productData.category}
🖼️ *Rasm:* ✅

Mahsulotni saqlashni xohlaysizmi?
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: "✅ Saqlash", callback_data: "save_product" },
        { text: "❌ Bekor qilish", callback_data: "cancel_product_creation" },
      ],
    ],
  };

  bot.sendMessage(chatId, summary, {
    reply_markup: keyboard,
    parse_mode: "Markdown",
  });
}

// Mahsulotni saqlash
async function saveProduct(chatId, productData) {
  try {
    const product = new Product({
      ...productData,
      createdBy: chatId.toString(),
      tags: generateTags(productData.name, productData.description),
    });

    await product.save();

    // Kategoriya mahsulot sonini yangilash
    await Category.findOneAndUpdate(
      { slug: productData.category },
      { $inc: { productCount: 1 } }
    );

    bot.sendMessage(
      chatId,
      "✅ *Mahsulot muvaffaqiyatli saqlandi!*\n\nMahsulot endi Web App'da ko'rinadi.",
      { parse_mode: "Markdown" }
    );

    // User state'ni tozalash
    delete global.userStates[chatId];
  } catch (error) {
    console.error("Mahsulot saqlashda xatolik:", error);
    bot.sendMessage(chatId, "❌ Mahsulot saqlashda xatolik yuz berdi!");
  }
}

// Tag'larni yaratish
function generateTags(name, description) {
  const text = `${name} ${description}`.toLowerCase();
  const tags = [];

  const commonTags = [
    "aroma",
    "oqbilol",
    "tabiiy",
    "sifatli",
    "premium",
    "klassik",
  ];
  commonTags.forEach((tag) => {
    if (text.includes(tag)) {
      tags.push(tag);
    }
  });

  return tags;
}

// Buyurtmalar boshqaruvi
async function showOrderManagement(msg) {
  try {
    const pendingOrders = await Order.countDocuments({ status: "pending" });
    const confirmedOrders = await Order.countDocuments({ status: "confirmed" });
    const deliveringOrders = await Order.countDocuments({
      status: "delivering",
    });

    const stats = `
📊 *Buyurtmalar statistikasi:*

⏳ *Kutilayotgan:* ${pendingOrders}
✅ *Tasdiqlangan:* ${confirmedOrders}
🚚 *Yetkazilmoqda:* ${deliveringOrders}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "⏳ Kutilayotgan", callback_data: "orders_pending" },
          { text: "✅ Tasdiqlangan", callback_data: "orders_confirmed" },
        ],
        [
          { text: "🚚 Yetkazilmoqda", callback_data: "orders_delivering" },
          { text: "📋 Barchasi", callback_data: "orders_all" },
        ],
        [{ text: "🔙 Orqaga", callback_data: "admin_menu" }],
      ],
    };

    bot.sendMessage(msg.chat.id, stats, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Buyurtmalar statistikasini olishda xatolik:", error);
    bot.sendMessage(msg.chat.id, "❌ Ma'lumotlarni olishda xatolik!");
  }
}

// Statistika ko'rsatish
async function showStatistics(msg) {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalCategories = await Category.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    const stats = `
📈 *Umumiy statistika:*

🛍️ *Mahsulotlar:* ${totalProducts}
📁 *Kategoriyalar:* ${totalCategories}
📦 *Buyurtmalar:* ${totalOrders}
💰 *Jami tushum:* ${revenue.toLocaleString()} so'm
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: "📊 Batafsil", callback_data: "detailed_stats" },
          { text: "📅 Kunlik", callback_data: "daily_stats" },
        ],
        [{ text: "🔙 Orqaga", callback_data: "admin_menu" }],
      ],
    };

    bot.sendMessage(msg.chat.id, stats, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Statistikani olishda xatolik:", error);
    bot.sendMessage(msg.chat.id, "❌ Ma'lumotlarni olishda xatolik!");
  }
}

// Callback query handler
async function handleAdminCallback(query) {
  const { data, from } = query;
  const chatId = from.id;

  if (!isAdmin(chatId)) {
    return bot.answerCallbackQuery(query.id, "❌ Siz admin emassiz!");
  }

  try {
    switch (data) {
      case "admin_categories":
        await showCategoryManagement({ chat: { id: chatId } });
        break;

      case "admin_products":
        await showProductManagement({ chat: { id: chatId } });
        break;

      case "admin_post":
        await startProductCreation({ chat: { id: chatId } });
        break;

      case "admin_orders":
        await showOrderManagement({ chat: { id: chatId } });
        break;

      case "admin_stats":
        await showStatistics({ chat: { id: chatId } });
        break;

      case "admin_menu":
        await showAdminPanel({ chat: { id: chatId } });
        break;

      case "add_category":
        // Kategoriya qo'shish
        break;

      case "save_product":
        const userState = global.userStates[chatId];
        if (userState && userState.productData) {
          await saveProduct(chatId, userState.productData);
        }
        break;

      case "cancel_product_creation":
        delete global.userStates[chatId];
        bot.sendMessage(chatId, "❌ Mahsulot qo'shish bekor qilindi.");
        break;

      default:
        if (data.startsWith("category_")) {
          const category = data.replace("category_", "");
          const userState = global.userStates[chatId];
          if (userState) {
            userState.productData.category = category;
            userState.step = 6;
            bot.sendMessage(chatId, "6️⃣ Mahsulot rasmini yuboring:");
          }
        }
        break;
    }

    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error("Admin callback handler xatolik:", error);
    bot.answerCallbackQuery(query.id, "❌ Xatolik yuz berdi!");
  }
}

export {
  showAdminPanel,
  showCategoryManagement,
  showProductManagement,
  startProductCreation,
  handleProductCreation,
  showOrderManagement,
  showStatistics,
  handleAdminCallback,
};
