// src/utils/aiCategorySuggestion.js

/**
 * Mahsulot nomi va tavsifiga qarab kategoriya taklif qilish
 * @param {string} productName - Mahsulot nomi
 * @param {string} description - Mahsulot tavsifi
 * @returns {string} Taklif qilingan kategoriya nomi
 */
export function suggestCategory(productName, description = "") {
  const text = `${productName} ${description}`.toLowerCase();

  // Kategoriya kalit so'zlari
  const categoryKeywords = {
    Kosmetika: [
      "krem",
      "shampun",
      "sabun",
      "parfum",
      "dush",
      "vanna",
      "bombichka",
      "teri",
      "yuz",
      "qo'l",
      "oyoq",
      "soch",
      "tish",
      "og'iz",
      "ko'z",
      "masaj",
      "yumshoq",
      "hid",
      "aromat",
      "sredstva",
      "kosmetika",
    ],
    Parfumeriya: [
      "parfum",
      "duxi",
      "aromat",
      "hid",
      "sprey",
      "tush",
      "parfumeriya",
      "shirin hid",
      "tabiiy",
      "erkak",
      "ayol",
      "uniseks",
    ],
    Elektronika: [
      "telefon",
      "noutbuk",
      "kompyuter",
      "planshet",
      "naushnik",
      "kolonka",
      "zaryadka",
      "kabel",
      "adaptor",
      "batareya",
      "elektronika",
      "gadjet",
    ],
    Kiyim: [
      "ko'ylak",
      "shim",
      "kurtka",
      "palto",
      "futbolka",
      "sviter",
      "jinsi",
      "kiyim",
      "oyoq kiyim",
      "tufli",
      "krossovka",
      "botinka",
      "moda",
    ],
    "Uy-ro'zg'or": [
      "idish",
      "pichoq",
      "vilka",
      "chashka",
      "tarelka",
      "qozon",
      "tava",
      "uy",
      "ro'zg'or",
      "meva",
      "sabzavot",
      "non",
      "sut",
      "yog'",
    ],
    Kitoblar: [
      "kitob",
      "darslik",
      "roman",
      "she'r",
      "adabiyot",
      "o'qish",
      "til",
      "matematika",
      "fizika",
      "kimyo",
      "biologiya",
      "tarix",
      "geografiya",
    ],
    Sport: [
      "to'p",
      "raketa",
      "velosiped",
      "yugurish",
      "sport",
      "jismoniy",
      "mashq",
      "fitnes",
      "yoga",
      "basseyn",
      "stadion",
      "maydon",
    ],
    "O'yinchoqlar": [
      "o'yinchoq",
      "qo'g'irchoq",
      "mashina",
      "robot",
      "pazl",
      "o'yin",
      "bola",
      "bebi",
      "qurilma",
      "interaktiv",
      "musiqa",
      "rang",
    ],
    "Dori-darmon": [
      "dori",
      "vitamin",
      "tabletka",
      "sirop",
      "kapsula",
      "maz",
      "krem",
      "sog'lik",
      "shifokor",
      "apteka",
      "dorixona",
      "tibbiyot",
    ],
    Transport: [
      "mashina",
      "velosiped",
      "skuter",
      "motosikl",
      "avtobus",
      "taksi",
      "transport",
      "yo'l",
      "sayr",
      "safar",
      "sayoxat",
    ],
  };

  // Har bir kategoriya uchun ball hisoblash
  const scores = {};

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score += 1;
        // Mahsulot nomida bo'lsa ko'proq ball
        if (productName.toLowerCase().includes(keyword)) {
          score += 2;
        }
      }
    }
    if (score > 0) {
      scores[category] = score;
    }
  }

  // Eng yuqori ballga ega kategoriyani qaytarish
  if (Object.keys(scores).length > 0) {
    const bestCategory = Object.entries(scores).reduce((a, b) =>
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];
    return bestCategory;
  }

  // Hech qanday kategoriya topilmasa
  return "Boshqa";
}

