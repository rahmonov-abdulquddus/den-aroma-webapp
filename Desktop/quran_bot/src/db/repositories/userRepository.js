// src/db/repositories/userRepository.js

import User from '../models/User.js'; // <-- YO'LNI TO'G'IRLADIK: src/db/models/User.js ga mos
import config from '../../config.js'; // <-- src/config.js fayliga mos

const userRepository = {
    /**
     * Foydalanuvchini Telegram ID bo'yicha topadi yoki yangisini yaratadi.
     * Yangi foydalanuvchi yaratilsa, admin_id ga qarab adminlik holati o'rnatiladi.
     * @param {number} telegramId - Foydalanuvchining Telegram IDsi.
     * @param {string} firstName - Foydalanuvchining ismi.
     * @param {string} [lastName] - Foydalanuvchining familiyasi.
     * @param {string} [username] - Foydalanuvchining username'i.
     * @returns {Promise<object>} Topilgan yoki yaratilgan foydalanuvchi obyekti.
     */
    findOrCreateUser: async (telegramId, firstName, lastName, username) => {
        let user = await User.findOne({ telegramId });

        if (!user) {
            user = new User({
                telegramId,
                firstName,
                lastName,
                username,
                isAdmin: telegramId.toString() === config.ADMIN_ID
            });
            await user.save();
            console.log(`Yangi foydalanuvchi yaratildi: ${firstName} (${telegramId})`);
        } else {
            // Foydalanuvchi ma'lumotlarini yangilash (agar kerak bo'lsa)
            let updated = false;
            if (user.firstName !== firstName) { user.firstName = firstName; updated = true; }
            if (user.lastName !== lastName) { user.lastName = lastName; updated = true; }
            if (user.username !== username) { user.username = username; updated = true; }
            if (user.isAdmin !== (telegramId.toString() === config.ADMIN_ID)) { user.isAdmin = (telegramId.toString() === config.ADMIN_ID); updated = true; }

            if (updated) {
                await user.save();
                console.log(`Foydalanuvchi ma'lumotlari yangilandi: ${firstName} (${telegramId})`);
            }
        }
        return user;
    },

    /**
     * Foydalanuvchini Telegram ID bo'yicha topadi.
     * @param {number} telegramId - Foydalanuvchining Telegram IDsi.
     * @returns {Promise<object|null>} Topilgan foydalanuvchi obyekti yoki null.
     */
    findUser: async (telegramId) => {
        return User.findOne({ telegramId });
    },

    /**
     * Foydalanuvchi ma'lumotlarini yangilaydi (faqat berilgan maydonlar bo'yicha).
     * @param {number} telegramId - Foydalanuvchining Telegram IDsi.
     * @param {object} updateFields - Yangilanadigan maydonlar va ularning qiymatlari.
     * @returns {Promise<object|null>} Yangilangan foydalanuvchi obyekti yoki null.
     */
    updateUser: async (telegramId, updateFields) => {
        const { language, ...fieldsToUpdate } = updateFields;
        if (Object.keys(fieldsToUpdate).length > 0) {
            return User.findOneAndUpdate({ telegramId }, fieldsToUpdate, { new: true });
        }
        return null;
    },
};

export default userRepository;