// src/utils/adminUtils.js

import { getTranslation } from "./i18n.js";
import categoryService from "../services/categoryService.js";
import productService from "../services/productService.js";
import userService from "../services/userService.js"; // Foydalanuvchi tilini olish uchun
import config from "../config/index.js"; // Admin IDni olish uchun
import adminService from "../services/adminService.js";
import deliveryPersonService from "../services/deliveryPersonService.js";
import mongoose from "mongoose"; // Kategoriya IDni ObjectId ga o'tkazish uchun
import Product from "../db/models/Product.js"; // Mahsulotlar uchun

// Keyboard importlari
import {
  manageCategoriesKeyboard, // Endi inline qaytaradi
  productCategorySelectionKeyboard, // Inline qaytaradi
} from "../keyboards/categoryMenu.js";
import { adminMainMenuInlineKeyboard } from "../keyboards/adminMenu.js"; // Inline admin menyusi

// Xavfsiz xabar tahrirlash funksiyasi
const safeEditMessage = async (bot, text, options = {}, chatId, messageId) => {
  try {
    await bot.editMessageText(text, {
      chat_id: chatId,
      message_id: messageId,
      ...options,
    });
  } catch (editError) {
    console.log(
      "Xabarni tahrirlashda xato, yangi xabar yuborilmoqda:",
      editError.message
    );
    // Xabarni tahrirlashda xato bo'lsa, yangi xabar yuborish
    await bot.sendMessage(chatId, text, options);
  }
};

// Admin foydalanuvchilarini tekshirish funksiyasi
export function isAdmin(telegramId) {
  // Faqat bitta admin ID ni tekshirish
  const adminIds = [5545483477];
  console.log("Admin tekshiruv:", {
    telegramId,
    type: typeof telegramId,
    adminIds,
  });
  return adminIds.includes(Number(telegramId));
}

// Dastavchi foydalanuvchilarini tekshirish funksiyasi
export async function isDeliveryPerson(telegramId) {
  try {
    const deliveryPerson = await deliveryPersonService.getDeliveryPersonById(
      telegramId
    );
    return !!deliveryPerson; // Agar dastavchi topilsa true, aks holda false
  } catch (error) {
    console.error("Dastavchi tekshirishda xato:", error.message);
    return false;
  }
}

// Admin uchun kategoriyalarni ko'rsatish
export const displayAdminCategories = async (
  bot,
  telegramId,
  messageIdToEdit = null
) => {
  const user = await userService.getUser(telegramId); // Foydalanuvchi ma'lumotlarini olish
  const userLanguage = user ? user.language : "uzbek"; // Tilni aniqlash
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const categories = await categoryService.getAllCategories();
    let messageText = `<b>${_getTranslation(
      "admin_manage_categories_prompt"
    )}</b>\n\n`;
    const inlineKeyboard = [];

    if (categories.length === 0) {
      messageText += _getTranslation("no_categories_found");
    } else {
      categories.forEach((cat) => {
        inlineKeyboard.push([
          { text: cat.name, callback_data: `admin_category_${cat._id}` },
        ]);
      });
    }

    // Asosiy kategoriya boshqaruv tugmalarini qo'shamiz (yangi kategoriya qo'shish, ko'rish)
    // manageCategoriesKeyboard() dan keladigan tugmalarni qo'shamiz
    const manageCatButtons =
      manageCategoriesKeyboard(userLanguage).inline_keyboard;
    inlineKeyboard.push(...manageCatButtons);

    const options = {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: "HTML",
    };

    // Agar messageIdToEdit berilsa, mavjud xabarni tahrirlash, aks holda yangi xabar yuborish
    if (messageIdToEdit) {
      try {
        await bot.editMessageText(messageText, {
          chat_id: telegramId,
          message_id: messageIdToEdit,
          ...options,
        });
      } catch (editError) {
        console.error("Xabarni tahrirlashda xato:", editError.message);
        // Tahrirlashda xato bo'lsa, yangi xabar yuborish
        await bot.sendMessage(telegramId, messageText, options);
      }
    } else {
      await bot.sendMessage(telegramId, messageText, options);
    }
  } catch (error) {
    console.error("Admin kategoriyalarini ko'rsatishda xato: ", error);
    await bot.sendMessage(
      telegramId,
      _getTranslation("error_loading_categories", {
        errorMessage: error.message,
      })
    );
  }
};

