// src/config/adminSettings.js

// Admin sozlamalari - bu ma'lumotlarni admin o'zgartirishi mumkin
export const adminSettings = {
  // Do'kon ma'lumotlari
  shop: {
    name: "Den Aroma - Diniy kitoblar do'koni",
    address: "Farg'ona shahri, Oqbilol markazi, 1-qavat",
    phone: "+998 XX XXX XX XX",
    telegram: "@denaroma_oqbilol_admin",
    channel: "@denaroma_oqbilol",
    workingHours: {
      weekdays: "09:00 - 22:00",
      sunday: "10:00 - 20:00",
      days: "Dushanba - Shanba, Yakshanba",
    },
  },

  // Yetkazib berish ma'lumotlari
  delivery: {
    timeRange: "30 daqiqa - 2 soat",
    freeDeliveryThreshold: 50000, // so'm
    deliveryFee: 5000, // so'm
    areas: "Farg'ona shahri bo'ylab",
    weatherNote: "Har qanday ob-havoda yetkazib beramiz",
  },

  // Buyurtma ma'lumotlari
  order: {
    preparationTime: "15-30 daqiqa",
    cancellationAllowed: "Admin qabul qilishidan oldin",
    historyAvailable: true,
    multipleProducts: true,
  },

  // To'lov ma'lumotlari
  payment: {
    method: "Yetkazib berishda naqd pul bilan",
    cardPayment: false,
    cardPaymentNote: "Hozircha faqat naqd pul",
  },

  // Mahsulot ma'lumotlari
  products: {
    categories: ["Qur'on", "Diniy kitoblar", "Taqvimlar", "Sovg'alar"],
    qualityGuarantee: true,
    exchangePolicy: "24 soat ichida",
    searchAvailable: true,
  },

  // Mijoz xizmati
  customerService: {
    responseTime: "5-10 daqiqa",
    supportHours: "09:00 - 22:00",
    emergencyContact: "@denaroma_oqbilol_admin",
  },
};

