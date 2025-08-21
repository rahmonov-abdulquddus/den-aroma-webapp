// src/keyboards/universalKeyboards.js

import { getTranslation } from "../utils/i18n.js";

export function backKeyboard(_) {
  return {
    inline_keyboard: [
      [
        {
          text: _("back_to_main_menu_button_text"),
          callback_data: "back_to_main_menu",
        },
      ],
    ],
  };
}

/**
 * Bekor qilish tugmasi bo'lgan universal inline keyboardni qaytaradi.
 * @param {string} userLanguage - Foydalanuvchi tili.
 * @param {string} callbackData - Bekor qilish tugmasi uchun callback data.
 * @returns {Array<Array<Object>>} Inline keyboard array.
 */
export const cancelKeyboard = (
  userLanguage,
  callbackData = "cancel_action"
) => {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  return [[{ text: _("cancel_action_button"), callback_data: callbackData }]];
};

/**
 * Amalni tasdiqlash/bekor qilish uchun universal inline keyboardni qaytaradi.
 * @param {string} confirmCallbackPrefix - Tasdiqlash callback prefixi (masalan, 'confirm_delete_category').
 * @param {string} itemId - Amaliyot bajarilayotgan element IDsi.
 * @param {string} userLanguage - Foydalanuvchi tili.
 * @returns {Array<Array<Object>>} Inline keyboard array.
 */
export const cancelConfirmKeyboard = (
  confirmCallbackPrefix,
  itemId,
  userLanguage
) => {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  return [
    [
      { text: _("yes"), callback_data: `${confirmCallbackPrefix}_${itemId}` },
      {
        text: _("no"),
        callback_data: `cancel_${confirmCallbackPrefix}_${itemId}`,
      }, // Bekor qilish uchun alohida callback
    ],
  ];
};

/**
 * O'chirishni tasdiqlash uchun universal inline keyboardni qaytaradi.
 * Asosan deleteConfirmKeyboard sifatida ishlatiladi.
 * @param {string} confirmCallbackPrefix - Tasdiqlash callback prefixi (masalan, 'confirm_delete_category').
 * @param {string} itemId - Amaliyot bajarilayotgan element IDsi.
 * @param {string} userLanguage - Foydalanuvchi tili.
 * @returns {Array<Array<Object>>} Inline keyboard array.
 */
export const deleteConfirmKeyboard = (
  confirmCallbackPrefix,
  itemId,
  userLanguage
) => {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  return [
    [
      { text: _("yes"), callback_data: `${confirmCallbackPrefix}_${itemId}` },
      { text: _("no"), callback_data: `cancel_delete_category_${itemId}` }, // Kategoriyani o'chirishni bekor qilish uchun aniq callback
    ],
  ];
};

// Bu yerga boshqa universal keyboard funksiyalarini qo'shishingiz mumkin
