// src/utils/errorHandler.js

import { getTranslation } from './i18n.js'; // i18n ga yo'l

const errorHandler = {
    /**
     * Xatolarni konsolga yozadi va foydalanuvchiga xabar yuboradi.
     * @param {object} bot - Telegram bot instansi.
     * @param {number} telegramId - Foydalanuvchining Telegram IDsi.
     * @param {Error} error - Yuzaga kelgan xato obyekti.
     * @param {string} [contextMessage="Umumiy xato"] - Xato sodir bo'lgan kontekst haqida qo'shimcha xabar.
     */
    handleError: async (bot, telegramId, error, contextMessage = "Umumiy xato") => {
        console.error(`Xato sodir bo'ldi (${contextMessage}):`, error);
        await bot.sendMessage(telegramId, getTranslation('error_occurred', { errorMessage: error.message }));
    },

    /**
     * Promise catch bloklarida ishlatiladigan xato tutqichi.
     * @param {object} bot - Telegram bot instansi.
     * @param {number} telegramId - Foydalanuvchining Telegram IDsi.
     * @returns {function(Error): Promise<void>} Catch blokida ishlatish uchun funksiya.
     */
    catchAsync: (bot, telegramId) => (error) => {
        errorHandler.handleError(bot, telegramId, error);
    }
};

export default errorHandler;