// Mahsulot qo'shish uchun kategoriyalarni tanlash
export const displayCategoriesForProduct = async (
  bot,
  telegramId,
  messageIdToEdit = null
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const categories = await categoryService.getAllCategories();
    if (categories.length === 0) {
      await bot.sendMessage(
        telegramId,
        _getTranslation("admin_no_categories_for_product"),
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: _getTranslation("back_to_admin_main"),
                  callback_data: "back_to_admin_main",
                },
              ],
            ],
          },
        }
      );
      return;
    }

    const keyboard = productCategorySelectionKeyboard(
      categories,
      userLanguage
    ).inline_keyboard;

    await bot.sendMessage(
      telegramId,
      _getTranslation("admin_select_category_for_product"),
      {
        reply_markup: { inline_keyboard: keyboard },
        parse_mode: "HTML",
      }
    );
  } catch (error) {
    console.error("Mahsulot uchun kategoriyalarni ko'rsatishda xato: ", error);
    await bot.sendMessage(
      telegramId,
      _getTranslation("error_loading_categories", {
        errorMessage: error.message,
      })
    );
  }
};

// Foydalanuvchi uchun kategoriyalarni sahifalab ko'rsatish
export const displayUserCategories = async (
  bot,
  telegramId,
  messageIdToEdit = null,
  page = 0
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const categories = await categoryService.getAllCategories();
    const categoriesPerPage = 5;
    const totalPages = Math.ceil(categories.length / categoriesPerPage);
    const startIndex = page * categoriesPerPage;
    const endIndex = Math.min(
      startIndex + categoriesPerPage,
      categories.length
    );
    const categoriesToShow = categories.slice(startIndex, endIndex);

    let messageText = `<b>${_getTranslation(
      "user_select_category_prompt"
    )}</b>\n\n`;
    const inlineKeyboard = [];

    if (categories.length === 0) {
      messageText += _getTranslation("no_categories_yet_user");
      inlineKeyboard.push([
        {
          text: _getTranslation("back_to_main_menu"),
          callback_data: "back_to_main_menu",
        },
      ]);
    } else {
      categoriesToShow.forEach((cat) => {
        inlineKeyboard.push([
          { text: cat.name, callback_data: `user_select_category_${cat._id}` },
        ]);
      });
      // Sahifalash tugmalari
      const paginationRow = [];
      if (page > 0) {
        paginationRow.push({
          text: `⬅️ ${_getTranslation("previous_page")}`,
          callback_data: `user_categories_page_${page - 1}`,
        });
      }
      if (page < totalPages - 1) {
        paginationRow.push({
          text: `${_getTranslation("next_page")} ➡️`,
          callback_data: `user_categories_page_${page + 1}`,
        });
      }
      if (paginationRow.length > 0) {
        inlineKeyboard.push(paginationRow);
      }
      inlineKeyboard.push([
        {
          text: _getTranslation("back_to_main_menu"),
          callback_data: "back_to_main_menu",
        },
      ]);
    }

    const options = {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: "HTML",
    };

    if (messageIdToEdit) {
      try {
        await bot.editMessageText(messageText, {
          chat_id: telegramId,
          message_id: messageIdToEdit,
          ...options,
        });
      } catch (editError) {
        console.error("Xabarni tahrirlashda xato:", editError.message);
        // Tahrirlashda xato bo'lsa, yangi xabar yuborish
        await bot.sendMessage(telegramId, messageText, options);
      }
    } else {
      await bot.sendMessage(telegramId, messageText, options);
    }
  } catch (error) {
    console.error("Foydalanuvchi kategoriyalarini ko'rsatishda xato: ", error);
    await bot.sendMessage(
      telegramId,
      _getTranslation("error_loading_categories", {
        errorMessage: error.message,
      })
    );
  }
};

