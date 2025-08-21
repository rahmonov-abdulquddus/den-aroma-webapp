// src/handlers/callbacks/userCallbacks.js

import { getTranslation } from "../../utils/i18n.js";
import categoryService from "../../services/categoryService.js";
import productService from "../../services/productService.js";
import userService from "../../services/userService.js";
import { mainMenuKeyboard } from "../../keyboards/mainMenu.js";
import {
  displayUserCategories,
  displayUserProducts,
  displayUserSelectedProduct,
} from "../../utils/adminUtils.js";

/**
 * Foydalanuvchi callback'larini boshqarish
 */
export const handleUserCallbacks = async (
  bot,
  callbackQuery,
  safeEditMessage
) => {
  const { data, from, message } = callbackQuery;
  const chatId = message.chat.id;
  const telegramId = from.id;
  const userLanguage = "uzbek";

  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  // Kategoriyani tanlash
  if (data.startsWith("user_select_category_")) {
    const categoryId = data.split("user_select_category_")[1];
    await displayUserProducts(bot, chatId, categoryId, 1);
    return true;
  }

  // Mahsulotlar sahifasini ko'rsatish
  if (data.startsWith("user_products_page_")) {
    const [categoryId, page] = data.split("user_products_page_")[1].split("_");
    await displayUserProducts(bot, chatId, categoryId, parseInt(page));
    return true;
  }

  // Mahsulotni tanlash
  if (data.startsWith("select_product_")) {
    const productId = data.split("select_product_")[1];
    await displayUserSelectedProduct(bot, chatId, productId);
    return true;
  }

  // Mahsulotni ko'rish
  if (data.startsWith("view_product_")) {
    const productId = data.split("view_product_")[1];
    await displayUserSelectedProduct(bot, chatId, productId);
    return true;
  }

  // Foydalanuvchi mahsulotlar ro'yxatiga qaytish
  if (data.startsWith("back_to_user_products_list_")) {
    const [categoryId, page] = data
      .split("back_to_user_products_list_")[1]
      .split("_");
    await displayUserProducts(bot, chatId, categoryId, parseInt(page));
    return true;
  }

  // Kategoriyalar sahifasini ko'rsatish
  if (data.startsWith("user_categories_page_")) {
    const page = parseInt(data.split("user_categories_page_")[1]);
    await displayUserCategories(bot, chatId, page);
    return true;
  }

  // Asosiy menyuga qaytish
  if (data === "back_to_main_menu") {
    await safeEditMessage(
      `🏠 <b>Asosiy menyu</b>\n\n` + `Quyidagi funksiyalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: mainMenuKeyboard(userLanguage),
      }
    );
    return true;
  }

  // Kategoriyalarga qaytish
  if (data === "back_to_categories") {
    await displayUserCategories(bot, chatId, 1);
    return true;
  }

  return false; // Bu callback bu faylda boshqarilmagan
};

