// src/utils/rateLimiter.js

class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.maxRequests = 10; // 1 daqiqada maksimal so'rovlar
    this.windowMs = 60000; // 1 daqiqa
  }

  /**
   * Foydalanuvchining so'rovlarini tekshiradi
   * @param {number} userId - Foydalanuvchi ID
   * @returns {boolean} - So'rov ruxsat etilganmi
   */
  isAllowed(userId) {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Eski so'rovlarni tozalash
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Yangi so'rovni qo'shish
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }

  /**
   * Foydalanuvchining so'rovlarini tozalash
   * @param {number} userId - Foydalanuvchi ID
   */
  clearUser(userId) {
    this.requests.delete(userId);
  }

  /**
   * Barcha eski ma'lumotlarni tozalash
   */
  cleanup() {
    const now = Date.now();
    for (const [userId, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => now - time < this.windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(userId);
      } else {
        this.requests.set(userId, recentRequests);
      }
    }
  }
}

// Har 5 daqiqada tozalash
const rateLimiter = new RateLimiter();
setInterval(() => {
  rateLimiter.cleanup();
}, 5 * 60 * 1000);

export default rateLimiter;
