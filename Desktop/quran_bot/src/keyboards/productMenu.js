// src/keyboards/productMenu.js

import { getTranslation } from "../utils/i18n.js";

// Mahsulotlarni boshqarish klaviaturasi (ReplyKeyboard)
export const manageProductsKeyboard = () => {
  return {
    reply_markup: {
      keyboard: [
        [
          { text: getTranslation("admin_menu.add_product") },
          { text: getTranslation("admin_menu.view_products") },
        ],
        [{ text: getTranslation("admin_menu.back_to_main") }], // Admin menyusiga qaytish
      ],
      resize_keyboard: true,
    },
  };
};

// Mahsulot sahifalash klaviaturasi (InlineKeyboard)
export const productPaginationKeyboard = (currentPage, totalPages) => {
  const keyboard = [];
  const buttons = [];

  if (currentPage > 1) {
    buttons.push({
      text: getTranslation("previous_page"),
      callback_data: `prev_page_${currentPage - 1}`,
    });
  }
  if (currentPage < totalPages) {
    buttons.push({
      text: getTranslation("next_page"),
      callback_data: `next_page_${currentPage + 1}`,
    });
  }

  if (buttons.length > 0) {
    keyboard.push(buttons);
  }

  // Bu klaviatura mahsulot ro'yxatidan kategoriyaga qaytish uchun
  keyboard.push([
    {
      text: getTranslation("back_to_categories"),
      callback_data: "back_to_categories",
    },
  ]);

  return {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  };
};

// Mahsulot tafsilotlari uchun inline klaviatura (Savatga qo'shish va qaytish)
export const productDetailsKeyboard = (productId) => {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: getTranslation("add_to_cart"),
            callback_data: `add_to_cart_${productId}`,
          },
        ],
        [
          {
            text: getTranslation("back_to_main_menu_button_text"),
            callback_data: "back_to_main_menu",
          },
        ],
      ],
    },
  };
};