/**
 * Mahsulot ma'lumotlariga qarab AI kategoriya taklifi
 * @param {Object} productData - Mahsulot ma'lumotlari
 * @returns {Object} Taklif qilingan kategoriya va ishonchlilik darajasi
 */
export function getAICategorySuggestion(productData) {
  const { name, description } = productData;

  const suggestedCategory = suggestCategory(name, description);

  // Ishonchlilik darajasini hisoblash (0-100)
  const text = `${name} ${description}`.toLowerCase();
  let confidence = 0;

  // Kategoriya kalit so'zlari sonini hisoblash
  const categoryKeywords = {
    Kosmetika: [
      "krem",
      "shampun",
      "sabun",
      "parfum",
      "dush",
      "vanna",
      "bombichka",
      "teri",
      "yuz",
      "qo'l",
      "oyoq",
      "soch",
      "tish",
      "og'iz",
      "ko'z",
      "masaj",
      "yumshoq",
      "hid",
      "aromat",
      "sredstva",
      "kosmetika",
    ],
    Parfumeriya: [
      "parfum",
      "duxi",
      "aromat",
      "hid",
      "sprey",
      "tush",
      "parfumeriya",
      "shirin hid",
      "tabiiy",
      "erkak",
      "ayol",
      "uniseks",
    ],
    Elektronika: [
      "telefon",
      "noutbuk",
      "kompyuter",
      "planshet",
      "naushnik",
      "kolonka",
      "zaryadka",
      "kabel",
      "adaptor",
      "batareya",
      "elektronika",
      "gadjet",
    ],
    Kiyim: [
      "ko'ylak",
      "shim",
      "kurtka",
      "palto",
      "futbolka",
      "sviter",
      "jinsi",
      "kiyim",
      "oyoq kiyim",
      "tufli",
      "krossovka",
      "botinka",
      "moda",
    ],
    "Uy-ro'zg'or": [
      "idish",
      "pichoq",
      "vilka",
      "chashka",
      "tarelka",
      "qozon",
      "tava",
      "uy",
      "ro'zg'or",
      "meva",
      "sabzavot",
      "non",
      "sut",
      "yog'",
    ],
    Kitoblar: [
      "kitob",
      "darslik",
      "roman",
      "she'r",
      "adabiyot",
      "o'qish",
      "til",
      "matematika",
      "fizika",
      "kimyo",
      "biologiya",
      "tarix",
      "geografiya",
    ],
    Sport: [
      "to'p",
      "raketa",
      "velosiped",
      "yugurish",
      "sport",
      "jismoniy",
      "mashq",
      "fitnes",
      "yoga",
      "basseyn",
      "stadion",
      "maydon",
    ],
    "O'yinchoqlar": [
      "o'yinchoq",
      "qo'g'irchoq",
      "mashina",
      "robot",
      "pazl",
      "o'yin",
      "bola",
      "bebi",
      "qurilma",
      "interaktiv",
      "musiqa",
      "rang",
    ],
    "Dori-darmon": [
      "dori",
      "vitamin",
      "tabletka",
      "sirop",
      "kapsula",
      "maz",
      "krem",
      "sog'lik",
      "shifokor",
      "apteka",
      "dorixona",
      "tibbiyot",
    ],
    Transport: [
      "mashina",
      "velosiped",
      "skuter",
      "motosikl",
      "avtobus",
      "taksi",
      "transport",
      "yo'l",
      "sayr",
      "safar",
      "sayoxat",
    ],
  };

  const keywords = categoryKeywords[suggestedCategory] || [];
  let matchedKeywords = 0;

  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      matchedKeywords += 1;
    }
  }

  // Ishonchlilik darajasini hisoblash
  if (keywords.length > 0) {
    confidence = Math.min(
      100,
      Math.round((matchedKeywords / keywords.length) * 100)
    );
  }

  return {
    category: suggestedCategory,
    confidence: confidence,
    matchedKeywords: matchedKeywords,
    totalKeywords: keywords.length,
  };
}

