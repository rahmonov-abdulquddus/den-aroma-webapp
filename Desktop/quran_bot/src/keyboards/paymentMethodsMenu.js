// src/keyboards/paymentMethodsMenu.js

import { getTranslation } from "../utils/i18n.js";

export const paymentMethodsMenu = (userLanguage = "uzbek") => {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: _("payment_methods.cash_on_delivery"),
            callback_data: "payment_cash",
          },
        ],
        [
          {
            text: _("payment_methods.card_payment"),
            callback_data: "payment_card",
          },
        ],
        [{ text: _("cancel_action"), callback_data: "cancel" }],
      ],
    },
  };
};