// ADMIN uchun mahsulotlarni kategoriyalar bo'yicha ko'rsatish (kategoriya tanlash menyusi)
export const displayAdminProducts = async (
  bot,
  telegramId,
  messageIdToEdit = null
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const categories = await categoryService.getAllCategories();
    const allProducts = await productService.getAllProducts();

    let messageText = `📋 <b>Mahsulotlarni ko'rish</b>\n\n`;
    messageText += `📊 <b>Umumiy mahsulotlar:</b> ${allProducts.length} ta\n\n`;

    const inlineKeyboard = [];

    if (categories.length === 0) {
      messageText += "❌ Kategoriyalar yo'q. Avval kategoriya qo'shing.";
    } else {
      messageText += "📂 <b>Kategoriyalar bo'yicha ko'rish:</b>\n\n";

      // Har bir kategoriyadagi mahsulotlar sonini ko'rsatish
      for (const cat of categories) {
        // categoryId string emas, ObjectId bo'lishi kerak
        const categoryId = cat._id.toString();
        const productsInCategory = await productService.getProductsByCategoryId(
          categoryId
        );
        messageText += `• ${cat.name}: <b>${productsInCategory.length} ta</b>\n`;

        inlineKeyboard.push([
          {
            text: `${cat.name} (${productsInCategory.length})`,
            callback_data: `admin_view_products_in_category_${cat._id}`,
          },
        ]);
      }
    }

    // Barcha mahsulotlarni ko'rish tugmasi
    inlineKeyboard.push([
      {
        text: `📋 Barcha mahsulotlar (${allProducts.length})`,
        callback_data: `admin_view_products_in_category_all`,
      },
    ]);

    inlineKeyboard.push([
      {
        text: _getTranslation("back_to_admin_main"),
        callback_data: "back_to_admin_main",
      },
    ]);

    const options = {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: "HTML",
    };

    if (messageIdToEdit) {
      await bot.editMessageText(messageText, {
        chat_id: telegramId,
        message_id: messageIdToEdit,
        ...options,
      });
    } else {
      await bot.sendMessage(telegramId, messageText, options);
    }
  } catch (error) {
    console.error(
      "Admin mahsulotlarini kategoriyalar bo'yicha ko'rsatishda xato: ",
      error
    );
    await bot.sendMessage(
      telegramId,
      _getTranslation("error_loading_categories", {
        errorMessage: error.message,
      })
    );
  }
};

