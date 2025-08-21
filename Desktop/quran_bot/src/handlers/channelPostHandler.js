// src/handlers/channelPostHandler.js

import productService from "../services/productService.js";
import categoryService from "../services/categoryService.js";
import config from "../config/index.js";
import { suggestFromImageMeta } from "../utils/aiCategorySuggestion.js";

/**
 * Kanal postidan mahsulot import qilish handleri
 * @param {TelegramBot} bot - Telegram bot instance
 */
export default function registerChannelPostHandler(bot) {
  bot.on("channel_post", async (msg) => {
    try {
      // Kanal ID ni terminalga chiqarish
      console.log("Kanal postidan xabar keldi! Kanal ID:", msg.chat.id);
      // Faqat kerakli kanal uchun ishlasin
      const allowedChannelId = parseInt(
        process.env.IMPORT_CHANNEL_ID || config.IMPORT_CHANNEL_ID
      );
      if (msg.chat.id !== allowedChannelId) return;

      console.log(
        "✅ Guruhdan yangi post keldi - avtomatik qayta ishlanmoqda..."
      );

      if (!msg.photo || !msg.caption) return;

      // Rasm URLini olish
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const imageUrl = await bot.getFileLink(fileId);

      // Matnni satrlarga ajratamiz
      const lines = msg.caption
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // 1. Nomi: birinchi satr
      const name = lines[0];

      // 2. Narx: "Narxi:" so'zini qidiramiz
      const priceLine = lines.find((line) => /narxi/i.test(line));
      let price = null;
      if (priceLine) {
        const priceMatch = priceLine.match(/([\d\s']+)[^\d]*$/);
        price = priceMatch ? parseInt(priceMatch[1].replace(/\D/g, "")) : null;
      }

      // 3. Tavsif: narxdan oldingi barcha satrlar (ikkinchi satrdan narxgacha)
      const priceIndex = lines.findIndex((line) => /narxi/i.test(line));
      const description =
        priceIndex > 1 ? lines.slice(1, priceIndex).join(" ") : "";

      // 4. Kategoriya: "Kategoriya:" so'zini qidiramiz (ixtiyoriy)
      let categoryName = null;
      const categoryLine = lines.find((line) => /kategoriya/i.test(line));
      if (categoryLine) {
        const catMatch = categoryLine.match(/kategoriya\s*:?\s*(.+)/i);
        categoryName = catMatch ? catMatch[1].trim() : null;
      }

      if (!name || !price) {
        console.log("Postdan nom yoki narx topilmadi!");
        return;
      }

      // Rasm caption yoki fayl nomidan AI tag/kategoriya
      const imageMeta = suggestFromImageMeta(msg.caption, fileId);
      // Mahsulot nomi bo‘yicha dublikatni tekshirish
      const existing = await productService.getProductByName(name);
      if (existing) {
        console.log(`Dublikat mahsulot: ${name} (import qilinmadi)`);
        return;
      }
      // Kategoriya ID ni aniqlash yoki yaratish
      let categoryId = null;
      if (categoryName) {
        let category = await categoryService.getCategoryByName(categoryName);
        if (!category) {
          category = await categoryService.addCategory(categoryName);
        }
        categoryId = category._id;
      }
      // Kategoriya yo'q bo'lsa, kategoriyasiz mahsulot sifatida qo'shiladi

      // Mahsulotni ko'rib chiqish uchun bazaga qo'shish
      await productService.addProductFromChannel({
        categoryId, // null bo'lishi mumkin
        name,
        description,
        price,
        imageUrl,
        imageFileId: fileId, // file_id ni ham saqlaymiz
        stock: 1,
        // AI rasm meta
        suggestedCategory: imageMeta.category,
        tags: imageMeta.tags,
      });

      console.log(
        "Kanal postidan mahsulot ko'rib chiqish uchun qo'shildi:",
        name
      );
    } catch (err) {
      console.error("Kanal postidan mahsulot qo'shishda xato:", err);
    }
  });
}

/**
 * Guruhdan barcha mavjud postlarni o'qib chiqish va ularni bazaga qo'shish
 * @param {TelegramBot} bot - Telegram bot instance
 * @param {number} channelId - Guruh IDsi
 * @param {number} limit - O'qiladigan postlar soni (default: 100)
 * @returns {Promise<Object>} Natija: qo'shilgan, xato bo'lgan va o'tkazib yuborilgan postlar soni
 */
export async function importAllChannelPosts(bot, channelId, limit = 100) {
  console.log(`Guruhdan ${limit} ta postni o'qib chiqish boshlandi...`);

  let addedCount = 0;
  let errorCount = 0;
  let skippedCount = 0;
  let processedCount = 0;

  try {
    // Guruhdan postlarni olish - Telegram API orqali
    // Bot guruhda admin bo'lishi kerak va guruh o'qish huquqiga ega bo'lishi kerak
    let messages = [];

    // Guruhdan postlarni olish uchun maxsus metod
    try {
      // Guruh ma'lumotlarini olish
      const channelInfo = await bot.getChat(channelId);
      console.log(`Guruh ma'lumotlari: ${channelInfo.title}`);

      // Kanal yoki guruhdan postlarni olish
      console.log("Kanal/Guruhdan postlarni olishga harakat qilamiz...");

      try {
        // Avval kanal ma'lumotlarini tekshirish
        const chatInfo = await bot.getChat(channelId);
        console.log(`Chat turi: ${chatInfo.type}, Nomi: ${chatInfo.title}`);

        // Yangi yondashuv: foydalanuvchidan postlarni ko'chirib olishni so'rash
        console.log(
          "getUpdates cheklovlari tufayli foydalanuvchidan yordam so'raymiz..."
        );

        throw new Error(
          `📋 ${chatInfo.title} dan mahsulotlarni import qilish uchun:\n\n` +
            `💡 Yechim:\n` +
            `1. ${chatInfo.type}da mahsulot postlarini ko'chirib oling\n` +
            `2. Botga yuboring (forward qiling)\n` +
            `3. Bot ularni avtomatik qayta ishlaydi\n\n` +
            `🔧 Yoki ${chatInfo.type}da yangi mahsulot posti yuboring va bot uni avtomatik qayta ishlaydi.\n\n` +
            `📝 Post format: rasm + matn (nomi, tavsif, narx)`
        );
      } catch (getUpdatesError) {
        console.error("getUpdates xatosi:", getUpdatesError.message);
        throw new Error(
          "Guruhdan postlarni olish uchun foydalanuvchi yordami kerak.\n\n" +
            "💡 Yechim:\n" +
            "1. Guruhda mahsulot postlarini ko'chirib oling\n" +
            "2. Botga yuboring\n" +
            "3. Bot ularni avtomatik qayta ishlaydi\n\n" +
            "Yoki guruhda yangi mahsulot posti yuboring va bot uni avtomatik qayta ishlaydi.\n\n" +
            "🔧 Bot adminligini tekshirish uchun guruhda har qanday xabar yuboring."
        );
      }
    } catch (updateError) {
      console.error("Guruhdan postlarni olishda xato:", updateError.message);
      throw new Error(
        "Guruhdan postlarni olishda xato. Bot guruhda admin bo'lishi va o'qish huquqiga ega bo'lishi kerak.\n\n" +
          "💡 Yechim:\n" +
          "1. Guruhda mahsulot postlarini ko'chirib oling\n" +
          "2. Botga yuboring\n" +
          "3. Bot ularni avtomatik qayta ishlaydi\n\n" +
          "Yoki guruhda yangi mahsulot posti yuboring va bot uni avtomatik qayta ishlaydi."
      );
    }

    console.log(`${messages.length} ta post topildi`);

    // Har bir postni qayta ishlash
    for (const update of messages) {
      let msg;

      if (update.channel_post) {
        msg = update.channel_post;
      } else if (update.message) {
        msg = update.message;
      } else {
        continue;
      }

      processedCount++;

      try {
        // Faqat rasm va matn bor postlarni qayta ishlash
        if (!msg.photo || !msg.caption) {
          skippedCount++;
          continue;
        }

        // Rasm URLini olish
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        let imageUrl;
        try {
          imageUrl = await bot.getFileLink(fileId);
        } catch (fileError) {
          console.log(`Rasm faylini olishda xato: ${fileError.message}`);
          skippedCount++;
          continue;
        }

        // Matnni satrlarga ajratish
        const lines = msg.caption
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        // 1. Nomi: birinchi satr
        const name = lines[0];
        if (!name) {
          skippedCount++;
          continue;
        }

        // 2. Narx: "Narxi:" yoki "💸 Narxi:" so'zini qidirish
        const priceLine = lines.find((line) => /narxi/i.test(line));
        let price = null;
        if (priceLine) {
          const priceMatch = priceLine.match(/([\d\s']+)[^\d]*$/);
          price = priceMatch
            ? parseInt(priceMatch[1].replace(/\D/g, ""))
            : null;
        }

        // 3. Tavsif: narxdan oldingi barcha satrlar (emoji va matn)
        const priceIndex = lines.findIndex((line) => /narxi/i.test(line));
        let description = "";

        if (priceIndex > 1) {
          // Narxdan oldingi barcha satrlarni olish
          const descLines = lines.slice(1, priceIndex);
          description = descLines.join(" ");
        } else if (lines.length > 1) {
          // Agar narx topilmasa, ikkinchi satrdan boshlab olish
          description = lines.slice(1, 5).join(" "); // Faqat birinchi 5 ta satr
        }

        // 4. Kategoriya: avtomatik aniqlash yoki "Kategoriya:" so'zini qidirish
        let categoryName = null;

        // Avval "Kategoriya:" so'zini qidirish
        const categoryLine = lines.find((line) => /kategoriya/i.test(line));
        if (categoryLine) {
          const catMatch = categoryLine.match(/kategoriya\s*:?\s*(.+)/i);
          categoryName = catMatch ? catMatch[1].trim() : null;
        }

        // Agar kategoriya topilmasa, nomdan aniqlash
        if (!categoryName) {
          const productName = name.toLowerCase();
          if (productName.includes("atir") || productName.includes("parfum")) {
            categoryName = "Atirlar";
          } else if (
            productName.includes("sovun") ||
            productName.includes("shampun")
          ) {
            categoryName = "Kosmetika";
          } else if (
            productName.includes("krem") ||
            productName.includes("loshon")
          ) {
            categoryName = "Kosmetika";
          } else {
            categoryName = "Boshqa"; // Default kategoriya
          }
        }

        if (!name || !price) {
          console.log(`Post ${processedCount}: nom yoki narx topilmadi`);
          console.log(`Nomi: "${name}", Narxi: ${price}`);
          skippedCount++;
          continue;
        }

        console.log(`Mahsulot qayta ishlanmoqda: ${name} - ${price} so'm`);
        console.log(`Tavsif: ${description.substring(0, 100)}...`);
        console.log(`Kategoriya: ${categoryName}`);

        // Mahsulot allaqachon mavjudligini tekshirish
        const existingProduct = await productService.getProductByName(name);
        if (existingProduct) {
          console.log(`Mahsulot allaqachon mavjud: ${name}`);
          skippedCount++;
          continue;
        }

        // Kategoriya ID ni aniqlash yoki yaratish
        let categoryId = null;
        if (categoryName) {
          let category = await categoryService.getCategoryByName(categoryName);
          if (!category) {
            category = await categoryService.addCategory(categoryName);
          }
          categoryId = category._id;
        }
        // Kategoriya yo'q bo'lsa, kategoriyasiz mahsulot sifatida qo'shiladi

        // Mahsulotni bazaga qo'shish
        await productService.addProduct({
          categoryId,
          name,
          description,
          price,
          imageUrl,
          imageFileId: fileId, // file_id ni ham saqlaymiz
          stock: 1,
        });

        addedCount++;
        console.log(`✅ Mahsulot qo'shildi: ${name} (${price} so'm)`);

        // Telegram API limitlarini oshirmaslik uchun kichik kechikish
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        errorCount++;
        console.error(
          `Post ${processedCount} ni qayta ishlashda xato:`,
          error.message
        );
      }
    }

    console.log(`\n📊 Natija:`);
    console.log(`✅ Qo'shilgan: ${addedCount}`);
    console.log(`❌ Xatolar: ${errorCount}`);
    console.log(`⏭️ O'tkazib yuborilgan: ${skippedCount}`);
    console.log(`📝 Jami qayta ishlangan: ${processedCount}`);

    return {
      added: addedCount,
      errors: errorCount,
      skipped: skippedCount,
      processed: processedCount,
    };
  } catch (error) {
    console.error("Guruhdan postlarni olishda xato:", error);
    throw error;
  }
}

/**
 * Admin buyrug'i orqali guruhdan barcha postlarni import qilish
 * @param {TelegramBot} bot - Telegram bot instance
 * @param {number} adminId - Admin Telegram IDsi
 * @param {number} channelId - Guruh IDsi
 * @param {number} limit - O'qiladigan postlar soni
 */
export async function handleImportAllPosts(
  bot,
  adminId,
  channelId,
  limit = 100
) {
  try {
    await bot.sendMessage(
      adminId,
      `🔄 Guruhdan ${limit} ta postni o'qib chiqish boshlandi...`
    );

    const result = await importAllChannelPosts(bot, channelId, limit);

    const message =
      `✅ Import yakunlandi!\n\n` +
      `📊 Natija:\n` +
      `✅ Qo'shilgan: ${result.added}\n` +
      `❌ Xatolar: ${result.errors}\n` +
      `⏭️ O'tkazib yuborilgan: ${result.skipped}\n` +
      `📝 Jami qayta ishlangan: ${result.processed}`;

    await bot.sendMessage(adminId, message);
  } catch (error) {
    console.error("Import jarayonida xato:", error);
    await bot.sendMessage(
      adminId,
      `❌ Import jarayonida xato: ${error.message}`
    );
  }
}
