// src/utils/i18n.js

import uzbekTranslations from '../locales/uzbek.js';
// Agar boshqa tillarni ham qo'shmoqchi bo'lsangiz, ularni shu yerga import qiling:
// import englishTranslations from '../locales/english.js';

const translations = {
    uzbek: uzbekTranslations,
    // english: englishTranslations, // Agar mavjud bo'lsa
};

// getTranslation endi user language ni parametr sifatida qabul qiladi
export const getTranslation = (key, replacements = {}, userLanguage = 'uzbek') => { // <<< userLanguage parametri qo'shildi
    // Kalitni object ichidan topish funksiyasi
    const findKey = (obj, path) => {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length; i++) {
            if (current && typeof current === 'object' && parts[i] in current) {
                current = current[parts[i]];
            } else {
                return null;
            }
        }
        return current;
    };

    // Foydalanuvchi tili mavjud bo'lmasa yoki noto'g'ri bo'lsa, default 'uzbek' ishlatiladi
    const selectedLanguage = translations[userLanguage] ? userLanguage : 'uzbek';
    const translation = findKey(translations[selectedLanguage], key);

    if (translation === null || translation === undefined) {
        console.warn(`Translation not found for key: '${key}' in language '${selectedLanguage}'`);
        return `[${key}]`; // Tarjima topilmasa, kalitni qavslar ichida qaytaramiz
    }

    // O'zgaruvchilarni almashtirish
    let translatedText = translation;
    for (const placeholder in replacements) {
        // RegExni `{key}` formatiga moslab to'g'irlash
        const regex = new RegExp(`\\{${placeholder}\\}`, 'g'); // `{placeholder}` ni topish uchun
        translatedText = translatedText.replace(regex, replacements[placeholder]);
    }

    return translatedText;
};

// setLanguage funksiyasi hozirgi bot logikasida to'g'ridan-to'g'ri tilni o'zgartirish uchun ishlatilmaydi,
// chunki til har bir foydalanuvchining sozlamalaridan olinadi.
// Agar uni global tilni o'zgartirish uchun ishlatmoqchi bo'lsangiz, uni saqlashingiz mumkin.
// Hozircha bu yerda o'zgarishsiz qoldirildi, chunki u getTranslation ichida ishlatilmaydi.
// export const setLanguage = (lang) => { ... };