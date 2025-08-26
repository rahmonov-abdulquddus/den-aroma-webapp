// src/app.js

import TelegramBot from "node-telegram-bot-api";
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import config from "./config.js";

// Handler funksiyalarini to'g'ri import qilish
import handleMessage from "./handlers/messageHandler.js";
import handleCallbackQuery from "./handlers/callbackQueryHandler.js";
import { setupCommands } from "./handlers/commandHandler.js"; // setupCommands ni import qilamiz
import userService from "./services/userService.js"; // Foydalanuvchi tilini olish uchun
import productService from "./services/productService.js"; // Mahsulotlar uchun
import categoryService from "./services/categoryService.js"; // Kategoriyalar uchun
import orderService from "./services/orderService.js"; // Buyurtmalar uchun
import cartService from "./services/cartService.js"; // Savatcha uchun
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

// Express server yaratish
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Telegram bot instansiyasini yaratish
const bot = new TelegramBot(config.telegramBotToken, { polling: true });

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Mahsulotlar API
app.get("/api/products", async (req, res) => {
  try {
    const { needsReview, categoryId, isActive } = req.query;

    let products;

    // Ko'rib chiqish kerak bo'lgan mahsulotlar
    if (needsReview === "true") {
      products = await productService.getProductsByStatus({
        needsReview: true,
      });
    }
    // Faqat faol mahsulotlar
    else if (isActive === "true") {
      products = await productService.getProductsByStatus({ isActive: true });
    }
    // Kategoriya bo'yicha filtrlash
    else if (categoryId) {
      products = await productService.getProductsByCategoryId(categoryId);
    }
    // Barcha mahsulotlar
    else {
      products = await productService.getAllProducts();
    }

    res.json(products);
  } catch (error) {
    console.error("Mahsulotlarni olishda xatolik:", error);
    res.status(500).json({ error: "Mahsulotlarni olishda xatolik" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Mahsulot topilmadi" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Mahsulotni olishda xatolik" });
  }
});

// Mahsulot qo'shish API
app.post("/api/products", async (req, res) => {
  try {
    const productData = req.body;
    const product = await productService.addProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error("Mahsulot qo'shishda xatolik:", error);
    res.status(500).json({ error: "Mahsulot qo'shishda xatolik" });
  }
});

// Mahsulot tahrirlash API
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await productService.updateProduct(id, updateData);
    res.json(product);
  } catch (error) {
    console.error("Mahsulot tahrirlashda xatolik:", error);
    res.status(500).json({ error: "Mahsulot tahrirlashda xatolik" });
  }
});

// Mahsulot o'chirish API
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.json({ message: "Mahsulot muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("Mahsulot o'chirishda xatolik:", error);
    res.status(500).json({ error: "Mahsulot o'chirishda xatolik" });
  }
});

// Kategoriyalar API
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Kategoriyalarni olishda xatolik" });
  }
});

// Kategoriya qo'shish API
app.post("/api/categories", async (req, res) => {
  try {
    const categoryData = req.body;
    const category = await categoryService.addCategory(categoryData);
    res.status(201).json(category);
  } catch (error) {
    console.error("Kategoriya qo'shishda xatolik:", error);
    res.status(500).json({ error: "Kategoriya qo'shishda xatolik" });
  }
});

// Kategoriya tahrirlash API
app.put("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const category = await categoryService.updateCategory(id, updateData);
    res.json(category);
  } catch (error) {
    console.error("Kategoriya tahrirlashda xatolik:", error);
    res.status(500).json({ error: "Kategoriya tahrirlashda xatolik" });
  }
});

// Kategoriya o'chirish API
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await categoryService.deleteCategory(id);
    res.json({ message: "Kategoriya muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.error("Kategoriya o'chirishda xatolik:", error);
    res.status(500).json({ error: "Kategoriya o'chirishda xatolik" });
  }
});

// Buyurtmalar API
app.post("/api/orders", async (req, res) => {
  try {
    const orderData = req.body;
    const order = await orderService.createOrder(orderData);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Buyurtma yaratishda xatolik" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Buyurtmani olishda xatolik" });
  }
});

// Foydalanuvchilar API
app.post("/api/users", async (req, res) => {
  try {
    const userData = req.body;
    const user = await userService.createUser(userData);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Foydalanuvchi yaratishda xatolik" });
  }
});

app.get("/api/users/:telegramId", async (req, res) => {
  try {
    const user = await userService.getUserByTelegramId(req.params.telegramId);
    if (!user) {
      return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Foydalanuvchini olishda xatolik" });
  }
});

// Savatcha API
app.post("/api/cart/add", async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, productId, quantity);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Savatchaga qo'shishda xatolik" });
  }
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const cart = await cartService.getUserCart(req.params.userId);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: "Savatchani olishda xatolik" });
  }
});

// Express server ni ishga tushirish
app.listen(PORT, () => {
  console.log(`Express server ${PORT} portda ishga tushdi`);
});

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
