// src/config.js

import dotenv from 'dotenv'; // .env faylidan muhit o'zgaruvchilarini yuklash uchun
dotenv.config(); // .env faylidagi o'zgaruvchilarni process.env ga yuklaydi

const config = {
    // Telegram bot tokeni. Bu sizning botingizni Telegram API bilan bog'laydigan kalit.
    // .env faylida TELEGRAM_BOT_TOKEN deb saqlanadi. Agar topilmasa, joy tutuvchi qiymat ishlatiladi.
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '7956545337:AAGAl_fg_R14FDzx8iyA5CWEFMn3xl3DK7k',

    // MongoDB ma'lumotlar bazasiga ulanish URI (Uniform Resource Identifier).
    // .env faylida MONGO_URI deb saqlanadi. Agar topilmasa, lokal MongoDB manziliga ulanadi.
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/quran_bot_db',

    // Botning admini bo'ladigan Telegram foydalanuvchisining IDsi.
    // Bu ID orqali admin paneli funksiyalari boshqariladi.
    // .env faylida ADMIN_ID deb saqlanadi. O'zingizning Telegram IDingizni kiriting.
    ADMIN_ID: process.env.ADMIN_ID || '5545483477', // Masalan, '123456789'

    // Botning ishlash muhiti (development, production kabi).
    // .env faylida NODE_ENV deb saqlanadi. Agar topilmasa, 'development' bo'ladi.
    nodeEnv: process.env.NODE_ENV || 'development',

    // Qo'shimcha konfiguratsiyalar
    // Agar botga tegishli boshqa global parametrlar bo'lsa, bu yerga qo'shishingiz mumkin.
    // Masalan:
    // defaultLanguage: 'uzbek', // Bizning holatimizda bir tilli bo'lgani uchun hozircha to'g'ridan-to'g'ri ishlatilmaydi
    // productsPerPage: 10,
    // maxCartItems: 20,
};

export default config;