// Admin uchun mahsulotlarni kategoriya bo'yicha ko'rsatish
export const displayAdminProductsByCategory = async (
  bot,
  telegramId,
  categoryId,
  messageIdToEdit = null,
  page = 0
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    // Kategoriya ID bo'lsa, faqat o'sha kategoriyadagi mahsulotlarni olish
    let allProducts;
    let categoryName = "Barcha mahsulotlar";

    if (categoryId && categoryId !== "all") {
      // categoryId string bo'lsa, ObjectId ga o'tkazish
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        allProducts = await productService.getProductsByCategoryId(categoryId);
        const category = await categoryService.getCategoryById(categoryId);
        categoryName = category ? category.name : "Kategoriya";
      } else {
        // categoryId string bo'lsa, category string maydoni bo'yicha qidirish
        allProducts = await Product.find({ category: categoryId });
        categoryName = categoryId;
      }
    } else {
      allProducts = await productService.getAllProducts();
    }

    const productsPerPage = 5;
    const totalPages = Math.ceil(allProducts.length / productsPerPage);
    const startIndex = page * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, allProducts.length);
    const productsToShow = allProducts.slice(startIndex, endIndex);

    let messageText = `📋 <b>${categoryName}</b>\n\n`;
    messageText += `📊 <b>Mahsulotlar soni:</b> ${allProducts.length} ta\n\n`;

    const inlineKeyboard = [];

    if (allProducts.length === 0) {
      messageText += "❌ Bu kategoriyada mahsulotlar yo'q.";
      inlineKeyboard.push([
        {
          text: "🔙 Orqaga",
          callback_data: "view_products",
        },
      ]);
    } else {
      productsToShow.forEach((product, index) => {
        const productNumber = startIndex + index + 1;
        messageText += `<b>${productNumber}. ${product.name}</b>\n`;

        // Skidka ko'rsatish
        if (product.isDiscount && product.discountPrice) {
          messageText += `💰 <s>${product.price} so'm</s> → <b>${product.discountPrice} so'm</b>\n`;
        } else {
          messageText += `💰 ${product.price} so'm\n`;
        }

        if (product.description) {
          messageText += `📝 ${product.description.substring(0, 50)}...\n`;
        }
        messageText += `\n`;
      });

      if (totalPages > 1) {
        messageText += `📄 Sahifa ${page + 1}/${totalPages}\n\n`;
      }

      // Sahifa tugmalari
      if (totalPages > 1) {
        const paginationRow = [];
        const callbackCategoryId = categoryId || "all";

        if (page > 0) {
          paginationRow.push({
            text: "⬅️ Orqaga",
            callback_data: `admin_products_page_${
              page - 1
            }_${callbackCategoryId}`,
          });
        }
        if (page < totalPages - 1) {
          paginationRow.push({
            text: "Keyingi ➡️",
            callback_data: `admin_products_page_${
              page + 1
            }_${callbackCategoryId}`,
          });
        }
        if (paginationRow.length > 0) {
          inlineKeyboard.push(paginationRow);
        }
      }

      // Mahsulotni tahrirlash va o'chirish tugmalari
      productsToShow.forEach((product, index) => {
        const productNumber = startIndex + index + 1;
        inlineKeyboard.push([
          {
            text: `✏️ ${productNumber}. ${product.name}`,
            callback_data: `admin_edit_product_${product._id}`,
          },
          {
            text: "🗑️ O'chirish",
            callback_data: `admin_delete_product_${product._id}`,
          },
        ]);
      });
    }

    // Orqaga qaytish tugmasi
    inlineKeyboard.push([
      {
        text: "🔙 Kategoriyalarga qaytish",
        callback_data: "view_products",
      },
    ]);

    const options = {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: "HTML",
    };

    if (messageIdToEdit) {
      await bot.editMessageText(messageText, {
        chat_id: telegramId,
        message_id: messageIdToEdit,
        ...options,
      });
    } else {
      await bot.sendMessage(telegramId, messageText, options);
    }
  } catch (error) {
    console.error(
      "Admin mahsulotlarini kategoriya bo'yicha ko'rsatishda xato: ",
      error
    );
    await bot.sendMessage(telegramId, `❌ Xato: ${error.message}`);
  }
};

