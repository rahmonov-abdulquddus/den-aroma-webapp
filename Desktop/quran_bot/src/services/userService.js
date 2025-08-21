// src/services/userService.js

import User from "../db/models/User.js";

class UserService {
  /**
   * Foydalanuvchini topadi yoki yaratadi.
   * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
   * @param {string} firstName - Foydalanuvchi ismi.
   * @param {string} [username=null] - Foydalanuvchi username'i (ixtiyoriy).
   * @returns {Promise<object>} - Foydalanuvchi obyekti.
   */
  async findOrCreateUser(telegramId, firstName, username = null) {
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = new User({
        telegramId,
        firstName,
        username,
      });
      await user.save();
      console.log(
        `Yangi foydalanuvchi ro'yxatdan o'tdi: ${firstName} (${telegramId})`
      );
    } else {
      // Agar foydalanuvchi mavjud bo'lsa, ma'lumotlarini yangilashimiz mumkin
      if (user.firstName !== firstName || user.username !== username) {
        user.firstName = firstName;
        user.username = username;
        await user.save();
        console.log(
          `Foydalanuvchi ma'lumotlari yangilandi: ${firstName} (${telegramId})`
        );
      }
    }
    return user;
  }

  /**
   * Foydalanuvchining tilini yangilaydi.
   * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
   * @param {string} language - Yangi til kodi (masalan, 'uzbek', 'english').
   * @returns {Promise<object>} - Yangilangan foydalanuvchi obyekti.
   */
  async updateLanguage(telegramId, language) {
    const user = await User.findOneAndUpdate(
      { telegramId },
      { language },
      { new: true, upsert: true } // Agar foydalanuvchi topilmasa yaratadi
    );
    return user;
  }

  /**
   * Telegram ID bo'yicha foydalanuvchini oladi.
   * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
   * @returns {Promise<object|null>} - Foydalanuvchi obyekti yoki null.
   */
  async getUser(telegramId) {
    return await User.findOne({ telegramId });
  }

  /**
   * Telegram ID bo'yicha foydalanuvchini oladi.
   * @param {number} telegramId - Foydalanuvchi Telegram ID'si.
   * @returns {Promise<object|null>} - Foydalanuvchi obyekti yoki null.
   */
  async getUserByTelegramId(telegramId) {
    return await User.findOne({ telegramId });
  }

  /**
   * ID bo'yicha foydalanuvchini oladi.
   * @param {string} userId - Foydalanuvchi ID'si.
   * @returns {Promise<object|null>} - Foydalanuvchi obyekti yoki null.
   */
  async getUserById(userId) {
    return await User.findById(userId);
  }

  /**
   * Barcha foydalanuvchilarni oladi.
   * @returns {Promise<Array<object>>} - Barcha foydalanuvchilar ro'yxati.
   */
  async getAllUsers() {
    return await User.find({});
  }

  /**
   * Jami foydalanuvchilar sonini oladi.
   * @returns {Promise<number>} - Foydalanuvchilar soni.
   */
  async getTotalUsers() {
    return await User.countDocuments({});
  }

  /**
   * Bugun qo'shilgan foydalanuvchilar sonini oladi.
   * @returns {Promise<number>} - Bugun qo'shilgan foydalanuvchilar soni.
   */
  async getTodayUsers() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await User.countDocuments({
      createdAt: { $gte: today },
    });
  }

  /**
   * Faol foydalanuvchilar sonini oladi (7 kunda).
   * @returns {Promise<number>} - Faol foydalanuvchilar soni.
   */
  async getActiveUsers() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
  }
}

// UserService klassining yagona instansiyasini yaratamiz va uni export qilamiz.
export default new UserService();
