// src/handlers/productManagementHandler.js

import productService from "../services/productService.js";
import categoryService from "../services/categoryService.js";
import { suggestFromImageMeta } from "../utils/aiCategorySuggestion.js";

/**
 * Mahsulot boshqarish handleri
 * @param {TelegramBot} bot - Telegram bot instance
 */
export default function registerProductManagementHandler(bot) {
  // Mahsulot qo'shish jarayonini boshqarish
  const userStates = new Map();

  // Mahsulot qo'shish buyrug'i
  bot.onText(/\/addproduct|Mahsulot qo'shish/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Faqat admin uchun
    if (!isAdmin(userId)) {
      await bot.sendMessage(chatId, "❌ Bu buyruq faqat admin uchun!");
      return;
    }

    // Foydalanuvchi holatini o'rnatish
    userStates.set(userId, {
      step: "waiting_name",
      productData: {},
    });

    await bot.sendMessage(
      chatId,
      "🆕 Yangi mahsulot qo'shish\n\n" + "📝 Mahsulot nomini yuboring:"
    );
  });

  // Xabar qabul qilish
  bot.on("message", async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // Admin emas yoki holat yo'q bo'lsa
    if (!isAdmin(userId) || !userStates.has(userId)) {
      return;
    }

    const state = userStates.get(userId);

    // Rasm yuborilgan bo'lsa
    if (msg.photo) {
      if (state.step === "waiting_image") {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        state.productData.imageFileId = fileId;

        try {
          const imageUrl = await bot.getFileLink(fileId);
          state.productData.imageUrl = imageUrl;

          await bot.sendMessage(
            chatId,
            "✅ Rasm qabul qilindi!\n\n" +
              "💰 Mahsulot narxini yuboring (faqat raqam):"
          );
          state.step = "waiting_price";
          userStates.set(userId, state);
        } catch (error) {
          await bot.sendMessage(chatId, "❌ Rasmni olishda xato!");
        }
      }
      return;
    }

    // Matn xabar bo'lsa
    if (!text) return;

    switch (state.step) {
      case "waiting_name":
        state.productData.name = text;
        await bot.sendMessage(chatId, "📝 Mahsulot tavsifini yuboring:");
        state.step = "waiting_description";
        break;

      case "waiting_description":
        state.productData.description = text;
        await bot.sendMessage(chatId, "📸 Mahsulot rasmini yuboring:");
        state.step = "waiting_image";
        break;

      case "waiting_price":
        const price = parseInt(text.replace(/\D/g, ""));
        if (isNaN(price) || price <= 0) {
          await bot.sendMessage(
            chatId,
            "❌ Noto'g'ri narx! Faqat raqam kiriting:"
          );
          return;
        }
        state.productData.price = price;

        // Kategoriyalarni ko'rsatish
        const categories = await categoryService.getAllCategories();
        const categoryKeyboard = {
          inline_keyboard: [
            ...categories.map((cat) => [
              {
                text: cat.name,
                callback_data: `select_category_${cat._id}`,
              },
            ]),
            [
              {
                text: "❌ Kategoriyasiz",
                callback_data: "select_category_none",
              },
            ],
          ],
        };

        await bot.sendMessage(chatId, "📂 Kategoriyani tanlang:", {
          reply_markup: categoryKeyboard,
        });
        state.step = "waiting_category";
        break;
    }

    userStates.set(userId, state);
  });

  // Kategoriya tanlash
  bot.on("callback_query", async (query) => {
    const chatId = query.message.chat.id;
    const userId = query.from.id;
    const data = query.data;

    if (!isAdmin(userId) || !userStates.has(userId)) {
      return;
    }

    if (data.startsWith("select_category_")) {
      const state = userStates.get(userId);
      const categoryId = data.replace("select_category_", "");

      if (categoryId !== "none") {
        state.productData.categoryId = categoryId;
      }

      // Mahsulotni saqlash
      try {
        // createdBy ni qo'shamiz
        state.productData.createdBy = userId.toString();

        const product = await productService.addProduct(state.productData);

        await bot.editMessageText(
          `✅ Mahsulot muvaffaqiyatli qo'shildi!\n\n` +
            `📦 Nomi: ${product.name}\n` +
            `💰 Narxi: ${product.price} so'm\n` +
            `📝 Tavsif: ${product.description}\n` +
            `📂 Kategoriya: ${
              product.categoryId ? "Belgilangan" : "Kategoriyasiz"
            }`,
          {
            chat_id: chatId,
            message_id: query.message.message_id,
          }
        );

        // Holatni tozalash
        userStates.delete(userId);
      } catch (error) {
        await bot.editMessageText(
          `❌ Mahsulot qo'shishda xato: ${error.message}`,
          {
            chat_id: chatId,
            message_id: query.message.message_id,
          }
        );
      }
    }
  });

  // Mahsulotlarni ko'rish
  bot.onText(/\/products|Mahsulotlar/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isAdmin(userId)) {
      await bot.sendMessage(chatId, "❌ Bu buyruq faqat admin uchun!");
      return;
    }

    try {
      const products = await productService.getAllProducts();

      if (products.length === 0) {
        await bot.sendMessage(chatId, "📦 Mahsulotlar mavjud emas!");
        return;
      }

      let message = `📦 Jami ${products.length} ta mahsulot:\n\n`;

      products.slice(0, 10).forEach((product, index) => {
        message += `${index + 1}. ${product.name} - ${product.price} so'm\n`;
      });

      if (products.length > 10) {
        message += `\n... va ${products.length - 10} ta boshqa mahsulot`;
      }

      await bot.sendMessage(chatId, message);
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Xato: ${error.message}`);
    }
  });

  // Mahsulot qidirish
  bot.onText(/\/search (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const query = match[1];

    if (!isAdmin(userId)) {
      await bot.sendMessage(chatId, "❌ Bu buyruq faqat admin uchun!");
      return;
    }

    try {
      const products = await productService.searchProducts(query);

      if (products.length === 0) {
        await bot.sendMessage(
          chatId,
          `🔍 "${query}" uchun mahsulot topilmadi!`
        );
        return;
      }

      let message = `🔍 "${query}" uchun ${products.length} ta natija:\n\n`;

      products.slice(0, 5).forEach((product, index) => {
        message += `${index + 1}. ${product.name} - ${product.price} so'm\n`;
      });

      if (products.length > 5) {
        message += `\n... va ${products.length - 5} ta boshqa natija`;
      }

      await bot.sendMessage(chatId, message);
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Xato: ${error.message}`);
    }
  });
}

// Admin tekshirish funksiyasi
function isAdmin(userId) {
  const adminIds =
    process.env.ADMIN_IDS?.split(",").map((id) => parseInt(id.trim())) || [];
  return adminIds.includes(userId);
}
