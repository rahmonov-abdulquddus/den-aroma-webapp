// src/utils/state.js

class BotState {
    constructor() {
        this.currentState = {}; // { telegramId: 'current_state' }
        this.temporaryData = {}; // { telegramId: { key: value, ... } }
    }

    /**
     * Foydalanuvchining joriy holatini belgilaydi.
     * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
     * @param {string} state - Belgilanadigan yangi holat.
     */
    setState(telegramId, state) {
        this.currentState[telegramId] = state;
        console.log(`User ${telegramId} state set to: ${state}`);
    }

    /**
     * Foydalanuvchining joriy holatini oladi.
     * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
     * @returns {string} - Foydalanuvchining joriy holati. Agar holat mavjud bo'lmasa, 'main_menu' qaytariladi.
     */
    getState(telegramId) {
        return this.currentState[telegramId] || 'main_menu';
    }

    /**
     * Foydalanuvchi uchun vaqtinchalik ma'lumotlarni saqlaydi.
     * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
     * @param {string} key - Ma'lumot kaliti.
     * @param {*} value - Saqlanadigan ma'lumot.
     */
    setData(telegramId, key, value) {
        if (!this.temporaryData[telegramId]) {
            this.temporaryData[telegramId] = {};
        }
        this.temporaryData[telegramId][key] = value;
        console.log(`User ${telegramId} data '${key}' set to:`, value);
    }

    /**
     * Foydalanuvchi uchun vaqtinchalik ma'lumotni oladi.
     * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
     * @param {string} key - Ma'lumot kaliti.
     * @returns {*} - Saqlangan ma'lumot yoki undefined.
     */
    getData(telegramId, key) {
        return this.temporaryData[telegramId] ? this.temporaryData[telegramId][key] : undefined;
    }

    /**
     * Foydalanuvchi uchun barcha yoki ma'lum bir vaqtinchalik ma'lumotni o'chiradi.
     * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
     * @param {string|null} key - O'chiriladigan ma'lumot kaliti. Agar null bo'lsa, barcha ma'lumotlar o'chiriladi.
     */
    deleteData(telegramId, key = null) {
        if (this.temporaryData[telegramId]) {
            if (key) {
                delete this.temporaryData[telegramId][key];
                console.log(`User ${telegramId} data '${key}' deleted.`);
            } else {
                delete this.temporaryData[telegramId];
                console.log(`User ${telegramId} all temporary data deleted.`);
            }
        }
    }

    /**
     * Foydalanuvchi uchun barcha vaqtinchalik ma'lumotni tozalaydi.
     * Bu 'deleteData' ning takrori, lekin 'clearUserData' deb chaqirilgan joylar uchun mavjud bo'lishi kerak.
     * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
     */
    clearUserData(telegramId) { // <<< QO'SHILDI
        this.deleteData(telegramId);
    }
}

// BotState klassining yagona instansiyasini yaratamiz va uni export qilamiz.
export default new BotState();