// src/utils/translit.js

const kril =
  "абвгдеёжзийклмнопрстуфхцчшщъыьэюяқўғҳАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯҚЎҒҲ";
const lotin = [
  "a",
  "b",
  "v",
  "g",
  "d",
  "e",
  "yo",
  "j",
  "z",
  "i",
  "y",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "r",
  "s",
  "t",
  "u",
  "f",
  "x",
  "ts",
  "ch",
  "sh",
  "shch",
  "'",
  "i",
  "'",
  "e",
  "yu",
  "ya",
  "q",
  "o'",
  "g'",
  "h",
  "A",
  "B",
  "V",
  "G",
  "D",
  "E",
  "Yo",
  "J",
  "Z",
  "I",
  "Y",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "R",
  "S",
  "T",
  "U",
  "F",
  "X",
  "Ts",
  "Ch",
  "Sh",
  "Shch",
  "'",
  "I",
  "'",
  "E",
  "Yu",
  "Ya",
  "Q",
  "O'",
  "G'",
  "H",
];

/**
 * Kril → lotin transliteratsiya
 * @param {string} text
 * @returns {string}
 */
export function toLatin(text) {
  let res = "";
  for (let i = 0; i < text.length; i++) {
    const idx = kril.indexOf(text[i]);
    if (idx !== -1) {
      res += lotin[idx];
    } else {
      res += text[i];
    }
  }
  return res;
}

/**
 * Lotin → kril transliteratsiya (soddalashtirilgan)
 * @param {string} text
 * @returns {string}
 */
export function toCyrillic(text) {
  // Faqat eng ko‘p ishlatiladigan harflar uchun
  return text
    .replace(/shch/g, "щ")
    .replace(/yo/g, "ё")
    .replace(/yu/g, "ю")
    .replace(/ya/g, "я")
    .replace(/ch/g, "ч")
    .replace(/sh/g, "ш")
    .replace(/ts/g, "ц")
    .replace(/o'/g, "ў")
    .replace(/g'/g, "ғ")
    .replace(/q/g, "қ")
    .replace(/h/g, "ҳ")
    .replace(/a/g, "а")
    .replace(/b/g, "б")
    .replace(/v/g, "в")
    .replace(/g/g, "г")
    .replace(/d/g, "д")
    .replace(/e/g, "е")
    .replace(/j/g, "ж")
    .replace(/z/g, "з")
    .replace(/i/g, "и")
    .replace(/y/g, "й")
    .replace(/k/g, "к")
    .replace(/l/g, "л")
    .replace(/m/g, "м")
    .replace(/n/g, "н")
    .replace(/o/g, "о")
    .replace(/p/g, "п")
    .replace(/r/g, "р")
    .replace(/s/g, "с")
    .replace(/t/g, "т")
    .replace(/u/g, "у")
    .replace(/f/g, "ф")
    .replace(/x/g, "х");
}
