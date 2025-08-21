// src/utils/monitoring.js

import logger from "./logger.js";
import config from "../config/index.js";

class Monitoring {
  constructor() {
    this.errors = [];
    this.performance = [];
    this.maxErrors = 100;
    this.maxPerformance = 100;
  }

  /**
   * Xatoni qayd qilish va admin ga xabar yuborish
   * @param {Error} error - Xato obyekti
   * @param {string} context - Xato sodir bo'lgan joy
   * @param {object} bot - Telegram bot instansi
   */
  async logError(error, context, bot) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userId: null,
    };

    // Xatoni saqlash
    this.errors.push(errorInfo);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log qilish
    logger.error(`[${context}] ${error.message}`, error.stack);

    // Admin ga xabar yuborish (agar bot mavjud bo'lsa)
    if (bot && config.adminId) {
      try {
        const errorMessage =
          `🚨 <b>Xato yuz berdi!</b>\n\n` +
          `📍 <b>Joy:</b> ${context}\n` +
          `⏰ <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}\n` +
          `❌ <b>Xato:</b> ${error.message}\n\n` +
          `📋 <b>Stack trace:</b>\n<code>${error.stack?.substring(
            0,
            1000
          )}...</code>`;

        await bot.sendMessage(config.adminId, errorMessage, {
          parse_mode: "HTML",
        });
      } catch (sendError) {
        logger.error("Admin ga xabar yuborishda xato:", sendError);
      }
    }
  }

  /**
   * Performance metrikasini qayd qilish
   * @param {string} operation - Operatsiya nomi
   * @param {number} duration - Davomiyligi (ms)
   * @param {object} details - Qo'shimcha ma'lumotlar
   */
  logPerformance(operation, duration, details = {}) {
    const perfInfo = {
      operation,
      duration,
      details,
      timestamp: new Date().toISOString(),
    };

    this.performance.push(perfInfo);
    if (this.performance.length > this.maxPerformance) {
      this.performance.shift();
    }

    logger.performance(operation, duration, details);
  }

  /**
   * Foydalanuvchi harakatini qayd qilish
   * @param {number} userId - Foydalanuvchi ID
   * @param {string} action - Harakat turi
   * @param {object} details - Qo'shimcha ma'lumotlar
   */
  logUserAction(userId, action, details = {}) {
    logger.userAction(userId, action, details);
  }

  /**
   * Statistika hisobotini olish
   * @returns {object} Statistika ma'lumotlari
   */
  getStats() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentErrors = this.errors.filter(
      (e) => new Date(e.timestamp) > oneHourAgo
    );
    const recentPerformance = this.performance.filter(
      (p) => new Date(p.timestamp) > oneHourAgo
    );

    return {
      totalErrors: this.errors.length,
      recentErrors: recentErrors.length,
      averageResponseTime:
        recentPerformance.length > 0
          ? recentPerformance.reduce((sum, p) => sum + p.duration, 0) /
            recentPerformance.length
          : 0,
      slowestOperations: recentPerformance
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map((p) => ({ operation: p.operation, duration: p.duration })),
    };
  }

  /**
   * Admin ga statistika hisobotini yuborish
   * @param {object} bot - Telegram bot instansi
   */
  async sendStatsToAdmin(bot) {
    if (!bot || !config.adminId) return;

    try {
      const stats = this.getStats();
      const statsMessage =
        `📊 <b>Bot statistikasi</b>\n\n` +
        `❌ <b>Jami xatolar:</b> ${stats.totalErrors}\n` +
        `⚠️ <b>So'nggi soatdagi xatolar:</b> ${stats.recentErrors}\n` +
        `⚡ <b>O'rtacha javob vaqti:</b> ${Math.round(
          stats.averageResponseTime
        )}ms\n\n` +
        `🐌 <b>Eng sekin operatsiyalar:</b>\n` +
        stats.slowestOperations
          .map((op) => `• ${op.operation}: ${op.duration}ms`)
          .join("\n");

      await bot.sendMessage(config.adminId, statsMessage, {
        parse_mode: "HTML",
      });
    } catch (error) {
      logger.error("Statistika yuborishda xato:", error);
    }
  }

  /**
   * Memory usage ni tekshirish
   * @returns {object} Memory ma'lumotlari
   */
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
    };
  }
}

export default new Monitoring();
