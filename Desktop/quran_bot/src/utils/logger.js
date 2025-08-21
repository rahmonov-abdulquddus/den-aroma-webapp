// src/utils/logger.js

// Oddiy konsol loggeri. Kengaytirilgan logging kutubxonalariga almashtirish mumkin (masalan, Winston, Pino).

const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    },
    warn: (message, ...args) => {
        console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    },
    error: (message, ...args) => {
        console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    },
    debug: (message, ...args) => {
        // Faqat rivojlanish muhitida ko'rsatish mumkin
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
        }
    },
    // Foydalanuvchi harakatlari uchun maxsus logger
    userAction: (userId, action, details = {}) => {
        console.log(`[USER_ACTION] ${new Date().toISOString()} - User: ${userId}, Action: ${action}`, details);
    },
    // Xavfsizlik hodisalari uchun
    security: (event, userId = null, details = {}) => {
        console.warn(`[SECURITY] ${new Date().toISOString()} - Event: ${event}, User: ${userId}`, details);
    },
    // Performance uchun
    performance: (operation, duration, details = {}) => {
        console.log(`[PERFORMANCE] ${new Date().toISOString()} - Operation: ${operation}, Duration: ${duration}ms`, details);
    }
};

export default logger;