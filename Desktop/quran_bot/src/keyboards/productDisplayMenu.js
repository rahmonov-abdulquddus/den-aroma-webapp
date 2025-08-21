// src/keyboards/productDisplayMenu.js

/**
 * Mahsulotni ko'rsatish uchun keyboard
 * @param {Object} product - Mahsulot obyekti
 * @param {string} product._id - Mahsulot IDsi
 * @param {string} product.name - Mahsulot nomi
 * @param {number} product.price - Mahsulot narxi
 * @param {string} product.description - Mahsulot tavsifi
 * @param {string} product.imageUrl - Mahsulot rasmi URLi
 * @param {number} product.stock - Mahsulot soni
 * @returns {Object} Telegram inline keyboard
 */
export function getProductDisplayKeyboard(product) {
  return {
    inline_keyboard: [
      [
        {
          text: `🛒 Savatga qo'shish (${product.price} so'm)`,
          callback_data: `add_to_cart_${product._id}`,
        },
      ],
      [
        {
          text: "📋 Batafsil ma'lumot",
          callback_data: `product_details_${product._id}`,
        },
      ],
      [
        {
          text: "⬅️ Orqaga",
          callback_data: "back_to_categories",
        },
        {
          text: "🏠 Bosh sahifa",
          callback_data: "main_menu",
        },
      ],
    ],
  };
}

/**
 * Mahsulot ro'yxati uchun keyboard
 * @param {Array} products - Mahsulotlar ro'yxati
 * @param {number} currentPage - Hozirgi sahifa
 * @param {number} totalPages - Jami sahifalar soni
 * @param {string} categoryId - Kategoriya IDsi (ixtiyoriy)
 * @returns {Object} Telegram inline keyboard
 */
export function getProductsListKeyboard(
  products,
  currentPage = 1,
  totalPages = 1,
  categoryId = null
) {
  const keyboard = [];

  // Mahsulotlar ro'yxati
  products.forEach((product, index) => {
    keyboard.push([
      {
        text: `${index + 1}. ${product.name} - ${product.price} so'm`,
        callback_data: `show_product_${product._id}`,
      },
    ]);
  });

  // Sahifa navigatsiyasi
  if (totalPages > 1) {
    const navigationRow = [];

    if (currentPage > 1) {
      navigationRow.push({
        text: "⬅️ Oldingi",
        callback_data: `products_page_${currentPage - 1}_${
          categoryId || "all"
        }`,
      });
    }

    navigationRow.push({
      text: `${currentPage}/${totalPages}`,
      callback_data: "no_action",
    });

    if (currentPage < totalPages) {
      navigationRow.push({
        text: "Keyingi ➡️",
        callback_data: `products_page_${currentPage + 1}_${
          categoryId || "all"
        }`,
      });
    }

    keyboard.push(navigationRow);
  }

  // Orqaga qaytish tugmalari
  keyboard.push([
    {
      text: "⬅️ Orqaga",
      callback_data: categoryId
        ? `category_${categoryId}`
        : "back_to_categories",
    },
    {
      text: "🏠 Bosh sahifa",
      callback_data: "main_menu",
    },
  ]);

  return {
    inline_keyboard: keyboard,
  };
}

/**
 * Mahsulot qidiruv natijalari uchun keyboard
 * @param {Array} products - Qidiruv natijalari
 * @param {string} query - Qidiruv so'zi
 * @returns {Object} Telegram inline keyboard
 */
export function getSearchResultsKeyboard(products, query) {
  const keyboard = [];

  // Qidiruv natijalari
  products.slice(0, 10).forEach((product, index) => {
    keyboard.push([
      {
        text: `${index + 1}. ${product.name} - ${product.price} so'm`,
        callback_data: `show_product_${product._id}`,
      },
    ]);
  });

  // Orqaga qaytish
  keyboard.push([
    {
      text: "🔍 Boshqa qidirish",
      callback_data: "search_again",
    },
    {
      text: "🏠 Bosh sahifa",
      callback_data: "main_menu",
    },
  ]);

  return {
    inline_keyboard: keyboard,
  };
}