// Foydalanuvchi uchun mahsulotlarni sahifalab ko'rsatish
export const displayUserProducts = async (
  bot,
  telegramId,
  messageIdToEdit = null,
  page = 0,
  categoryId = null
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    // Kategoriya ID bo'lsa, faqat o'sha kategoriyadagi mahsulotlarni olish
    let allProducts;
    if (categoryId) {
      allProducts = await productService.getProductsByCategoryId(categoryId);
    } else {
      allProducts = await productService.getAllProducts();
    }

    const productsPerPage = 5;
    const totalPages = Math.ceil(allProducts.length / productsPerPage);
    const startIndex = page * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, allProducts.length);
    const productsToShow = allProducts.slice(startIndex, endIndex);

    let messageText = `🛍️ <b>Bizning mahsulotlarimiz:</b>\n\n`;
    const inlineKeyboard = [];

    if (allProducts.length === 0) {
      messageText =
        "🛍️ <b>Bizning mahsulotlarimiz:</b>\n\nAfsuski, hozircha mahsulotlar yo'q.";
      inlineKeyboard.push([
        {
          text: "🏠 Asosiy menyu",
          callback_data: "back_to_main_menu",
        },
      ]);
    } else {
      productsToShow.forEach((product, index) => {
        const productNumber = startIndex + index + 1;
        messageText += `<b>${productNumber}. ${product.name}</b>\n`;

        // Skidka ko'rsatish
        if (product.isDiscount && product.discountPrice) {
          messageText += `💰 <s>${product.price} so'm</s> → <b>${product.discountPrice} so'm</b>\n`;
        } else {
          messageText += `💰 ${product.price} so'm\n`;
        }

        if (product.description) {
          messageText += `📝 ${product.description.substring(0, 50)}...\n`;
        }
        messageText += `\n`;
      });

      // Mahsulotlar soni haqida ma'lumot
      if (categoryId) {
        const category = await categoryService.getCategoryById(categoryId);
        const categoryName = category ? category.name : "Kategoriya";
        messageText += `📊 <b>${categoryName}</b> kategoriyasida <b>${allProducts.length}</b> ta mahsulot\n\n`;
      } else {
        messageText += `📊 Jami <b>${allProducts.length}</b> ta mahsulot\n\n`;
      }

      if (totalPages > 1) {
        messageText += `📄 Sahifa ${page + 1}/${totalPages}\n\n`;
      }

      messageText += `📢 <b>Kanalimizga qo'shiling:</b> @denaroma_oqbilol`;

      // Sahifa tugmalari
      if (totalPages > 1) {
        const paginationRow = [];
        if (page > 0) {
          paginationRow.push({
            text: "⬅️ Orqaga",
            callback_data: `user_products_page_${page - 1}`,
          });
        }
        if (page < totalPages - 1) {
          paginationRow.push({
            text: "Keyingi ➡️",
            callback_data: `user_products_page_${page + 1}`,
          });
        }
        if (paginationRow.length > 0) {
          inlineKeyboard.push(paginationRow);
        }
      }

      // Raqam tugmalarini yaratish (5 ta qator)
      const numberButtons = [];
      const itemsPerRow = 5;

      for (let i = 0; i < allProducts.length; i += itemsPerRow) {
        const row = [];
        for (let j = 0; j < itemsPerRow && i + j < allProducts.length; j++) {
          row.push({
            text: `${i + j + 1}`,
            callback_data: `select_product_${allProducts[i + j]._id}`,
          });
        }
        numberButtons.push(row);
      }

      // Raqam tugmalarini qo'shish
      inlineKeyboard.push(...numberButtons);

      // Asosiy menyuga qaytish
      inlineKeyboard.push([
        {
          text: "🏠 Asosiy menyu",
          callback_data: "back_to_main_menu",
        },
      ]);
    }

    const options = {
      reply_markup: { inline_keyboard: inlineKeyboard },
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };

    // Agar messageIdToEdit berilsa, mavjud xabarni tahrirlash, aks holda yangi xabar yuborish
    if (messageIdToEdit) {
      try {
        await bot.editMessageText(messageText, {
          chat_id: telegramId,
          message_id: messageIdToEdit,
          ...options,
        });
      } catch (editError) {
        console.error("Xabarni tahrirlashda xato:", editError.message);
        // Tahrirlashda xato bo'lsa, yangi xabar yuborish
        await bot.sendMessage(telegramId, messageText, options);
      }
    } else {
      await bot.sendMessage(telegramId, messageText, options);
    }
  } catch (error) {
    console.error("Foydalanuvchi mahsulotlarini ko'rsatishda xato: ", error);
    await bot.sendMessage(
      telegramId,
      "Mahsulotlarni yuklashda xato yuz berdi. Iltimos, qaytadan urinib ko'ring."
    );
  }
};

