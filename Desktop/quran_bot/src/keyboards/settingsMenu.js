// src/keyboards/settingsMenu.js

import { getTranslation } from "../utils/i18n.js";

// Asosiy sozlamalar menyusi
export function settingsMainMenuInlineKeyboard(userLanguage = "uzbek") {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  return {
    inline_keyboard: [
      [
        {
          text: "👥 Adminlar boshqaruvi",
          callback_data: "manage_admins",
        },
      ],
      [
        {
          text: "🚚 Dastavchilar boshqaruvi",
          callback_data: "manage_delivery_persons",
        },
      ],
      [
        {
          text: "⚙️ Dastavka sozlamalari",
          callback_data: "delivery_settings",
        },
      ],
      [
        {
          text: "🏪 Do'kon sozlamalari",
          callback_data: "shop_settings",
        },
      ],

      [
        {
          text: "🔙 Admin paneliga qaytish",
          callback_data: "back_to_admin_main",
        },
      ],
    ],
  };
}

// Adminlar boshqaruvi menyusi
export function manageAdminsMenuInlineKeyboard(userLanguage = "uzbek") {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  return {
    inline_keyboard: [
      [
        {
          text: "➕ Yangi admin qo'shish",
          callback_data: "add_new_admin",
        },
      ],
      [
        {
          text: "📋 Adminlar ro'yxati",
          callback_data: "list_admins",
        },
      ],
      [
        {
          text: "🔙 Sozlamalarga qaytish",
          callback_data: "admin_settings_new",
        },
      ],
    ],
  };
}

// Dastavchilar boshqaruvi menyusi
export function manageDeliveryPersonsMenuInlineKeyboard(
  userLanguage = "uzbek"
) {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  return {
    inline_keyboard: [
      [
        {
          text: "➕ Yangi dastavchi qo'shish",
          callback_data: "add_new_delivery_person",
        },
      ],
      [
        {
          text: "📋 Dastavchilar ro'yxati",
          callback_data: "list_delivery_persons",
        },
      ],
      [
        {
          text: "🔙 Sozlamalarga qaytish",
          callback_data: "admin_settings_new",
        },
      ],
    ],
  };
}

// Dastavka sozlamalari menyusi
export function deliverySettingsMenuInlineKeyboard(userLanguage = "uzbek") {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  return {
    inline_keyboard: [
      [
        {
          text: "💰 Dastavka narxi",
          callback_data: "delivery_price_settings",
        },
      ],
      [
        {
          text: "🕐 Ish vaqti",
          callback_data: "working_hours_settings",
        },
      ],
      [
        {
          text: "🗺️ Dastavka zonasi",
          callback_data: "delivery_zones_settings",
        },
      ],
      [
        {
          text: "🔙 Sozlamalarga qaytish",
          callback_data: "admin_settings_new",
        },
      ],
    ],
  };
}

// Admin ro'yxati uchun sahifa tugmalari
export function adminListPaginationKeyboard(
  page,
  totalPages,
  userLanguage = "uzbek"
) {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  const keyboard = [];

  if (totalPages > 1) {
    const paginationRow = [];
    if (page > 0) {
      paginationRow.push({
        text: "⬅️ Orqaga",
        callback_data: `admin_list_page_${page - 1}`,
      });
    }
    if (page < totalPages - 1) {
      paginationRow.push({
        text: "Keyingi ➡️",
        callback_data: `admin_list_page_${page + 1}`,
      });
    }
    if (paginationRow.length > 0) {
      keyboard.push(paginationRow);
    }
  }

  keyboard.push([
    {
      text: "🔙 Adminlar boshqaruviga qaytish",
      callback_data: "manage_admins",
    },
  ]);

  return { inline_keyboard: keyboard };
}

// Dastavchilar ro'yxati uchun sahifa tugmalari
export function deliveryPersonListPaginationKeyboard(
  page,
  totalPages,
  userLanguage = "uzbek"
) {
  const _ = (key) => getTranslation(key, {}, userLanguage);
  const keyboard = [];

  if (totalPages > 1) {
    const paginationRow = [];
    if (page > 0) {
      paginationRow.push({
        text: "⬅️ Orqaga",
        callback_data: `delivery_list_page_${page - 1}`,
      });
    }
    if (page < totalPages - 1) {
      paginationRow.push({
        text: "Keyingi ➡️",
        callback_data: `delivery_list_page_${page + 1}`,
      });
    }
    if (paginationRow.length > 0) {
      keyboard.push(paginationRow);
    }
  }

  keyboard.push([
    {
      text: "🔙 Dastavchilar boshqaruviga qaytish",
      callback_data: "manage_delivery_persons",
    },
  ]);

  return { inline_keyboard: keyboard };
}
