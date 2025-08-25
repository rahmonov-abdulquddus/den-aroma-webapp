# 🧴 Den Aroma Bot - Premium Oqbilol va Xo'jalik Buyumlari

## 📱 Telegram Bot Features

### 🛍️ **Asosiy funksiyalar:**

- **Mahsulot katalogi** - Premium oqbilol va xo'jalik buyumlari
- **Savatcha** - Mahsulotlarni qo'shish va buyurtma berish
- **Kategoriyalar** - Mahsulotlarni turlar bo'yicha filtrlash
- **Qidiruv** - Mahsulotlarni nom va tavsif bo'yicha qidirish
- **Buyurtma tizimi** - To'liq buyurtma jarayoni
- **Yetkazib berish** - Bepul va pullik yetkazib berish

### 🛠️ **Admin funksiyalari:**

- **Admin Panel** - Web App orqali mahsulotlarni boshqarish
- **Avtomatik import** - Telegram kanal postlarini avtomatik mahsulot sifatida qo'shish
- **Mahsulot boshqaruvi** - Qo'shish, tahrirlash, o'chirish
- **Kategoriya boshqaruvi** - Kategoriyalarni boshqarish
- **Statistika** - Bot va mahsulotlar statistikasi

## 🚀 **Qurilish va ishga tushirish**

### **Talablar:**

- Node.js 18+
- MongoDB 6+
- Telegram Bot Token

### **O'rnatish:**

```bash
# Repository'ni klonlash
git clone <repository-url>
cd quran_bot

# Dependencelarni o'rnatish
npm install

# Environment o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini to'ldiring

# MongoDB'ni ishga tushirish
mongod

# Botni ishga tushirish
npm run dev
```

### **Environment o'zgaruvchilari (.env):**

```env
TELEGRAM_BOT_TOKEN=your_bot_token
MONGO_URI=mongodb://localhost:27017/quran_bot
ADMIN_ID=your_telegram_id
IMPORT_CHANNEL_ID=your_channel_id
```

## 📥 **Mahsulot import qilish**

### **1. Avtomatik import (Kanal postlari):**

Telegram kanaliga quyidagi formatda post tashlang:

```
🧴 AZIA xo'jalik suyuq sovuni – 72% tabiiy tozalik!
✨ Yog' va kirlarni tezda yuvib tashlaydi
✨ Idish-tovoq, kiyim va pol yuvish uchun mos
✨ 99,9% mikroblarga qarshi samarali

💰 Narxi: 12 000 so'm
🚚 Bepul dostavka xizmati mavjud!

📞 77 737 00 95
📲 @denaroma_oqbilol_admin
🛒 @denaroma_oqbilol – Sifatli mahsulotlar manzili
```

**Format talablari:**

- **1-satr:** Mahsulot nomi
- **2-4 satrlar:** Tavsif
- **5-satr:** Narxi (so'm)
- **Qolgan satrlar:** Qo'shimcha ma'lumot

### **2. Manual import (Admin Panel):**

```bash
# Bot'da admin command'ini ishlatish
/admin
```

**Admin Panel imkoniyatlari:**

- 📦 Mahsulotlarni qo'shish/tahrirlash/o'chirish
- 🏷️ Kategoriyalarni boshqarish
- 📊 Statistikalarni ko'rish
- 🔍 Mahsulotlarni qidirish va filtrlash

## 🎯 **Qanday ishlaydi**

### **Avtomatik import jarayoni:**

1. **Post tashlash** - Kanalga rasm va tavsif bilan post
2. **AI tahlil** - Mahsulot nomi va tavsifidan kategoriya aniqlash
3. **Ma'lumotlarni ajratish** - Nom, narx, tavsif, rasm
4. **Bazaga saqlash** - MongoDB'ga mahsulot sifatida saqlash
5. **Web app'da ko'rsatish** - Foydalanuvchilar uchun mavjud

### **Admin Panel:**

1. **Bot command** - `/admin` buyrug'ini ishlatish
2. **Web App ochish** - Admin panel'ni ochish
3. **Mahsulotlarni boshqarish** - Qo'shish, tahrirlash, o'chirish
4. **Real-time yangilanish** - O'zgarishlar darhol ko'rsatiladi

## 🔧 **Texnik tuzilma**

### **Backend (Node.js + Express):**

- **API endpoints** - Mahsulotlar, kategoriyalar, buyurtmalar
- **Database** - MongoDB + Mongoose
- **Telegram Bot** - node-telegram-bot-api
- **Channel Handler** - Avtomatik post import

### **Frontend (Web App):**

- **User Interface** - HTML5 + CSS3 + JavaScript
- **Telegram Web App** - Telegram API integratsiyasi
- **Admin Panel** - Mahsulotlarni boshqarish interfeysi
- **Responsive Design** - Barcha qurilmalarda ishlaydi

### **Database Models:**

- **Product** - Mahsulot ma'lumotlari
- **Category** - Kategoriyalar
- **Order** - Buyurtmalar
- **User** - Foydalanuvchilar
- **Cart** - Savatcha

## 📊 **Statistika va monitoring**

### **Bot statistikasi:**

```bash
/stats - Umumiy statistika
/memory - Memory usage
/users - Foydalanuvchilar soni
/products - Mahsulotlar soni
/orders - Buyurtmalar soni
```

### **Monitoring:**

- Xatolarni avtomatik qayd qilish
- Performance metrikalari
- Backup avtomatik yaratish
- Admin'larga xabar yuborish

## 🚀 **Production deployment**

### **PM2 bilan:**

```bash
npm run prod    # Production'da ishga tushirish
npm run stop    # To'xtatish
npm run restart # Qayta ishga tushirish
npm run logs    # Log'larni ko'rish
```

### **Docker bilan:**

```bash
docker-compose up -d
```

## 💡 **Maslahatlar**

### **Mahsulot qo'shishda:**

1. **Avtomatik import** - Kanal postlari orqali (tez va oson)
2. **Manual import** - Admin panel orqali (aniq va batafsil)
3. **Bulk import** - Excel/CSV fayllar orqali (katta hajmdagi ma'lumotlar uchun)

### **Kategoriyalar:**

- AI yordamida avtomatik aniqlash
- Manual kategoriya tanlash
- Yangi kategoriyalar qo'shish

### **Rasmlar:**

- Telegram file_id orqali avtomatik saqlash
- URL orqali tashqi rasmlar
- Placeholder rasm (rasm yo'q bo'lsa)

## 📞 **Aloqa va yordam**

- **Telegram:** @denaroma_oqbilol_admin
- **Kanal:** @denaroma_oqbilol
- **Telefon:** 77 737 00 95

## 🔄 **Yangilanishlar**

### **v1.0.0 (Hozirgi versiya):**

- ✅ Telegram bot asosiy funksiyalari
- ✅ Web App integratsiyasi
- ✅ Admin Panel
- ✅ Avtomatik mahsulot import
- ✅ Mahsulot boshqaruvi
- ✅ Kategoriya boshqaruvi
- ✅ Buyurtma tizimi
- ✅ Statistika va monitoring

### **Keyingi versiyalar:**

- 🔄 Excel/CSV import
- 🔄 Batafsilroq statistika
- 🔄 Foydalanuvchi panel
- 🔄 Payment integratsiyasi
- 🔄 Delivery tracking

---

**🎉 Den Aroma Bot - Sifatli mahsulotlar, tez va oson boshqarish!**