// Foydalanuvchi uchun tanlangan mahsulotni ko'rsatish
export const displayUserSelectedProduct = async (
  bot,
  telegramId,
  product,
  messageIdToEdit = null,
  categoryId = null,
  page = 0
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  let messageText = `<b>${product.name}</b>\n\n`;

  messageText += `💰 <b>Narx: ${product.price} so'm</b>\n\n`;

  // Skidka ko'rsatish
  if (product.isDiscount && product.discountPrice) {
    messageText += `🔥 <b>Skidka narxi: ${product.discountPrice} so'm</b>\n`;
    messageText += `💸 <b>Chegirma: ${
      product.price - product.discountPrice
    } so'm</b>\n\n`;
  }

  if (product.description) {
    messageText += `📝 <b>Tavsif:</b>\n${product.description}\n\n`;
  }

  messageText += `📢 <b>Kanalimizga qo'shiling:</b> @denaroma_oqbilol`;

  // Orqaga qaytish callback_data'ni yaratish
  const backCallback =
    categoryId && page !== undefined
      ? `back_to_user_products_list_${categoryId}_${page}`
      : "back_to_user_products_list";

  const inlineKeyboard = [
    [
      {
        text: "🛒 Savatga qo'shish",
        callback_data: `add_to_cart_${product._id}`,
      },
    ],
    [
      {
        text: "⬅️ Orqaga qaytish",
        callback_data: backCallback,
      },
    ],
    [
      {
        text: "🏠 Asosiy menyu",
        callback_data: "back_to_main_menu",
      },
    ],
  ];

  const options = {
    reply_markup: { inline_keyboard: inlineKeyboard },
    parse_mode: "HTML",
  };

  // Agar rasm mavjud bo'lsa, rasm bilan birga yuborish
  if (product.imageFileId) {
    try {
      if (messageIdToEdit) {
        // Mavjud xabarni rasm bilan almashtirish
        await bot.editMessageMedia(
          {
            type: "photo",
            media: product.imageFileId,
            caption: messageText,
            parse_mode: "HTML",
          },
          {
            chat_id: telegramId,
            message_id: messageIdToEdit,
            reply_markup: { inline_keyboard: inlineKeyboard },
          }
        );
      } else {
        // Yangi rasm bilan xabar yuborish
        await bot.sendPhoto(telegramId, product.imageFileId, {
          caption: messageText,
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
      }
    } catch (photoError) {
      console.error("Rasm bilan yuborishda xato:", photoError);
      // Rasm bilan yuborishda xato bo'lsa, oddiy xabar yuborish
      if (messageIdToEdit) {
        try {
          await bot.editMessageText(messageText, {
            chat_id: telegramId,
            message_id: messageIdToEdit,
            ...options,
          });
        } catch (editError) {
          await bot.sendMessage(telegramId, messageText, options);
        }
      } else {
        await bot.sendMessage(telegramId, messageText, options);
      }
    }
  } else {
    // Rasm yo'q bo'lsa, oddiy xabar yuborish
    if (messageIdToEdit) {
      try {
        await bot.editMessageText(messageText, {
          chat_id: telegramId,
          message_id: messageIdToEdit,
          ...options,
        });
      } catch (editError) {
        await bot.sendMessage(telegramId, messageText, options);
      }
    } else {
      await bot.sendMessage(telegramId, messageText, options);
    }
  }
};

// Adminlar ro'yxatini ko'rsatish
export const displayAdminList = async (
  bot,
  telegramId,
  messageIdToEdit = null,
  page = 0,
  userLanguage = "uzbek"
) => {
  const user = await userService.getUser(telegramId);
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    // Hardcoded admin ID'larini olish
    const adminIds = [5545483477];

    // Bazadan admin ma'lumotlarini olish
    const allAdmins = await adminService.getAllAdmins();

    let adminsToShow, totalPages, startIndex, endIndex, totalAdmins;

    // Agar bazada adminlar yo'q bo'lsa, hardcoded ID'lar bilan adminlar yaratish
    if (allAdmins.length === 0) {
      // Hardcoded adminlar ro'yxatini yaratish
      const hardcodedAdmins = adminIds.map((id) => ({
        telegramId: id,
        firstName: "Super",
        lastName: "Admin",
        username: "admin1",
        role: "super_admin",
        isActive: true,
        addedAt: new Date(),
        permissions: {
          manageAdmins: true,
          manageDelivery: true,
          manageProducts: true,
          manageOrders: true,
          viewStatistics: true,
        },
      }));

      totalAdmins = hardcodedAdmins;
      const adminsPerPage = 5;
      totalPages = Math.ceil(hardcodedAdmins.length / adminsPerPage);
      startIndex = page * adminsPerPage;
      endIndex = Math.min(startIndex + adminsPerPage, hardcodedAdmins.length);
      adminsToShow = hardcodedAdmins.slice(startIndex, endIndex);
    } else {
      // Bazada adminlar bor bo'lsa, ularni ishlatish
      totalAdmins = allAdmins;
      const adminsPerPage = 5;
      totalPages = Math.ceil(allAdmins.length / adminsPerPage);
      startIndex = page * adminsPerPage;
      endIndex = Math.min(startIndex + adminsPerPage, allAdmins.length);
      adminsToShow = allAdmins.slice(startIndex, endIndex);
    }

    let messageText = `👥 <b>Adminlar ro'yxati</b>\n\n`;
    messageText += `📊 <b>Jami adminlar:</b> ${totalAdmins.length} ta\n\n`;

    const { adminListPaginationKeyboard } = await import(
      "../keyboards/settingsMenu.js"
    );

    if (totalAdmins.length === 0) {
      messageText += "❌ Adminlar yo'q.";
      if (messageIdToEdit) {
        await safeEditMessage(
          bot,
          messageText,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Adminlar boshqaruviga qaytish",
                    callback_data: "manage_admins",
                  },
                ],
              ],
            },
            parse_mode: "HTML",
          },
          telegramId,
          messageIdToEdit
        );
      } else {
        await bot.sendMessage(telegramId, messageText, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Adminlar boshqaruviga qaytish",
                  callback_data: "manage_admins",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        });
      }
      return;
    }

    // Adminlar ro'yxatini yaratish
    const adminButtons = [];

    adminsToShow.forEach((admin, index) => {
      const adminNumber = startIndex + index + 1;
      const roleText =
        admin.role === "super_admin"
          ? "👑 Super Admin"
          : admin.role === "admin"
          ? "🔑 Admin"
          : "👤 Moderator";
      const statusText = admin.isActive ? "✅ Faol" : "❌ Faol emas";

      messageText += `<b>${adminNumber}. ${admin.firstName} ${admin.lastName}</b>\n`;
      messageText += `🆔 ID: ${admin.telegramId}\n`;
      messageText += `📝 Username: @${admin.username || "yo'q"}\n`;
      messageText += `${roleText} | ${statusText}\n`;
      messageText += `📅 Qo'shilgan: ${new Date(
        admin.addedAt
      ).toLocaleDateString("uz-UZ")}\n\n`;

      // Har bir admin uchun tugmalar qo'shish
      adminButtons.push([
        {
          text: "🗑️ O'chirish",
          callback_data: `admin_delete_${admin.telegramId}`,
        },
      ]);
    });

    if (totalPages > 1) {
      messageText += `📄 Sahifa ${page + 1}/${totalPages}\n\n`;
    }

    // Keyboard yaratish
    const keyboard = {
      inline_keyboard: [
        ...adminButtons, // Admin tugmalari
        ...adminListPaginationKeyboard(page, totalPages, userLanguage)
          .inline_keyboard, // Sahifa tugmalari
      ],
    };

    if (messageIdToEdit) {
      await safeEditMessage(
        bot,
        messageText,
        {
          reply_markup: keyboard,
          parse_mode: "HTML",
        },
        telegramId,
        messageIdToEdit
      );
    } else {
      await bot.sendMessage(telegramId, messageText, {
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error("Adminlar ro'yxatini ko'rsatishda xato:", error);
    if (messageIdToEdit) {
      await safeEditMessage(
        bot,
        `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Adminlar boshqaruviga qaytish",
                  callback_data: "manage_admins",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        },
        telegramId,
        messageIdToEdit
      );
    } else {
      await bot.sendMessage(
        telegramId,
        `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Adminlar boshqaruviga qaytish",
                  callback_data: "manage_admins",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        }
      );
    }
  }
};

