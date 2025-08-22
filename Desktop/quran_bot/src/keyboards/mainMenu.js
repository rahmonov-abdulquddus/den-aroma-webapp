// src/keyboards/mainMenu.js

import { getTranslation } from "../utils/i18n.js";
// userService ni olib tashladim, chunki getTranslation endi tilni parametr sifatida oladi
// import userService from '../services/userService.js'; // Bu yerda keraksiz

// Asosiy menyu (reply keyboard)
export function mainMenuKeyboard(userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  return {
    reply_markup: {
      keyboard: [
        [
          {
            text: "🛍️ Mahsulotlar katalogi",
            web_app: { url: "https://rahmonov-abdulquddus.github.io/den-aroma-webapp" },
          },
        ],
        [
          { text: _("main_menu.cart") },
          { text: _("main_menu.search_products") },
        ],
        [{ text: _("main_menu.contact") }, { text: "📚 Ko'rsatmalar" }],
        [{ text: "❓ FAQ" }, { text: "👑 Admin" }],
      ],
      resize_keyboard: true,
    },
  };
}

// Tilni tanlash menyusi (reply keyboard)
export const languageSelectionKeyboard = (userLanguage = "uzbek") => {
  // <<< userLanguage parametri qo'shildi
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage); // Tilni uzatish
  const languages = _("languages"); // 'i18n.js' dan tillar ro'yxatini olamiz

  const keyboardRows = Object.values(languages).map((langName) => [
    { text: langName },
  ]);

  return {
    reply_markup: {
      keyboard: keyboardRows,
      resize_keyboard: true,
      one_time_keyboard: true, // Bir marta ishlatilgandan so'ng yopiladi
    },
  };
};
