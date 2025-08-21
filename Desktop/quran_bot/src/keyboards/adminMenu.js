// src/keyboards/adminMenu.js

import { getTranslation } from "../utils/i18n.js";

// Asosiy admin menyusini inline keyboard shaklida yaratamiz
export function adminMainMenuInlineKeyboard(
  userLanguage = "uzbek",
  pendingCount = 0
) {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  return {
    inline_keyboard: [
      [
        { text: _("admin_manage_products"), callback_data: "manage_products" },
        {
          text: _("admin_manage_categories"),
          callback_data: "manage_categories",
        },
      ],
      [
        { text: _("admin_send_message"), callback_data: "send_message" },
        {
          text: "🔥 Skidka post yuborish",
          callback_data: "send_discount_post",
        },
      ],
      [{ text: "📝 Post tashlash", callback_data: "send_post" }],
      [
        {
          text: "📋 Kategoriyasiz mahsulotlar",
          callback_data: "uncategorized_products",
        },
      ],
      [
        {
          text: `🔍 Ko'rib chiqish kerak${
            pendingCount > 0 ? ` (${pendingCount})` : ""
          }`,
          callback_data: "review_pending_products",
        },
      ],
      [{ text: "⚙️ Sozlamalar", callback_data: "admin_settings_new" }],
      [{ text: "📊 Trend va statistika", callback_data: "admin_trend_stats" }],
      [{ text: "⭐ Mijoz fikrlari", callback_data: "view_feedbacks" }],
      [
        {
          text: "🏠 Asosiy menyuga qaytish",
          callback_data: "admin_to_main_menu",
        },
      ],
    ],
  };
}

// Agar Reply keyboard kerak bo'lsa (lekin tavsiya etilmaydi, faqat start buyrug'i uchun)
export const adminMainMenuKeyboard = (userLanguage = "uzbek") => {
  // <<< userLanguage qo'shildi
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage); // Tilni uzatish
  return {
    reply_markup: {
      keyboard: [
        [
          { text: _("admin_menu.manage_categories") },
          { text: _("admin_menu.manage_products") },
        ],
        [
          { text: _("admin_menu.view_orders") },
          { text: _("admin_menu.send_message") },
        ],
        [
          { text: _("admin_menu.settings") },
          { text: _("admin_menu.back_to_main") },
        ],
      ],
      resize_keyboard: true,
    },
  };
};

export const manageProductsKeyboard = (userLanguage = "uzbek") => {
  // <<< userLanguage qo'shildi
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage); // Tilni uzatish
  return {
    inline_keyboard: [
      // Mahsulotlarni boshqarish ham inline bo'lishi kerak
      [{ text: _("admin_menu.add_product"), callback_data: "add_product" }],
      [{ text: _("admin_menu.view_products"), callback_data: "view_products" }],
      [{ text: _("back_to_admin_main"), callback_data: "back_to_admin_main" }],
    ],
  };
};