// Dastavchilar ro'yxatini ko'rsatish
export const displayDeliveryPersonList = async (
  bot,
  telegramId,
  messageIdToEdit = null,
  page = 0,
  userLanguage = "uzbek"
) => {
  const user = await userService.getUser(telegramId);
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const allDeliveryPersons =
      await deliveryPersonService.getAllDeliveryPersons();
    const deliveryPersonsPerPage = 5;
    const totalPages = Math.ceil(
      allDeliveryPersons.length / deliveryPersonsPerPage
    );
    const startIndex = page * deliveryPersonsPerPage;
    const endIndex = Math.min(
      startIndex + deliveryPersonsPerPage,
      allDeliveryPersons.length
    );
    const deliveryPersonsToShow = allDeliveryPersons.slice(
      startIndex,
      endIndex
    );

    let messageText = `🚚 <b>Dastavchilar ro'yxatini</b>\n\n`;
    messageText += `📊 <b>Jami dastavchilar:</b> ${allDeliveryPersons.length} ta\n\n`;

    const { deliveryPersonListPaginationKeyboard } = await import(
      "../keyboards/settingsMenu.js"
    );

    if (allDeliveryPersons.length === 0) {
      messageText += "❌ Dastavchilar yo'q.";
      if (messageIdToEdit) {
        await safeEditMessage(
          bot,
          messageText,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Dastavchilar boshqaruviga qaytish",
                    callback_data: "manage_delivery_persons",
                  },
                ],
              ],
            },
            parse_mode: "HTML",
          },
          telegramId,
          messageIdToEdit
        );
      } else {
        await bot.sendMessage(telegramId, messageText, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Dastavchilar boshqaruviga qaytish",
                  callback_data: "manage_delivery_persons",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        });
      }
      return;
    }

    // Dastavchilar ro'yxatini yaratish
    const deliveryButtons = [];

    deliveryPersonsToShow.forEach((deliveryPerson, index) => {
      const deliveryNumber = startIndex + index + 1;
      const statusText = deliveryPerson.isActive ? "✅ Faol" : "❌ Faol emas";
      const onlineText = deliveryPerson.isOnline ? "🟢 Online" : "🔴 Offline";
      const ratingText = `⭐ ${deliveryPerson.rating.toFixed(1)}`;

      messageText += `<b>${deliveryNumber}. ${deliveryPerson.firstName} ${deliveryPerson.lastName}</b>\n`;
      messageText += `🆔 ID: ${deliveryPerson.telegramId}\n`;
      messageText += `📝 Username: @${deliveryPerson.username || "yo'q"}\n`;
      messageText += `${statusText} | ${onlineText} | ${ratingText}\n`;
      messageText += `📦 Dastavkalar: ${deliveryPerson.completedDeliveries}/${deliveryPerson.totalDeliveries}\n`;
      messageText += `📅 Qo'shilgan: ${new Date(
        deliveryPerson.addedAt
      ).toLocaleDateString("uz-UZ")}\n\n`;

      // Har bir dastavchi uchun o'chirish tugmasi qo'shish
      deliveryButtons.push([
        {
          text: "🗑️ O'chirish",
          callback_data: `delivery_delete_${deliveryPerson.telegramId}`,
        },
      ]);
    });

    if (totalPages > 1) {
      messageText += `📄 Sahifa ${page + 1}/${totalPages}\n\n`;
    }

    // Keyboard yaratish
    const keyboard = {
      inline_keyboard: [
        ...deliveryButtons, // Dastavchi tugmalari
        ...deliveryPersonListPaginationKeyboard(page, totalPages, userLanguage)
          .inline_keyboard, // Sahifa tugmalari
      ],
    };

    if (messageIdToEdit) {
      await safeEditMessage(
        bot,
        messageText,
        {
          reply_markup: keyboard,
          parse_mode: "HTML",
        },
        telegramId,
        messageIdToEdit
      );
    } else {
      await bot.sendMessage(telegramId, messageText, {
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error("Dastavchilar ro'yxatini ko'rsatishda xato:", error);
    if (messageIdToEdit) {
      await safeEditMessage(
        bot,
        `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Dastavchilar boshqaruviga qaytish",
                  callback_data: "manage_delivery_persons",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        },
        telegramId,
        messageIdToEdit
      );
    } else {
      await bot.sendMessage(
        telegramId,
        `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Dastavchilar boshqaruviga qaytish",
                  callback_data: "manage_delivery_persons",
                },
              ],
            ],
          },
          parse_mode: "HTML",
        }
      );
      return;
    }
  }
};
