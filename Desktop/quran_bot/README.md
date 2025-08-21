# Quran Bot - Telegram E-commerce Bot

Bu bot Telegram orqali Quran va diniy kitoblar sotish uchun yaratilgan e-commerce bot hisoblanadi.

## 🚀 Xususiyatlar

- 📱 Telegram orqali mahsulotlarni ko'rish va sotib olish
- 🛒 Savat va buyurtma tizimi
- 👨‍💼 Admin paneli
- 📦 Yetkazib berish tizimi
- 💳 To'lov tizimlari (Click, Payme, Uzum)
- 🌐 Ko'p tilli qo'llab-quvvatlash (O'zbek tili)
- 🤖 AI yordamida mahsulot kategoriyalash
- 📊 Statistika va hisobotlar

## 📋 Talablar

- Node.js 18+
- MongoDB 5+
- Telegram Bot Token

## 🛠️ O'rnatish

1. **Loyihani klonlash:**

```bash
git clone <repository-url>
cd quran_bot
```

2. **Dependensiyalarni o'rnatish:**

```bash
npm install
```

3. **Environment faylini yaratish:**

```bash
cp .env.example .env
```

4. **.env faylini to'ldirish:**

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
ADMIN_ID=your_admin_telegram_id_here

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/quran_bot

# Channel Configuration
IMPORT_CHANNEL_ID=-4959377401

# Language Configuration
DEFAULT_LANGUAGE=uzbek

# Security
NODE_ENV=production
```

5. **MongoDB ni ishga tushirish**

6. **Super admin yaratish:**

```bash
node src/scripts/createSuperAdmin.js
```

7. **Botni ishga tushirish:**

```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Loyiha strukturasi

```
quran_bot/
├── src/
│   ├── config/          # Konfiguratsiya fayllari
│   ├── db/             # Database modellar va ulanishlar
│   ├── handlers/       # Xabar va callback handlerlar
│   ├── keyboards/      # Telegram klaviatura
│   ├── locales/        # Til fayllari
│   ├── services/       # Biznes logika
│   ├── utils/          # Yordamchi funksiyalar
│   └── scripts/        # Maxsus scriptlar
├── index.js           # Asosiy kirish nuqtasi
└── package.json
```

## 🔧 Xavfsizlik

- Rate limiting (1 daqiqada 10 so'rov)
- Xabar uzunligi cheklovlari
- Spam filtri
- Input validatsiyasi va sanitizatsiya
- XSS himoyasi
- Xato tutish va logging
- Database validatsiyalari
- Admin autentifikatsiyasi

## 📊 Monitoring va Admin Buyruqlari

- `/stats` - Bot statistikasi
- `/backup` - Database backup yaratish
- `/memory` - Memory va CPU ma'lumotlari
- `/users` - Foydalanuvchilar statistikasi
- `/products` - Mahsulotlar statistikasi
- `/orders` - Buyurtmalar statistikasi
- `/restart` - Botni qayta ishga tushirish
- `/help` - Yordam xabari

## 🔄 Avtomatik Funksiyalar

- Har kun soat 2:00 da database backup
- Har soat admin ga statistika hisoboti
- Xatolarni avtomatik admin ga xabar berish
- Eski backup fayllarini avtomatik tozalash (7 kundan eski)

## 📊 Performance

- Database indexlari
- Memory cleanup
- Error handling
- Logging va monitoring

## 🤝 Hissa qo'shish

1. Fork qiling
2. Feature branch yarating
3. O'zgarishlarni commit qiling
4. Pull request yuboring

## 📄 Litsenziya

ISC License

## 📞 Aloqa

Muammolar yoki savollar uchun issue oching.
