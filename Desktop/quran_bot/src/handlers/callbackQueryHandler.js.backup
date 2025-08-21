// src/handlers/callbackQueryHandler.js

import { getTranslation } from "../utils/i18n.js";
import botStateInstance from "../utils/state.js";
import { mainMenuKeyboard } from "../keyboards/mainMenu.js";
import { handleAllCallbacks } from "./callbacks/index.js";

/**
 * Bu funksiya Telegram callback querylarini boshqaradi.
 * Callback querylar inline tugmalar bosilganda yuboriladi.
 * @param {Object} bot - Telegram bot instansi.
 * @param {Object} callbackQuery - Kelgan callback query obyekti.
 */
const callbackQueryHandler = async (bot, callbackQuery) => {
  const { id, from, message, data } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;
  const telegramId = from.id;
  const userLanguage = "uzbek";

  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  const userState = botStateInstance;
  const currentState = userState.getState(telegramId);

  console.log(
    `Callback keldi: "${data}" (${telegramId}), Hozirgi holat: "${currentState}"`
  );

  // Xavfsiz xabar tahrirlash funksiyasi
  const safeEditMessage = async (text, options = {}) => {
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

  try {
    // Barcha callback'larni yangi tuzilishda boshqarish
    const handled = await handleAllCallbacks(
      bot,
      callbackQuery,
      safeEditMessage
    );

    if (handled) {
      return; // Callback muvaffaqiyatli boshqarildi
    }

    // Agar hech qaysi callback handler'da boshqarilmagan bo'lsa
    await bot.sendMessage(chatId, _getTranslation("unknown_command_general"));
  } catch (error) {
    console.error("Callback Queryni qayta ishlashda xato: ", error);
    await bot.sendMessage(
      chatId,
      _getTranslation("error_occurred", { errorMessage: error.message })
    );
    // Xato yuz berganda foydalanuvchini asosiy menyuga qaytarish
    await bot.sendMessage(
      chatId,
      _getTranslation("main_menu_prompt"),
      mainMenuKeyboard(userLanguage)
    );
    botStateInstance.setState(telegramId, "main_menu");
  }
};

export default callbackQueryHandler;