/**
 * Mahsulot nomi va tavsifidan AI yordamida xeshteglar ajratish
 * @param {string} productName
 * @param {string} description
 * @returns {Array<string>} xeshteglar
 */
export function suggestTags(productName, description = "") {
  const text = `${productName} ${description}`.toLowerCase();
  const tags = [];
  const tagKeywords = {
    "#kosmetika": [
      "krem",
      "shampun",
      "sabun",
      "parfum",
      "dush",
      "vanna",
      "bombichka",
      "teri",
      "yuz",
      "qo'l",
      "oyoq",
      "soch",
      "kosmetika",
    ],
    "#parfumeriya": ["parfum", "duxi", "aromat", "hid", "parfumeriya", "sprey"],
    "#elektronika": [
      "telefon",
      "noutbuk",
      "kompyuter",
      "planshet",
      "naushnik",
      "kolonka",
      "zaryadka",
      "kabel",
      "adaptor",
      "batareya",
      "elektronika",
      "gadjet",
    ],
    "#kiyim": [
      "ko'ylak",
      "shim",
      "kurtka",
      "palto",
      "futbolka",
      "sviter",
      "jinsi",
      "kiyim",
      "oyoq kiyim",
      "tufli",
      "krossovka",
      "botinka",
      "moda",
    ],
    "#uyrozgor": [
      "idish",
      "pichoq",
      "vilka",
      "chashka",
      "tarelka",
      "qozon",
      "tava",
      "uy",
      "ro'zg'or",
    ],
    "#kitob": [
      "kitob",
      "darslik",
      "roman",
      "she'r",
      "adabiyot",
      "o'qish",
      "til",
      "matematika",
      "fizika",
      "kimyo",
      "biologiya",
      "tarix",
      "geografiya",
    ],
    "#sport": [
      "to'p",
      "raketa",
      "velosiped",
      "yugurish",
      "sport",
      "jismoniy",
      "mashq",
      "fitnes",
      "yoga",
      "basseyn",
      "stadion",
      "maydon",
    ],
    "#oyinchoq": [
      "o'yinchoq",
      "qo'g'irchoq",
      "mashina",
      "robot",
      "pazl",
      "o'yin",
      "bola",
      "bebi",
      "qurilma",
      "interaktiv",
      "musiqa",
      "rang",
    ],
    "#dori": [
      "dori",
      "vitamin",
      "tabletka",
      "sirop",
      "kapsula",
      "maz",
      "krem",
      "sog'lik",
      "apteka",
      "dorixona",
      "tibbiyot",
    ],
    "#transport": [
      "mashina",
      "velosiped",
      "skuter",
      "motosikl",
      "avtobus",
      "taksi",
      "transport",
      "yo'l",
      "sayr",
      "safar",
      "sayoxat",
    ],
  };
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword) && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
  }
  // Qo'shimcha: mahsulot nomidan hashtag ajratish
  productName.split(" ").forEach((word) => {
    if (word.length > 3 && /^[a-zA-Zа-яА-ЯёЁ0-9]+$/.test(word)) {
      tags.push(`#${word.toLowerCase()}`);
    }
  });
  return Array.from(new Set(tags));
}

/**
 * Rasm caption yoki fayl nomidan AI yordamida tag/kategoriya ajratish
 * @param {string} caption
 * @param {string} [fileName]
 * @returns {{category: string, tags: Array<string>}}
 */
export function suggestFromImageMeta(caption = "", fileName = "") {
  const text = `${caption} ${fileName}`.toLowerCase();
  // Kategoriya va taglar uchun mavjud util funksiyalardan foydalanamiz
  const category = suggestCategory(text);
  const tags = suggestTags(text);
  return { category, tags };
}