// FAQ ma'lumotlari
export const faqData = {
  // Buyurtma haqida
  order: [
    {
      question: "Qanday buyurtma beraman?",
      answer:
        "1. Kategoriyalarni tanlang\n2. Mahsulotni tanlang va miqdorni belgilang\n3. Savatga qo'shing\n4. Savatni ko'ring va buyurtmani tasdiqlang\n5. Telefon raqamingizni kiriting\n6. Manzilingizni kiriting\n7. Buyurtmani yuboring",
    },
    {
      question: "Buyurtmani bekor qilish mumkinmi?",
      answer:
        "Ha, admin qabul qilishidan oldin bekor qilish mumkin. Admin qabul qilgandan keyin bekor qilish uchun admin bilan bog'laning.",
    },
    {
      question: "Qancha vaqtda tayyor bo'ladi?",
      answer: `Buyurtma ${adminSettings.order.preparationTime} ichida tayyor bo'ladi.`,
    },
    {
      question: "Buyurtma tarixini ko'rish mumkinmi?",
      answer:
        "Ha, 'Mening buyurtmalarim' bo'limida barcha buyurtmalaringizni ko'rishingiz mumkin.",
    },
    {
      question: "Bir nechta mahsulotni bir vaqtda buyurtma qilish mumkinmi?",
      answer:
        "Ha, cheklov yo'q. Xohlagancha mahsulotni savatga qo'shishingiz mumkin.",
    },
  ],

  // To'lov haqida
  payment: [
    {
      question: "Qanday to'lov qilaman?",
      answer: adminSettings.payment.method,
    },
    {
      question: "Chegirma mavjudmi?",
      answer:
        "Ha, doimiy mijozlar uchun maxsus takliflar va chegirmalar mavjud. Yangi mijozlar uchun 10% chegirma.",
    },
    {
      question: "Bepul yetkazib berish shartlari?",
      answer: `${adminSettings.delivery.freeDeliveryThreshold.toLocaleString()} so'mdan yuqori buyurtmalarda bepul yetkazib berish.`,
    },
    {
      question: "Yetkazib berish to'lovi qancha?",
      answer: `${adminSettings.delivery.deliveryFee.toLocaleString()} so'm (${adminSettings.delivery.freeDeliveryThreshold.toLocaleString()} so'mdan kam buyurtmalarda).`,
    },
    {
      question: "Karta bilan to'lov mumkinmi?",
      answer: adminSettings.payment.cardPaymentNote,
    },
  ],

  // Yetkazib berish haqida
  delivery: [
    {
      question: "Qancha vaqtda yetkazib berasiz?",
      answer: `${adminSettings.delivery.timeRange} ichida.`,
    },
    {
      question: "Qaysi hududlarga yetkazib berasiz?",
      answer: adminSettings.delivery.areas,
    },
    {
      question: "Yetkazib berish vaqti qanday?",
      answer: `${adminSettings.shop.workingHours.days}\nHafta kunlari: ${adminSettings.shop.workingHours.weekdays}\nYakshanba: ${adminSettings.shop.workingHours.sunday}`,
    },
    {
      question: "Shamol, yomg'ir kuni ham yetkazib berasizmi?",
      answer: adminSettings.delivery.weatherNote,
    },
    {
      question: "Buyurtmani qayerda olaman?",
      answer:
        "Ko'rsatilgan manzilga yetkazib beramiz. Uy, ish yoki boshqa joyga.",
    },
  ],

  // Texnik savollar
  technical: [
    {
      question: "Lokatsiya yuborish ishlamayapti?",
      answer:
        "Desktop yoki Web versiyada '📝 Koordinatalarni yozing' tugmasini bosing va koordinatalarni qo'lda kiriting.",
    },
    {
      question: "Bot ishlamayapti?",
      answer: "/start buyrug'ini bosing yoki botni qayta ishga tushiring.",
    },
    {
      question: "Xatolik yuz berdi?",
      answer: `Admin bilan bog'laning: ${adminSettings.shop.telegram}`,
    },
    {
      question: "Mahsulot topilmadi?",
      answer:
        "'Mahsulotlarni qidirish' bo'limidan foydalaning yoki kategoriyalarni ko'ring.",
    },
    {
      question: "Savat bo'sh?",
      answer:
        "Mahsulotlarni qo'shing va keyin ko'ring. Savat avtomatik yangilanadi.",
    },
  ],

  // Mijoz xizmati
  customerService: [
    {
      question: "Admin bilan bog'lanish?",
      answer: adminSettings.shop.telegram,
    },
    {
      question: "Qo'ng'iroq qilish?",
      answer: adminSettings.shop.phone,
    },
    {
      question: "Telegram kanal?",
      answer: adminSettings.shop.channel,
    },
    {
      question: "Shikoyat va takliflar?",
      answer: "Admin bilan bog'laning. Sizning fikringiz biz uchun muhim!",
    },
    {
      question: "Hamkorlik?",
      answer: "Biz bilan bog'laning. Hamkorlik takliflarini qabul qilamiz.",
    },
  ],

  // Do'kon haqida
  shop: [
    {
      question: "Manzil?",
      answer: adminSettings.shop.address,
    },
    {
      question: "Ish vaqti?",
      answer: `${adminSettings.shop.workingHours.days}\nHafta kunlari: ${adminSettings.shop.workingHours.weekdays}\nYakshanba: ${adminSettings.shop.workingHours.sunday}`,
    },
    {
      question: "Qanday mahsulotlar?",
      answer: adminSettings.products.categories.join(", "),
    },
    {
      question: "Sifat kafolati?",
      answer:
        "Ha, barcha mahsulotlar sifatli va original. Sifat kafolati bilan.",
    },
    {
      question: "Qayta almashtirish?",
      answer: `Ha, ${adminSettings.products.exchangePolicy} ichida almashtirish mumkin.`,
    },
  ],
};

// Ko'rsatmalar ma'lumotlari
export const instructionsData = {
  orderSteps: [
    "Kategoriyalarni tanlang",
    "Mahsulotni tanlang va miqdorni belgilang",
    "Savatga qo'shing",
    "Savatni ko'ring va buyurtmani tasdiqlang",
    "Telefon raqamingizni kiriting",
    "Manzilingizni kiriting",
    "Buyurtmani yuboring",
  ],

  locationInstructions: {
    title: "📍 Lokatsiya yuborish ko'rsatmalari:",
    mobile: "Mobil ilovada: '📍 Lokatsiya yuboring' tugmasini bosing",
    desktop: "Desktop/Web da: '📝 Koordinatalarni yozing' tugmasini bosing",
    coordinates: "Koordinata format: 40.3777, 71.7867",
    additional: "Qo'shimcha manzil: 'Moljal kirish, Den Aroma yonida'",
  },
};
