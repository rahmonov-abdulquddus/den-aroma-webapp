// src/utils/aiFaq.js

const faqList = [
  {
    question: [
      "to'lov",
      "qanday to'lov",
      "qanday tolov",
      "karta",
      "pul",
      "payment",
      "oplata",
    ],
    answer:
      "Siz to'lovni naqd yoki karta orqali amalga oshirishingiz mumkin. Batafsil ma'lumot uchun admin bilan bog'laning.",
  },
  {
    question: [
      "yetkazib berish",
      "dostavka",
      "yetkazish",
      "delivery",
      "olib kelish",
    ],
    answer:
      "Ha, butun O'zbekiston bo'ylab yetkazib beramiz. Batafsil ma'lumot uchun admin bilan bog'laning.",
  },
  {
    question: [
      "ish vaqti",
      "soat nechi",
      "qachon ochiq",
      "qachon yopiq",
      "open",
      "close",
    ],
    answer: "Bizning do'konimiz har kuni 9:00 dan 21:00 gacha ochiq.",
  },
  {
    question: ["manzil", "qayerda", "adres", "location"],
    answer:
      "Bizning manzil: Toshkent shahri, Yunusobod tumani. Batafsil admin bilan bog'laning.",
  },
  {
    question: ["admin", "aloqa", "kontakt", "telefon", "raqam"],
    answer:
      "Admin bilan bog'lanish uchun: @denaroma_oqbilol_admin yoki telefon: +998 77 737 00 95",
  },
];

/**
 * Foydalanuvchi savoliga eng mos javobni topish (oddiy string matching)
 * @param {string} userText
 * @returns {string|null} javob yoki null
 */
export function getFaqAnswer(userText) {
  const text = userText.toLowerCase();
  for (const faq of faqList) {
    for (const q of faq.question) {
      if (text.includes(q)) {
        return faq.answer;
      }
    }
  }
  return null;
}
