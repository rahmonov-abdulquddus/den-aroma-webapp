// src/keyboards/cartMenu.js

import { getTranslation } from "../utils/i18n.js";

export function cartMenuKeyboard(userLanguage, _) {
  return {
    inline_keyboard: [
      [
        { text: _("checkout"), callback_data: "checkout" },
        { text: _("clear_cart"), callback_data: "clear_cart" },
      ],
      [
        {
          text: _("back_to_main_menu_button_text"),
          callback_data: "back_to_main_menu",
        },
      ],
    ],
  };
}

export const emptyCartKeyboard = (userLanguage = "uzbek") => {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: _("back_to_main_menu"), callback_data: "back_to_main_menu" }],
      ],
    },
  };
};
