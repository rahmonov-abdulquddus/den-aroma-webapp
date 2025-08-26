// src/handlers/messageHandler.js

import { getTranslation } from "../utils/i18n.js";
import botStateInstance from "../utils/state.js";
import userService from "../services/userService.js";
import { adminSettings } from "../config/adminSettings.js";
import categoryService from "../services/categoryService.js";
import productService from "../services/productService.js";
import cartService from "../services/cartService.js"; // Savat uchun yangi import
import orderService from "../services/orderService.js";
import config from "../config/index.js";
import { getFaqAnswer } from "../utils/aiFaq.js";
import { toLatin } from "../utils/translit.js";
import productDisplayService from "../services/productDisplayService.js"; // Mahsulot ko'rsatish uchun
import adminService from "../services/adminService.js";
import deliveryPersonService from "../services/deliveryPersonService.js";
import {
  sanitizeText,
  validateUserId,
  logSecurityEvent,
} from "../utils/security.js";

// Keyboard importlari
import { mainMenuKeyboard } from "../keyboards/mainMenu.js";
import {
  adminMainMenuInlineKeyboard,
  manageProductsKeyboard,
} from "../keyboards/adminMenu.js";
import { manageCategoriesKeyboard } from "../keyboards/categoryMenu.js";
import { cancelKeyboard, backKeyboard } from "../keyboards/backMenu.js";
import { cartMenuKeyboard } from "../keyboards/cartMenu.js";

// Utils importlari
import {
  isAdmin,
  displayAdminCategories,
  displayCategoriesForProduct,
  displayUserCategories,
  displayAdminProducts,
  displayUserProducts,
  displayUserSelectedProduct,
} from "../utils/adminUtils.js"; // Bu yerda adminUtils nomi biroz chalkash bo'lishi mumkin, lekin funksiyalar kerakli

/**
 * Bu funksiya qidiruv natijalarini foydalanuvchiga ko'rsatadi.
 * @param {Object} bot - Telegram bot instansi.
 * @param {number} chatId - Chat ID.
 * @param {number} telegramId - Foydalanuvchi Telegram IDsi.
 * @param {Array} products - Qidiruv natijalari bo'lgan mahsulotlar ro'yxati.
 * @param {number} page - Joriy sahifa raqami.
 * @param {string} query - Qidiruv so'zi.
 */
export const displaySearchResults = async (
  bot,
  chatId,
  telegramId,
  products,
  page = 0,
  query = ""
) => {
  const user = await userService.getUser(telegramId);
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  const productsPerPage = 5;

  let messageText = `<b>${_getTranslation("search_results_for", {
    query: query,
  })}</b>:\n\n`;
  const inlineKeyboard = [];

  if (products.length === 0) {
    messageText = `❌ <b>Mahsulot topilmadi.</b>\n\nSiz izlagan mahsulot hozircha mavjud emas.\nYangi so'rov kiriting yoki asosiy menyuga qayting.`;
    inlineKeyboard.push([
      {
        text: "🏠 Asosiy menyuga qaytish",
        callback_data: "back_to_main_menu",
      },
    ]);
  } else {
    const totalPages = Math.ceil(products.length / productsPerPage);
    const startIndex = page * productsPerPage;
    const endIndex = Math.min(startIndex + productsPerPage, products.length);
    const productsToShow = products.slice(startIndex, endIndex);

    productsToShow.forEach((product, index) => {
      const productNumber = startIndex + index + 1;
      messageText += `<b>${productNumber}. ${product.name}</b>\n`;
      if (product.imageUrl) {
        messageText += `<a href='${product.imageUrl}'>🖼️</a> `;
      }
      messageText += `💰 ${product.price} ${_getTranslation("sum")}\n`;
      if (product.description) {
        messageText += `${product.description.substring(0, 50)}...\n`;
      }
      messageText += `\n<a href='https://t.me/denaroma_oqbilol'>Kanalimizga qo'shiling! @denaroma_oqbilol</a>\n`;
      inlineKeyboard.push([
        {
          text: `👁️ Batafsil`,
          callback_data: `view_product_${product._id}`,
        },
        {
          text: `➕ Savatga`,
          callback_data: `add_to_cart_${product._id}`,
        },
      ]);
    });

    const paginationRow = [];
    if (page > 0) {
      paginationRow.push({
        text: `⬅️ ${_getTranslation("previous_page")}`,
        callback_data: `search_page_${page - 1}_${query}`,
      });
    }
    if (page < totalPages - 1) {
      paginationRow.push({
        text: `${_getTranslation("next_page")} ➡️`,
        callback_data: `search_page_${page + 1}_${query}`,
      });
    }
    if (paginationRow.length > 0) {
      inlineKeyboard.push(paginationRow);
    }
    // Orqaga tugmasi
    inlineKeyboard.push([
      {
        text: _getTranslation("back_to_main_menu"),
        callback_data: "back_to_main_menu",
      },
    ]);
  }

  const options = {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (botStateInstance.getData(telegramId, "last_search_message_id")) {
    try {
      await bot.editMessageText(messageText, {
        chat_id: chatId,
        message_id: botStateInstance.getData(
          telegramId,
          "last_search_message_id"
        ),
        ...options,
      });
    } catch (error) {
      console.error(
        "Qidiruv natijalarini tahrirlashda xato (tahrirlash o'rniga yangi yuborilmoqda): ",
        error.message
      );
      const newMessage = await bot.sendMessage(chatId, messageText, options);
      botStateInstance.setData(
        telegramId,
        "last_search_message_id",
        newMessage.message_id
      );
    }
  } else {
    const newMessage = await bot.sendMessage(chatId, messageText, options);
    botStateInstance.setData(
      telegramId,
      "last_search_message_id",
      newMessage.message_id
    );
  }
};

// Dastavchi uchun panel tugmalari
const defineDeliveryPersonPanel = (userLanguage = "uzbek") => ({
  inline_keyboard: [
    [
      { text: "🆕 Yangi buyurtmalar", callback_data: "delivery_new_orders" },
      { text: "🚚 Mening buyurtmalarim", callback_data: "delivery_my_orders" },
    ],
    [
      { text: "✅ Yetkazilganlar", callback_data: "delivery_delivered_orders" },
      { text: "📊 Statistika", callback_data: "delivery_stats" },
    ],
    [
      { text: "👤 Shaxsiy ma'lumotlar", callback_data: "delivery_profile" },
      { text: "📱 Telefon raqam", callback_data: "delivery_phone" },
    ],
    [
      { text: "🟢 Online", callback_data: "delivery_online" },
      { text: "🔴 Offline", callback_data: "delivery_offline" },
    ],
    [
      { text: "💰 Kunlik daromad", callback_data: "delivery_daily_income" },
      {
        text: "📈 Haftalik statistika",
        callback_data: "delivery_weekly_stats",
      },
    ],
    [
      { text: "🗺️ Xarita", callback_data: "delivery_map" },
      { text: "⏰ Ish vaqti", callback_data: "delivery_work_time" },
    ],
    [{ text: "ℹ️ Yordam", callback_data: "delivery_help" }],
  ],
});

/**
 * Matnli xabarlarni boshqaradigan asosiy funksiya.
 * @param {Object} bot - Telegram bot instansi.
 * @param {Object} msg - Kelgan xabar obyekti.
 */
const handleMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const telegramId = msg.from.id;
  const firstName = msg.from.first_name;
  const username = msg.from.username || "";

  const user = await userService.findOrCreateUser(
    telegramId,
    firstName,
    username
  );
  const userLanguage = user ? user.language : "uzbek";
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  const userState = botStateInstance;
  const currentState = userState.getState(telegramId);

  // --- ADMIN MAHSULOT QO'SHISH BOSQICHLARI ---
  if (currentState === "admin_add_product_name") {
    await handleAdminAddProductName(bot, msg, telegramId, text, userLanguage);
    return;
  }
  if (currentState === "admin_add_product_category") {
    // Kategoriya tanlash logikasi
    const categoryId = text.trim();
    const productTemp = userState.getData(telegramId, "product_temp") || {};
    productTemp.categoryId = categoryId;
    userState.setData(telegramId, "product_temp", productTemp);

    await bot.sendMessage(msg.chat.id, "Mahsulot tavsifini kiriting:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "❌ Bekor qilish",
              callback_data: "cancel_add_product",
            },
          ],
        ],
      },
    });
    userState.setState(telegramId, "admin_add_product_description");
    return;
  }
  if (currentState === "admin_add_product_description") {
    await handleAdminAddProductDescription(
      bot,
      msg,
      telegramId,
      text,
      userLanguage
    );
    return;
  }
  if (currentState === "admin_add_product_price") {
    await handleAdminAddProductPrice(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Skidka narxini qabul qilish
  if (currentState === "admin_add_product_discount_price") {
    await handleAdminAddProductDiscountPrice(
      bot,
      msg,
      telegramId,
      text,
      userLanguage
    );
    return;
  }

  // admin_add_product_stock state o'chirildi - endi stock kerak emas
  if (currentState === "admin_add_product_image_url") {
    await handleAdminAddProductImage(bot, msg, telegramId, userLanguage);
    return;
  }

  // Kategoriya tahrirlash
  if (currentState === "admin_edit_category_name") {
    await handleAdminEditCategoryName(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Oddiy post yuborish
  if (currentState === "admin_send_regular_post") {
    await handleAdminSendRegularPost(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Admin: Post tashlash
  if (currentState === "waiting_post_content") {
    await handleAdminPostTashlash(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Mahsulot tahrirlash
  if (currentState === "admin_edit_product") {
    await handleAdminEditProduct(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Skidka davomiyligini qabul qilish
  if (currentState === "admin_enter_discount_duration") {
    await handleAdminEnterDiscountDuration(
      bot,
      msg,
      telegramId,
      text,
      userLanguage
    );
    return;
  }

  // Mahsulot qidirish (skidka uchun)
  if (currentState === "admin_search_product_for_discount") {
    await handleAdminSearchProductForDiscount(
      bot,
      msg,
      telegramId,
      text,
      userLanguage
    );
    return;
  }

  // Skidka narxini qabul qilish
  if (currentState === "admin_enter_discount_price") {
    await handleAdminEnterDiscountPrice(
      bot,
      msg,
      telegramId,
      text,
      userLanguage
    );
    return;
  }

  // Admin: Mahsulotni rad etish sababini qabul qilish
  if (currentState === "admin_reject_reason") {
    await handleAdminRejectReason(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Admin: Yangi admin qo'shish
  if (currentState === "admin_add_new_admin") {
    await handleAdminAddNewAdmin(bot, msg, telegramId, text, userLanguage);
    return;
  }

  // Admin: Yangi dastavchi qo'shish
  if (currentState === "admin_add_new_delivery_person") {
    await handleAdminAddNewDeliveryPerson(
      bot,
      msg,
      telegramId,
      text,
      userLanguage
    );
    return;
  }

  // 2.1. Mahsulot savatga qo'shish: miqdor kiritish (always before switch)
  if (currentState === "add_to_cart_quantity") {
    const quantity = parseInt(text.trim(), 10);
    if (isNaN(quantity) || quantity <= 0) {
      await bot.sendMessage(chatId, _getTranslation("invalid_quantity"));
      return;
    }
    const productId = userState.getData(telegramId, "add_to_cart_product_id");
    const user = await userService.getUser(telegramId);
    if (user && productId) {
      await cartService.addProductToCart(user._id, productId, quantity);
      await bot.sendMessage(chatId, _getTranslation("product_added_to_cart"), {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛒 Savatni ko'rish",
                callback_data: "view_cart",
              },
            ],
          ],
        },
      });
    }
    userState.deleteData(telegramId, "add_to_cart_product_id");
    userState.setState(telegramId, "main_menu");
    return;
  }

  // 2.1.1. Maxsus miqdor kiritish (yangi qo'shilgan)
  if (currentState === "custom_quantity_input") {
    const quantity = parseInt(text.trim(), 10);
    if (isNaN(quantity) || quantity <= 0 || quantity > 99) {
      await bot.sendMessage(
        chatId,
        "❌ Noto'g'ri miqdor! Iltimos, 1 dan 99 gacha raqam kiriting.",
        { parse_mode: "HTML" }
      );
      return;
    }

    const productId = userState.getData(telegramId, "add_to_cart_product_id");
    const user = await userService.getUser(telegramId);

    if (user && productId) {
      try {
        await cartService.addProductToCart(user._id, productId, quantity);

        // Muvaffaqiyatli xabar
        const successMessage =
          `✅ <b>Mahsulot savatga qo'shildi!</b>\n\n` +
          `🛒 <b>${quantity} dona</b> savatga qo'shildi\n` +
          `💰 Jami narx: <b>${
            quantity * (await productService.getProduct(productId)).price
          } so'm</b>\n\n` +
          `📱 Savatni ko'rish uchun "Savatni ko'rish" tugmasini bosing`;

        const cartKeyboard = {
          inline_keyboard: [
            [
              { text: "🛒 Savatni ko'rish", callback_data: "view_cart" },
              { text: "🛍️ Davom etish", callback_data: "continue_shopping" },
            ],
            [{ text: "🏠 Asosiy menyu", callback_data: "back_to_main_menu" }],
          ],
        };

        await bot.sendMessage(chatId, successMessage, {
          parse_mode: "HTML",
          reply_markup: cartKeyboard,
        });

        // State ni tozalash
        userState.deleteData(telegramId, "add_to_cart_product_id");
        userState.setState(telegramId, "main_menu");
      } catch (error) {
        console.error("Savatga qo'shishda xato:", error);
        await bot.sendMessage(chatId, "❌ Savatga qo'shishda xato yuz berdi!");
      }
    }
    return;
  }

  // 2.2. Buyurtma berish: telefon raqami kiritish
  if (currentState === "order_enter_phone") {
    console.log(`=== TELEFON DEBUG ===`);
    console.log(`Foydalanuvchi holati: "${currentState}"`);
    console.log(`Kiritilgan matn: "${text}"`);
    console.log(`Telegram ID: ${telegramId}`);

    const phone = text.trim().replace(/\D/g, "");
    console.log(`Tozalangan telefon: "${phone}"`);

    // 9 xonali yoki 998 bilan 12 xonali yoki +998 bilan 12 xonali raqamlar qabul qilinadi
    if (
      !/^(\+?998)?[0-9]{9}$/.test(text.replace(/\D/g, "")) &&
      !/^[0-9]{9}$/.test(phone)
    ) {
      console.log(`Telefon raqam noto'g'ri: "${text}" -> "${phone}"`);
      await bot.sendMessage(
        chatId,
        "Telefon raqamini to'g'ri kiriting. Masalan: 882052520 yoki 998882052520 yoki +998882052520"
      );
      return;
    }

    console.log(`Telefon raqam to'g'ri: "${phone}"`);
    userState.setData(telegramId, "order_phone", phone);
    await bot.sendMessage(
      chatId,
      "Manzilingizni kiriting:\n\n" +
        "📍 <b>Lokatsiya yuboring</b> (mobil ilovada)\n" +
        "📝 <b>Koordinatalarni yozing</b> (masalan: 40.3777, 71.7867)\n" +
        "🏠 <b>Matn ko'rinishida yozing</b> (masalan: Moljal kirish, Den Aroma yonida)",
      {
        parse_mode: "HTML",
        reply_markup: {
          keyboard: [
            [{ text: "📍 Lokatsiya yuboring", request_location: true }],
            [{ text: "📝 Koordinatalarni yozing" }],
            [{ text: "❌ Bekor qilish" }],
          ],
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      }
    );
    userState.setState(telegramId, "order_enter_address");
    console.log(`=== TELEFON DEBUG END ===`);
    return;
  }

  // 2.3. Buyurtma berish: manzil kiritish yoki lokatsiya yuborish
  if (currentState === "order_enter_address") {
    let address = text ? text.trim() : "";
    let location = null;

    // Bekor qilish tugmasi
    if (text === "❌ Bekor qilish") {
      userState.setState(telegramId, "main_menu");
      userState.deleteData(telegramId, "order_phone");
      userState.deleteData(telegramId, "order_location");
      await bot.sendMessage(
        chatId,
        "Buyurtma bekor qilindi. Asosiy menyuga qaytdingiz.",
        { reply_markup: mainMenuKeyboard(userLanguage) }
      );
      return;
    }

    // Lokatsiya yuborilgan bo'lsa
    if (msg.location) {
      location = msg.location;
      const lat = location.latitude;
      const lng = location.longitude;

      // Koordinatalarni saqlash
      userState.setData(telegramId, "order_location", location);

      // Qo'shimcha manzil so'rash
      await bot.sendMessage(
        chatId,
        `📍 <b>Lokatsiya qabul qilindi!</b>\n\n` +
          `Latitude: ${lat}\n` +
          `Longitude: ${lng}\n\n` +
          `📝 <b>Endi qo'shimcha manzil yozing:</b>\n` +
          `Masalan: "Moljal kirish, Den Aroma do'kon yonida, 2-qavat"`,
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [[{ text: "❌ Bekor qilish" }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );

      // Holatni o'zgartirish
      userState.setState(telegramId, "order_enter_address_details");
      return;
    }

    // Koordinatalarni qo'lda kiritish
    if (text === "📝 Koordinatalarni yozing") {
      await bot.sendMessage(
        chatId,
        "📍 <b>Koordinatalarni kiriting:</b>\n\n" +
          "Format: <code>latitude, longitude</code>\n" +
          "Masalan: <code>40.3777, 71.7867</code>\n\n" +
          "❓ Koordinatalarni qayerdan topish mumkin:\n" +
          "• Google Maps: joylashuvni belgilang → koordinatalar pastda\n" +
          "• GPS ilovasi: joriy joylashuv\n" +
          '• Internet: "[joy nomi] coordinates"',
        {
          parse_mode: "HTML",
          reply_markup: {
            keyboard: [[{ text: "❌ Bekor qilish" }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        }
      );
      userState.setState(telegramId, "order_enter_coordinates");
      return;
    }

    if (!address || address.length < 5) {
      await bot.sendMessage(
        chatId,
        "Manzil juda qisqa. Iltimos, to'liq manzil yoki lokatsiya yuboring."
      );
      return;
    }

    // Koordinatalarni qo'lda kiritish
    if (currentState === "order_enter_coordinates") {
      // Koordinata formatini tekshirish
      const coordPattern = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
      const match = text.match(coordPattern);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);

        // Koordinatalar to'g'ri oralig'da ekanligini tekshirish
        if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
          // Koordinatalarni saqlash
          const location = { latitude: lat, longitude: lng };
          userState.setData(telegramId, "order_location", location);

          await bot.sendMessage(
            chatId,
            `📍 <b>Koordinatalar qabul qilindi!</b>\n\n` +
              `Latitude: ${lat}\n` +
              `Longitude: ${lng}\n\n` +
              `📝 <b>Endi qo'shimcha manzil yozing:</b>\n` +
              `Masalan: "Moljal kirish, Den Aroma do'kon yonida, 2-qavat"`,
            {
              parse_mode: "HTML",
              reply_markup: {
                keyboard: [[{ text: "❌ Bekor qilish" }]],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );
          userState.setState(telegramId, "order_enter_address_details");
          return;
        } else {
          await bot.sendMessage(
            chatId,
            "❌ <b>Koordinatalar noto'g'ri!</b>\n\n" +
              "Latitude: -90 dan +90 gacha\n" +
              "Longitude: -180 dan +180 gacha\n\n" +
              "Qaytadan kiriting:",
            {
              parse_mode: "HTML",
              reply_markup: {
                keyboard: [[{ text: "❌ Bekor qilish" }]],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            }
          );
          return;
        }
      } else {
        await bot.sendMessage(
          chatId,
          "❌ <b>Format noto'g'ri!</b>\n\n" +
            "To'g'ri format: <code>latitude, longitude</code>\n" +
            "Masalan: <code>40.3777, 71.7867</code>\n\n" +
            "Qaytadan kiriting:",
          {
            parse_mode: "HTML",
            reply_markup: {
              keyboard: [[{ text: "❌ Bekor qilish" }]],
              resize_keyboard: true,
              one_time_keyboard: true,
            },
          }
        );
        return;
      }
    }

    // Qo'shimcha manzil kiritilgan bo'lsa
    if (currentState === "order_enter_address_details") {
      const savedLocation = userState.getData(telegramId, "order_location");
      if (savedLocation) {
        const lat = savedLocation.latitude;
        const lng = savedLocation.longitude;

        // Har xil platformalar uchun xarita linklari
        const googleMaps = `https://maps.google.com/?q=${lat},${lng}`;
        const appleMaps = `https://maps.apple.com/?q=${lat},${lng}`;
        const yandexMaps = `https://yandex.com/maps/?pt=${lng},${lat}`;

        // To'liq manzil
        address =
          `📍 <b>Lokatsiya:</b> ${lat}, ${lng}\n` +
          `🗺️ <b>Xarita linklari:</b>\n` +
          `• Google Maps: ${googleMaps}\n` +
          `• Apple Maps: ${appleMaps}\n` +
          `• Yandex Maps: ${yandexMaps}\n\n` +
          `📝 <b>Aniq manzil:</b> ${text}`;

        location = savedLocation;
      }
    }
    userState.setData(telegramId, "order_address", address);
    userState.setData(telegramId, "order_location", location);
    // Buyurtmani yakunlash
    const phone = userState.getData(telegramId, "order_phone");
    const user = await userService.getUser(telegramId);
    const cart = await cartService.getUserCart(user._id);
    if (!cart.products.length) {
      // Savat bosh ko'rinishida tugmalar bilan
      const emptyCartMessage =
        `🛒 <b>SAVAT BO'SH</b>\n\n` +
        `😔 Hozircha savatda mahsulot yo'q.\n\n` +
        `💡 Mahsulotlarni ko'rib, savatga qo'shing!`;

      const emptyCartKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🛍️ Mahsulotlarni ko'rish",
              callback_data: "browse_products_from_cart",
            },
            { text: "🏠 Asosiy menyu", callback_data: "back_to_main_menu" },
          ],
        ],
      };

      await bot.sendMessage(chatId, emptyCartMessage, {
        parse_mode: "HTML",
        reply_markup: emptyCartKeyboard,
      });
      userState.setState(telegramId, "main_menu");
      return;
    }
    // Buyurtmani bazaga saqlash
    const newOrder = await orderService.createOrderFromCart(telegramId, {
      shippingAddress: address,
      phoneNumber: phone,
      paymentMethod: "cash",
      location: location,
    });
    const orderId = newOrder._id;
    // Buyurtma xabari
    let orderMsg = `<b>🆕 Yangi buyurtma!</b>\n\n`;
    orderMsg += `<b>👤 Mijoz:</b> <a href='tg://user?id=${telegramId}'>${
      user.firstName || ""
    } ${user.lastName || ""}</a>`;
    if (user.username) {
      orderMsg += ` (@${user.username})`;
    }
    orderMsg += `\n<b>📞 Telefon:</b> ${phone}`;
    orderMsg += `\n<b>📍 Manzil:</b> ${address}\n`;
    if (location) {
      orderMsg += `\n<a href='https://maps.google.com/?q=${location.latitude},${location.longitude}'>�� Google xaritada ko'rish</a>\n`;
    }
    orderMsg += `\n<b>🛒 Buyurtma:</b>\n`;
    cart.products.forEach((item, idx) => {
      orderMsg += `${idx + 1}. <b>${item.product.name}</b> (${
        item.quantity
      } x ${item.price} ${_getTranslation("sum")}) = <b>${
        item.quantity * item.price
      } ${_getTranslation("sum")}</b>\n`;
    });
    orderMsg += `\n<b>Jami:</b> <b>${cart.totalPrice} ${_getTranslation(
      "sum"
    )}</b>`;
    // Adminlarga yuborish (bir nechta admin bo'lsa)
    const adminIds = [5545483477, 7509151895, 6121307128];
    for (const adminId of adminIds) {
      await bot.sendMessage(adminId, orderMsg, {
        parse_mode: "HTML",
        disable_web_page_preview: false,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Qabul qilish",
                callback_data: `accept_order_${orderId}`,
              },
              {
                text: "❌ Bekor qilish",
                callback_data: `cancel_order_${orderId}`,
              },
            ],
          ],
        },
      });
      if (location) {
        await bot.sendLocation(adminId, location.latitude, location.longitude);
      }
    }
    // Foydalanuvchiga tasdiq va asosiy menyu tugmalarini ko'rsatish
    await bot.sendMessage(
      chatId,
      _getTranslation("order_success"),
      mainMenuKeyboard(user.language)
    );
    // Savatni tozalash
    await cartService.clearUserCart(user._id);
    userState.setState(telegramId, "main_menu");
    userState.deleteData(telegramId, "order_phone");
    userState.deleteData(telegramId, "order_address");
    userState.deleteData(telegramId, "order_location");
    return;
  }

  // 1. Har doim birinchi navbatda buyruqlarni switch orqali tekshiramiz
  if (text && text.startsWith("/")) {
    switch (text) {
      case "/start":
        try {
          // Foydalanuvchi roli: dastavchimi yoki yo'qmi
          const deliveryPerson =
            await deliveryPersonService.getDeliveryPersonByTelegramId(
              telegramId
            );

          if (deliveryPerson && deliveryPerson.isActive) {
            // Dastavchi uchun maxsus panel va xush kelibsiz xabari
            await bot.sendMessage(
              chatId,
              `🚚 <b>Xush kelibsiz, Dastavchi!</b>\n\nSiz uchun maxsus panel ochildi.\n\n🛒 Yangi buyurtmalarni qabul qiling, yetkazilganlarni belgilang va statistikani kuzating!`,
              {
                parse_mode: "HTML",
                reply_markup: defineDeliveryPersonPanel(),
              }
            );
            return;
          }

          // Admin tekshirish
          if (
            telegramId === 5545483477 ||
            telegramId === 7509151895 ||
            telegramId === 6121307128
          ) {
            // Ko'rib chiqilishi kerak mahsulotlar sonini olish
            const pendingCount =
              await productService.getPendingReviewProductsCount();

            await bot.sendMessage(
              chatId,
              `👑 <b>Admin paneliga xush kelibsiz, ${firstName}!</b>`,
              {
                parse_mode: "HTML",
                reply_markup: adminMainMenuInlineKeyboard(
                  userLanguage,
                  pendingCount
                ),
              }
            );
            userState.setState(telegramId, "admin_main");
            userState.clearUserData(telegramId);
          } else {
            // Oddiy foydalanuvchi uchun asosiy menyu
            await bot.sendMessage(
              chatId,
              _getTranslation("start_message", { firstName: firstName }),
              mainMenuKeyboard(userLanguage)
            );
            userState.setState(telegramId, "main_menu");
            userState.clearUserData(telegramId);
          }
        } catch (error) {
          console.error("Start buyrug'ida xato:", error);
          // Xato bo'lsa ham oddiy foydalanuvchi sifatida davom etamiz
          await bot.sendMessage(
            chatId,
            _getTranslation("start_message", { firstName: firstName }),
            mainMenuKeyboard(userLanguage)
          );
          userState.setState(telegramId, "main_menu");
          userState.clearUserData(telegramId);
        }
        return;
      case "/admin":
        if (
          telegramId === 5545483477 ||
          telegramId === 7509151895 ||
          telegramId === 6121307128
        ) {
          // Ko'rib chiqilishi kerak mahsulotlar sonini olish
          const pendingCount =
            await productService.getPendingReviewProductsCount();

          await bot.sendMessage(
            chatId,
            `👑 <b>Admin paneliga xush kelibsiz, ${firstName}!</b>`,
            {
              parse_mode: "HTML",
              reply_markup: adminMainMenuInlineKeyboard(
                userLanguage,
                pendingCount
              ),
            }
          );
          userState.setState(telegramId, "admin_main");
        } else {
          await bot.sendMessage(
            chatId,
            "<b>Hurmatli foydalanuvchi!</b>\n\nBu bo'lim faqat do'kon administratorlari uchun mo'ljallangan.\n\nAgar sizda savol yoki taklif bo'lsa, bemalol bizga yozing yoki asosiy menyudan kerakli bo'limni tanlang. 😊\n\n<b>Admin bilan bog'lanish:</b> @denaroma_oqbilol_admin yoki telefon: +998 77 737 00 95",
            { parse_mode: "HTML" }
          );
        }
        return;
      default:
        await bot.sendMessage(
          chatId,
          _getTranslation("unknown_command_general"),
          mainMenuKeyboard(userLanguage)
        );
        return;
    }
  }

  // 2. UNIVERSAL FOYDALANUVCHI TUGMALARI (har qanday state da ishlaydi)
  if (text === _getTranslation("main_menu.cart")) {
    const cart = await cartService.getUserCart(user._id);
    if (!cart.products.length) {
      // Savat bosh ko'rinishida tugmalar bilan
      const emptyCartMessage =
        `🛒 <b>SAVAT BO'SH</b>\n\n` +
        `😔 Hozircha savatda mahsulot yo'q.\n\n` +
        `💡 Mahsulotlarni ko'rib, savatga qo'shing!`;

      const emptyCartKeyboard = {
        inline_keyboard: [
          [
            {
              text: "🛍️ Mahsulotlarni ko'rish",
              callback_data: "browse_products_from_cart",
            },
            { text: "🏠 Asosiy menyu", callback_data: "back_to_main_menu" },
          ],
        ],
      };

      await bot.sendMessage(chatId, emptyCartMessage, {
        parse_mode: "HTML",
        reply_markup: emptyCartKeyboard,
      });
    } else {
      let message = `<b>${_getTranslation("view_cart_items")}</b>\n\n`;
      cart.products.forEach((item, idx) => {
        message += `${idx + 1}. <b>${item.product.name}</b> (${
          item.quantity
        } x ${item.price} ${_getTranslation("sum")}) = <b>${
          item.quantity * item.price
        } ${_getTranslation("sum")}</b>\n`;
      });
      await bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        reply_markup: cartMenuKeyboard(userLanguage, _getTranslation),
      });
    }
    userState.setState(telegramId, "user_cart");
    return;
  } else if (text === _getTranslation("main_menu.browse_categories")) {
    await displayUserCategories(bot, telegramId);
    userState.setState(telegramId, "user_browse_categories");
    return;
  } else if (text === _getTranslation("main_menu.search_products")) {
    await bot.sendMessage(
      chatId,
      _getTranslation("enter_search_query"),
      mainMenuKeyboard(userLanguage)
    );
    userState.setState(telegramId, "user_search_query");
    return;
  } else if (text === _getTranslation("main_menu.contact")) {
    await bot.sendMessage(chatId, _getTranslation("admin"), {
      parse_mode: "HTML",
      reply_markup: backKeyboard(_getTranslation),
    });
    userState.setState(telegramId, "user_contact");
    return;
  } else if (text === _getTranslation("main_menu.settings")) {
    await bot.sendMessage(chatId, _getTranslation("settings_prompt"), {
      reply_markup: backKeyboard(_getTranslation),
    });
    userState.setState(telegramId, "user_settings");
    return;
  } else if (text === "📚 Ko'rsatmalar") {
    await bot.sendMessage(
      chatId,
      `📚 <b>BUYURTMA BERISH KO'RSATMALARI</b>\n\n` +
        `🛒 <b>Qadam-ba-qadam ko'rsatma:</b>\n` +
        `1️⃣ Kategoriyalarni tanlang\n` +
        `2️⃣ Mahsulotni tanlang va miqdorni belgilang\n` +
        `3️⃣ Savatga qo'shing\n` +
        `4️⃣ Savatni ko'ring va buyurtmani tasdiqlang\n` +
        `5️⃣ Telefon raqamingizni kiriting\n` +
        `6️⃣ Manzilingizni kiriting\n` +
        `7️⃣ Buyurtmani yuboring\n\n` +
        `📍 <b>LOKATSIYA YUBORISH:</b>\n` +
        `• Mobil ilovada: "📍 Lokatsiya yuboring" tugmasini bosing\n` +
        `• Desktop/Web da: "📝 Koordinatalarni yozing" tugmasini bosing\n` +
        `• Koordinata format: <code>40.3777, 71.7867</code>\n` +
        `• Qo'shimcha manzil: "Moljal kirish, Den Aroma yonida"\n\n` +
        `💰 <b>TO'LOV VA YETKAZIB BERISH:</b>\n` +
        `• To'lov usuli: Yetkazib berishda naqd pul bilan\n` +
        `• Yetkazib berish: 30 daqiqa - 2 soat ichida\n` +
        `• Bepul yetkazib berish: 50,000 so'mdan yuqori buyurtmalarda\n` +
        `• Yetkazib berish to'lovi: 5,000 so'm (50,000 so'mdan kam buyurtmalarda)\n\n` +
        `⏰ <b>ISH VAQTI:</b>\n` +
        `• Dushanba - Shanba: 09:00 - 22:00\n` +
        `• Yakshanba: 10:00 - 20:00`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "❓ FAQ ga o'tish",
                callback_data: "show_faq",
              },
            ],
            [
              {
                text: "📞 Aloqa ma'lumotlari",
                callback_data: "show_contact",
              },
            ],
          ],
        },
      }
    );
    return;
  } else if (text === "❓ FAQ") {
    await bot.sendMessage(
      chatId,
      `❓ <b>KO'P SO'RALADIGAN SAVOLLAR</b>\n\n` +
        `🛒 <b>Buyurtma haqida:</b>\n` +
        `• Qanday buyurtma beraman?\n` +
        `• Buyurtmani bekor qilish mumkinmi?\n` +
        `• Qancha vaqtda tayyor bo'ladi?\n\n` +
        `💰 <b>To'lov haqida:</b>\n` +
        `• Qanday to'lov qilaman?\n` +
        `• Chegirma mavjudmi?\n` +
        `• Bepul yetkazib berish?\n\n` +
        `🚚 <b>Yetkazib berish:</b>\n` +
        `• Qancha vaqtda yetkazib berasiz?\n` +
        `• Qaysi hududlarga?\n` +
        `• Ish vaqti qanday?\n\n` +
        `📱 <b>Texnik savollar:</b>\n` +
        `• Lokatsiya ishlamayapti?\n` +
        `• Bot ishlamayapti?\n` +
        `• Xatolik yuz berdi?\n\n` +
        `👥 <b>Mijoz xizmati:</b>\n` +
        `• Admin bilan bog'lanish\n` +
        `• Qo'ng'iroq qilish\n` +
        `• Telegram kanal\n\n` +
        `🏪 <b>Do'kon haqida:</b>\n` +
        `• Manzil va ish vaqti\n` +
        `• Mahsulotlar turlari\n` +
        `• Sifat kafolati`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🛒 Buyurtma haqida",
                callback_data: "faq_order",
              },
              {
                text: "💰 To'lov haqida",
                callback_data: "faq_payment",
              },
            ],
            [
              {
                text: "🚚 Yetkazib berish",
                callback_data: "faq_delivery",
              },
              {
                text: "📱 Texnik savollar",
                callback_data: "faq_technical",
              },
            ],
            [
              {
                text: "👥 Mijoz xizmati",
                callback_data: "faq_customer",
              },
              {
                text: "🏪 Do'kon haqida",
                callback_data: "faq_shop",
              },
            ],
            [
              {
                text: "📚 Ko'rsatmalarga qaytish",
                callback_data: "show_instructions",
              },
            ],
          ],
        },
      }
    );
  } else if (text === "👑 Admin") {
    if (telegramId === 5545483477) {
      // Ko'rib chiqilishi kerak mahsulotlar sonini olish
      const pendingCount = await productService.getPendingReviewProductsCount();

      await bot.sendMessage(
        chatId,
        _getTranslation("admin_panel_welcome_inline"),
        {
          reply_markup: adminMainMenuInlineKeyboard(userLanguage, pendingCount),
        }
      );
      userState.setState(telegramId, "admin_main");
    } else {
      await bot.sendMessage(
        chatId,
        "Kechirasiz, siz admin emassiz. Admin bilan bog'lanish uchun: @denaroma_oqbilol_admin yoki telefon: +998 77 737 00 95"
      );
    }
    return;
  }

  // Admin sozlamalari o'zgartirish holatlari
  if (currentState === "edit_shop_name") {
    // Do'kon nomini yangilash
    adminSettings.shop.name = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>Do'kon nomi yangilandi!</b>\n\n` +
        `Yangi nom: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_shop_address") {
    // Do'kon manzilini yangilash
    adminSettings.shop.address = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>Do'kon manzili yangilandi!</b>\n\n` +
        `Yangi manzil: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_shop_phone") {
    // Do'kon telefon raqamini yangilash
    adminSettings.shop.phone = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>Do'kon telefon raqami yangilandi!</b>\n\n` +
        `Yangi raqam: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_shop_telegram") {
    // Do'kon Telegram ma'lumotlarini yangilash
    if (text.startsWith("@")) {
      adminSettings.shop.telegram = text;
      await bot.sendMessage(
        chatId,
        `✅ <b>Do'kon Telegram ma'lumotlari yangilandi!</b>\n\n` +
          `Yangi admin: <code>${text}</code>\n\n` +
          `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⚙️ Sozlamalar",
                  callback_data: "admin_settings_new",
                },
              ],
            ],
          },
        }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `❌ <b>Xato format!</b>\n\n` +
          `Telegram username @ bilan boshlanishi kerak.\n` +
          `Masalan: @username\n\n` +
          `Qaytadan kiriting:`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Orqaga qaytish",
                  callback_data: "shop_settings",
                },
              ],
            ],
          },
        }
      );
      return;
    }
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_working_hours") {
    // Ish vaqtini yangilash
    adminSettings.shop.workingHours.weekdays = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>Ish vaqti yangilandi!</b>\n\n` +
        `Yangi vaqt: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_payment_method") {
    // To'lov usulini yangilash
    adminSettings.payment.method = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>To'lov usuli yangilandi!</b>\n\n` +
        `Yangi usul: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_card_payment") {
    // Karta to'lovini yangilash
    if (text.toLowerCase().includes("mavjud")) {
      adminSettings.payment.cardPayment = true;
    } else {
      adminSettings.payment.cardPayment = false;
    }
    await bot.sendMessage(
      chatId,
      `✅ <b>Karta to'lovi sozlamasi yangilandi!</b>\n\n` +
        `Yangi sozlama: <code>${
          adminSettings.payment.cardPayment ? "Mavjud" : "Mavjud emas"
        }</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_preparation_time") {
    // Tayyorlash vaqtini yangilash
    adminSettings.order.preparationTime = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>Tayyorlash vaqti yangilandi!</b>\n\n` +
        `Yangi vaqt: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (currentState === "edit_cancellation_allowed") {
    // Bekor qilish sozlamasini yangilash
    adminSettings.order.cancellationAllowed = text;
    await bot.sendMessage(
      chatId,
      `✅ <b>Bekor qilish sozlamasi yangilandi!</b>\n\n` +
        `Yangi sozlama: <code>${text}</code>\n\n` +
        `⚙️ Sozlamalar bo'limiga qaytish uchun "⚙️ Sozlamalar" tugmasini bosing.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⚙️ Sozlamalar",
                callback_data: "admin_settings_new",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  // 3. Statega bog'liq amallar va qidiruv
  if (currentState === "user_search_query") {
    try {
      const products = await productDisplayService.searchProductsForDisplay(
        text,
        10
      );

      if (products.length === 0) {
        await bot.sendMessage(
          chatId,
          `🔍 "${text}" uchun mahsulot topilmadi!\n\n` +
            "💡 Boshqa so'z bilan qidiring yoki kategoriyalarni ko'ring.",
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔍 Boshqa qidirish",
                    callback_data: "search_again",
                  },
                ],
                [
                  {
                    text: "📂 Kategoriyalar",
                    callback_data: "browse_categories",
                  },
                  {
                    text: "🏠 Bosh sahifa",
                    callback_data: "main_menu",
                  },
                ],
              ],
            },
          }
        );
      } else {
        let message = `🔍 "${text}" uchun ${products.length} ta natija:\n\n`;

        products.forEach((product, index) => {
          message += `${index + 1}. **${product.name}** - ${
            product.formattedPrice
          }\n`;
        });

        const keyboard = {
          inline_keyboard: [
            ...products.map((product, index) => [
              {
                text: `${index + 1}. ${product.name} - ${
                  product.formattedPrice
                }`,
                callback_data: `show_product_${product._id}`,
              },
            ]),
            [
              {
                text: "🔍 Boshqa qidirish",
                callback_data: "search_again",
              },
            ],
            [
              {
                text: "📂 Kategoriyalar",
                callback_data: "browse_categories",
              },
              {
                text: "🏠 Bosh sahifa",
                callback_data: "main_menu",
              },
            ],
          ],
        };

        await bot.sendMessage(chatId, message, {
          parse_mode: "Markdown",
          reply_markup: keyboard,
        });
      }

      userState.setState(telegramId, "user_search_results");
    } catch (error) {
      await bot.sendMessage(chatId, `❌ Qidiruvda xato: ${error.message}`);
    }
    return;
  }

  // Admin: Guruh ID sini kiritish
  if (currentState === "admin_enter_channel_id") {
    const channelId = parseInt(text.trim());
    if (isNaN(channelId)) {
      await bot.sendMessage(
        chatId,
        "❌ Noto'g'ri guruh ID! Iltimos, raqam kiriting (masalan: -1001234567890).\n\n" +
          "💡 Yoki guruhga botni qo'shib, guruhda har qanday xabar yuboring - men sizga guruh ID sini yuboraman."
      );
      return;
    }

    // Guruh ID sini saqlash
    userState.setData(telegramId, "temp_channel_id", channelId);

    await bot.sendMessage(
      chatId,
      `✅ Guruh ID saqlandi: ${channelId}\n\n` +
        "Endi qaysi miqdordagi postlarni o'qib chiqishni xohlaysiz?",
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "📥 50 ta post", callback_data: "import_posts_50" },
              { text: "📥 100 ta post", callback_data: "import_posts_100" },
            ],
            [
              { text: "📥 200 ta post", callback_data: "import_posts_200" },
              { text: "📥 500 ta post", callback_data: "import_posts_500" },
            ],
            [{ text: "🔙 Orqaga", callback_data: "back_to_admin_main" }],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_import_posts");
    return;
  }

  // Foydalanuvchi fikr yozish
  if (currentState.startsWith("writing_feedback_")) {
    const orderId = currentState.split("writing_feedback_")[1];

    try {
      // Fikrni saqlash
      const feedback = {
        text: text.trim(),
        rating: 5, // Standart baho
        createdAt: new Date(),
      };

      await orderService.saveUserFeedback(orderId, feedback);

      await bot.sendMessage(
        chatId,
        `✅ <b>Fikringiz saqlandi!</b>\n\n` +
          `📝 <b>Fikringiz:</b> ${text.trim()}\n` +
          `⭐ <b>Baho:</b> 5/5\n\n` +
          `🎉 Rahmat! Fikringiz bizga juda muhim. Bu bizga yaxshilanishga yordam beradi.\n\n` +
          `🏠 Asosiy menyuga qaytish uchun /start buyrug'ini bosing.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🏠 Asosiy menyu",
                  callback_data: "main_menu",
                },
              ],
            ],
          },
        }
      );

      // Foydalanuvchini asosiy holatga qaytarish
      botStateInstance.setState(telegramId, "main_menu");
    } catch (error) {
      console.error("Fikr saqlashda xato:", error);
      await bot.sendMessage(
        chatId,
        `❌ <b>Xato yuz berdi!</b>\n\nFikringiz saqlanmadi. Iltimos, keyinroq urinib ko'ring.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🏠 Asosiy menyu",
                  callback_data: "main_menu",
                },
              ],
            ],
          },
        }
      );
      botStateInstance.setState(telegramId, "main_menu");
    }
    return;
  }

  // Mahsulot raqamini kiritish
  if (currentState === "user_select_product_number") {
    const productNumber = parseInt(text.trim(), 10);
    if (isNaN(productNumber) || productNumber <= 0) {
      await bot.sendMessage(
        chatId,
        "❌ Noto'g'ri raqam. Iltimos, yuqoridagi ro'yxatdan mahsulot raqamini kiriting."
      );
      return;
    }

    // Kategoriya ID bo'lsa, faqat o'sha kategoriyadagi mahsulotlarni olish
    const categoryId = userState.getData(telegramId, "current_category_id");
    let allProducts;
    if (categoryId) {
      allProducts = await productService.getProductsByCategoryId(categoryId);
    } else {
      allProducts = await productService.getAllProducts();
    }

    if (productNumber > allProducts.length) {
      await bot.sendMessage(
        chatId,
        `❌ Mahsulot raqami ${allProducts.length} dan katta bo'lishi mumkin emas.\n\nYuqoridagi ro'yxatdan to'g'ri raqamni tanlang.`
      );
      return;
    }

    const selectedProduct = allProducts[productNumber - 1];
    console.log(
      `Foydalanuvchi ${productNumber} raqamli mahsulotni tanladi:`,
      selectedProduct.name
    );

    await displayUserSelectedProduct(bot, telegramId, selectedProduct, null);
    userState.setState(telegramId, "user_viewing_product");
    return;
  }

  // Guruhdan xabar kelganda guruh ID sini ko'rsatish (faqat admin uchun)
  if (msg.chat.type === "group" || msg.chat.type === "supergroup") {
    if (isAdmin(telegramId)) {
      await bot.sendMessage(
        chatId,
        `📋 <b>Guruh ma'lumotlari:</b>\n\n` +
          `🆔 <b>Guruh ID:</b> <code>${msg.chat.id}</code>\n` +
          `📝 <b>Guruh nomi:</b> ${msg.chat.title || "Noma'lum"}\n` +
          `👥 <b>Guruh turi:</b> ${msg.chat.type}\n` +
          `📌 <b>Topic ID:</b> ${msg.message_thread_id || "Yo'q"}\n\n` +
          `💡 Bu ID ni import qilish uchun ishlatishingiz mumkin!`,
        { parse_mode: "HTML" }
      );
    }
    return;
  }

  // Post tashlash state da postlarni qayta ishlash (faqat admin uchun)
  if (
    isAdmin(telegramId) &&
    currentState === "admin_send_post" &&
    (msg.photo || msg.caption)
  ) {
    console.log("Post tashlash state da post qayta ishlanmoqda...");

    try {
      // Post ma'lumotlarini olish
      const photo = msg.photo ? msg.photo[msg.photo.length - 1] : null;
      const caption = msg.caption || "";

      if (!photo || !caption) {
        await bot.sendMessage(telegramId, "❌ Postda rasm yoki matn yo'q!");
        return;
      }

      // Matnni satrlarga ajratish
      const lines = caption
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // 1. Nomi: birinchi satr
      const name = lines[0];
      if (!name) {
        await bot.sendMessage(telegramId, "❌ Postda mahsulot nomi topilmadi!");
        return;
      }

      // 2. Narx: "Narxi:" yoki "💸 Narxi:" so'zini qidirish
      const priceLine = lines.find((line) => /narxi/i.test(line));
      let price = null;
      if (priceLine) {
        const priceMatch = priceLine.match(/([\d\s']+)[^\d]*$/);
        price = priceMatch ? parseInt(priceMatch[1].replace(/\D/g, "")) : null;
      }

      if (!price) {
        await bot.sendMessage(telegramId, "❌ Postda narx topilmadi!");
        return;
      }

      // 3. Tavsif: narxdan oldingi barcha satrlar
      const priceIndex = lines.findIndex((line) => /narxi/i.test(line));
      let description = "";

      if (priceIndex > 1) {
        const descLines = lines.slice(1, priceIndex);
        description = descLines.join(" ");
      } else if (lines.length > 1) {
        description = lines.slice(1, 5).join(" ");
      }

      // 4. Kategoriya: avtomatik aniqlash
      const productName = name.toLowerCase();
      let categoryName = "Boshqa";

      if (productName.includes("atir") || productName.includes("parfum")) {
        categoryName = "Atirlar";
      } else if (
        productName.includes("sovun") ||
        productName.includes("shampun")
      ) {
        categoryName = "Kosmetika";
      } else if (
        productName.includes("krem") ||
        productName.includes("loshon")
      ) {
        categoryName = "Kosmetika";
      }

      // Mahsulot allaqachon mavjudligini tekshirish
      const existingProduct = await productService.getProductByName(name);
      if (existingProduct) {
        await bot.sendMessage(
          telegramId,
          `❌ Mahsulot allaqachon mavjud: ${name}`
        );
        return;
      }

      // Kategoriya ID ni aniqlash yoki yaratish
      let category = await categoryService.getCategoryByName(categoryName);
      if (!category) {
        category = await categoryService.addCategory(categoryName);
      }

      // Mahsulotni ko'rib chiqish uchun qo'shish
      const productData = {
        name,
        price,
        description,
        imageUrl: "", // Rasm URL ni keyinroq olamiz
        imageFileId: photo.file_id,
        categoryId: null, // Avval kategoriyasiz, ko'rib chiqilgandan keyin belgilanadi
        suggestedCategory: categoryName, // AI taklif qilgan kategoriya
        tags: [], // AI xeshteglari
      };

      const newProduct = await productService.addProductFromChannel(
        productData
      );

      await bot.sendMessage(
        telegramId,
        `✅ Mahsulot ko'rib chiqish uchun qo'shildi!\n\n` +
          `📦 Nomi: ${name}\n` +
          `💰 Narx: ${price} so'm\n` +
          `📝 Tavsif: ${description.substring(0, 100)}...\n` +
          `📂 Taklif qilingan kategoriya: ${categoryName}\n\n` +
          `🔄 Davom eting yoki tasdiqlash tugmasini bosing!`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔄 Davom eting",
                  callback_data: "continue_send_post",
                },
                {
                  text: "✅ Tasdiqlash",
                  callback_data: "finish_send_post",
                },
              ],
            ],
          },
        }
      );

      console.log(`Post tashlash state da post qayta ishlandi: ${name}`);
    } catch (error) {
      console.error(
        "Post tashlash state da postni qayta ishlashda xato:",
        error
      );
      await bot.sendMessage(telegramId, `❌ Xato: ${error.message}`);
    }
    return;
  }

  // Forward qilingan postlarni qayta ishlash (faqat admin uchun)
  if (
    isAdmin(telegramId) &&
    msg.forward_from_chat &&
    (msg.photo || msg.caption)
  ) {
    console.log("Forward qilingan post qayta ishlanmoqda...");

    try {
      // Post ma'lumotlarini olish
      const photo = msg.photo ? msg.photo[msg.photo.length - 1] : null;
      const caption = msg.caption || "";

      if (!photo || !caption) {
        await bot.sendMessage(telegramId, "❌ Postda rasm yoki matn yo'q!");
        return;
      }

      // Matnni satrlarga ajratish
      const lines = caption
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      // 1. Nomi: birinchi satr
      const name = lines[0];
      if (!name) {
        await bot.sendMessage(telegramId, "❌ Postda mahsulot nomi topilmadi!");
        return;
      }

      // 2. Narx: "Narxi:" yoki "💸 Narxi:" so'zini qidirish
      const priceLine = lines.find((line) => /narxi/i.test(line));
      let price = null;
      if (priceLine) {
        const priceMatch = priceLine.match(/([\d\s']+)[^\d]*$/);
        price = priceMatch ? parseInt(priceMatch[1].replace(/\D/g, "")) : null;
      }

      if (!price) {
        await bot.sendMessage(telegramId, "❌ Postda narx topilmadi!");
        return;
      }

      // 3. Tavsif: narxdan oldingi barcha satrlar
      const priceIndex = lines.findIndex((line) => /narxi/i.test(line));
      let description = "";

      if (priceIndex > 1) {
        const descLines = lines.slice(1, priceIndex);
        description = descLines.join(" ");
      } else if (lines.length > 1) {
        description = lines.slice(1, 5).join(" ");
      }

      // 4. Kategoriya: avtomatik aniqlash
      const productName = name.toLowerCase();
      let categoryName = "Boshqa";

      if (productName.includes("atir") || productName.includes("parfum")) {
        categoryName = "Atirlar";
      } else if (
        productName.includes("sovun") ||
        productName.includes("shampun")
      ) {
        categoryName = "Kosmetika";
      } else if (
        productName.includes("krem") ||
        productName.includes("loshon")
      ) {
        categoryName = "Kosmetika";
      }

      // Mahsulot allaqachon mavjudligini tekshirish
      const existingProduct = await productService.getProductByName(name);
      if (existingProduct) {
        await bot.sendMessage(
          telegramId,
          `❌ Mahsulot allaqachon mavjud: ${name}`
        );
        return;
      }

      // Kategoriya ID ni aniqlash yoki yaratish
      let category = await categoryService.getCategoryByName(categoryName);
      if (!category) {
        category = await categoryService.addCategory(categoryName);
      }

      // Mahsulotni ko'rib chiqish uchun qo'shish
      const productData = {
        name,
        price,
        description,
        imageUrl: "", // Rasm URL ni keyinroq olamiz
        imageFileId: photo.file_id,
        categoryId: null, // Avval kategoriyasiz, ko'rib chiqilgandan keyin belgilanadi
        suggestedCategory: categoryName, // AI taklif qilgan kategoriya
        tags: [], // AI xeshteglari
      };

      const newProduct = await productService.addProductFromChannel(
        productData
      );

      await bot.sendMessage(
        telegramId,
        `✅ Mahsulot ko'rib chiqish uchun qo'shildi!\n\n` +
          `📦 Nomi: ${name}\n` +
          `💰 Narx: ${price} so'm\n` +
          `📝 Tavsif: ${description.substring(0, 100)}...\n` +
          `📂 Taklif qilingan kategoriya: ${categoryName}`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "⏳ Ko'rib chiqilishi kerak",
                  callback_data: "review_pending_products",
                },
              ],
              [
                {
                  text: "📝 Post tashlash",
                  callback_data: "send_post",
                },
                {
                  text: "🔙 Admin paneliga qaytish",
                  callback_data: "back_to_admin_main",
                },
              ],
            ],
          },
        }
      );

      console.log(`Forward qilingan post qayta ishlandi: ${name}`);
    } catch (error) {
      console.error("Forward qilingan postni qayta ishlashda xato:", error);
      await bot.sendMessage(telegramId, `❌ Xato: ${error.message}`);
    }
    return;
  }

  // 4. Chatbot funksiyasi - oddiy so'zlarga javob berish
  if (!text) {
    await bot.sendMessage(
      chatId,
      _getTranslation("unknown_command_general"),
      mainMenuKeyboard(userLanguage)
    );
    return;
  }
  const lowerText = text.toLowerCase();

  // Mahsulotlar haqida so'ralganda
  if (
    lowerText.includes("mahsulot") ||
    lowerText.includes("tovar") ||
    lowerText.includes("nima bor")
  ) {
    await displayUserProducts(bot, chatId, null, 0);
    userState.setState(telegramId, "user_browse_products");
    return;
  }

  // Narx haqida so'ralganda
  if (
    lowerText.includes("narx") ||
    lowerText.includes("qancha") ||
    lowerText.includes("qiymat")
  ) {
    await bot.sendMessage(
      chatId,
      "💰 Mahsulotlarimizning narxlari 10,000 so'mdan boshlanadi. Aniq narxni bilish uchun mahsulotni tanlang yoki qidiruvdan foydalaning!"
    );
    return;
  }

  // Yetkazib berish haqida so'ralganda
  if (
    lowerText.includes("yetkazib") ||
    lowerText.includes("delivery") ||
    lowerText.includes("olib ketish")
  ) {
    await bot.sendMessage(
      chatId,
      "🚚 Yetkazib berish bepul! Toshkent shahri bo'ylab 1-2 kun ichida yetkazib beramiz."
    );
    return;
  }

  // Aloqa haqida so'ralganda
  if (
    lowerText.includes("aloqa") ||
    lowerText.includes("bog") ||
    lowerText.includes("telefon")
  ) {
    await bot.sendMessage(
      chatId,
      "📞 <b>Biz bilan bog'lanish:</b>\n\n📱 Telefon: +998 77 737 00 95\n📢 Kanal: @denaroma_oqbilol\n👤 Admin: @denaroma_oqbilol_admin",
      { parse_mode: "HTML" }
    );
    return;
  }

  // Salom/assalomu alaykum
  if (
    lowerText.includes("salom") ||
    lowerText.includes("assalomu") ||
    lowerText.includes("hello")
  ) {
    await bot.sendMessage(
      chatId,
      "👋 Assalomu alaykum! Botimizga xush kelibsiz! 🛍️\n\nMahsulotlarimizni ko'rish uchun '🛍 Onlayn do'kon' tugmasini bosing."
    );
    return;
  }

  // Rahmat/thanks
  if (
    lowerText.includes("rahmat") ||
    lowerText.includes("thanks") ||
    lowerText.includes("spasibo")
  ) {
    await bot.sendMessage(
      chatId,
      "😊 Rahmat! Yana biror narsa kerak bo'lsa, so'rang!"
    );
    return;
  }

  // 5. Aks holda, foydalanuvchiga menyudan bo'lim tanlashni so'raymiz
  await bot.sendMessage(
    chatId,
    _getTranslation("unknown_command_general"),
    mainMenuKeyboard(userLanguage)
  );
  return;
};

// --- Admin Kategoriya Qo'shish Logikasi ---
const handleAdminAddCategory = async (
  bot,
  msg,
  telegramId,
  categoryName,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!categoryName || categoryName.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_category_name_required")
    );
    return;
  }

  try {
    const existingCategory = await categoryService.getCategoryByName(
      categoryName.trim()
    );
    if (existingCategory) {
      await bot.sendMessage(
        msg.chat.id,
        _getTranslation("admin_category_already_exists")
      );
      return;
    }

    await categoryService.addCategory(categoryName.trim());
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_category_added", { name: categoryName })
    );
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_manage_categories_prompt"),
      {
        reply_markup: manageCategoriesKeyboard(userLanguage),
      }
    );
    userState.setState(telegramId, "admin_manage_categories");
  } catch (error) {
    console.error("Kategoriya qo'shishda xato: ", error);
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_error_adding_category", {
        errorMessage: error.message,
      })
    );
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_manage_categories_prompt"),
      {
        reply_markup: manageCategoriesKeyboard(userLanguage),
      }
    );
    userState.setState(telegramId, "admin_manage_categories");
  }
};

// --- Admin Mahsulot Qo'shish Logikasi (bosqichma-bosqich) ---
const handleAdminAddProductName = async (
  bot,
  msg,
  telegramId,
  productName,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!productName || productName.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      "Mahsulot nomi bo'sh bo'lishi mumkin emas!"
    );
    return;
  }

  const productTemp = userState.getData(telegramId, "product_temp") || {};
  productTemp.name = productName.trim();
  productTemp.discountPrice = null;
  productTemp.isDiscount = false;
  userState.setData(telegramId, "product_temp", productTemp);

  // Kategoriya allaqachon tanlangan, shuning uchun to'g'ridan-to'g'ri tavsif so'raymiz
  await bot.sendMessage(msg.chat.id, "Mahsulot tavsifini kiriting:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "❌ Bekor qilish",
            callback_data: "cancel_add_product",
          },
        ],
      ],
    },
  });
  userState.setState(telegramId, "admin_add_product_description");
};

const handleAdminAddProductDescription = async (
  bot,
  msg,
  telegramId,
  productDescription,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!productDescription || productDescription.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      "Mahsulot tavsifi bo'sh bo'lishi mumkin emas!"
    );
    return;
  }

  const productTemp = userState.getData(telegramId, "product_temp");
  productTemp.description = productDescription.trim();
  userState.setData(telegramId, "product_temp", productTemp);

  await bot.sendMessage(
    msg.chat.id,
    "Mahsulot narxini kiriting (faqat raqam):",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "❌ Bekor qilish",
              callback_data: "cancel_add_product",
            },
          ],
        ],
      },
    }
  );
  userState.setState(telegramId, "admin_add_product_price");
};

const handleAdminAddProductPrice = async (
  bot,
  msg,
  telegramId,
  productPrice,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  const price = parseFloat(productPrice.trim());
  if (isNaN(price) || price <= 0) {
    await bot.sendMessage(
      msg.chat.id,
      "Noto'g'ri narx. Iltimos, to'g'ri raqam kiriting."
    );
    return;
  }

  const productTemp = userState.getData(telegramId, "product_temp");
  productTemp.price = price;
  userState.setData(telegramId, "product_temp", productTemp);

  await bot.sendMessage(
    msg.chat.id,
    "🏷️ Skidka narxini kiriting (yoki 'yo'q' deb yozing):",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "❌ Skidka yo'q",
              callback_data: "add_product_no_discount",
            },
          ],
          [
            {
              text: "❌ Bekor qilish",
              callback_data: "cancel_add_product",
            },
          ],
        ],
      },
    }
  );
  userState.setState(telegramId, "admin_add_product_discount_price");
};

const handleAdminAddProductDiscountPrice = async (
  bot,
  msg,
  telegramId,
  discountPriceText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;
  const productTemp = userState.getData(telegramId, "product_temp");

  if (
    discountPriceText.toLowerCase() === "yo'q" ||
    discountPriceText.toLowerCase() === "yoq" ||
    discountPriceText.toLowerCase() === "no"
  ) {
    productTemp.discountPrice = null;
    productTemp.isDiscount = false;
  } else {
    const discountPrice = parseFloat(discountPriceText.trim());
    if (
      isNaN(discountPrice) ||
      discountPrice <= 0 ||
      discountPrice >= productTemp.price
    ) {
      await bot.sendMessage(
        msg.chat.id,
        "❌ Noto'g'ri skidka narxi! Asosiy narxdan kichik bo'lishi kerak."
      );
      return;
    }
    productTemp.discountPrice = discountPrice;
    productTemp.isDiscount = true;
  }

  userState.setData(telegramId, "product_temp", productTemp);

  await bot.sendMessage(msg.chat.id, "Mahsulot rasmini yoki URLini kiriting:", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "❌ Bekor qilish",
            callback_data: "cancel_add_product",
          },
        ],
      ],
    },
  });
  userState.setState(telegramId, "admin_add_product_image_url");
};

const handleAdminAddProductImage = async (
  bot,
  msg,
  telegramId,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;
  const productTemp = userState.getData(telegramId, "product_temp");

  console.log(
    "Rasm qo'shish jarayoni boshlandi. Msg turi:",
    msg.photo ? "photo" : msg.text ? "text" : "other"
  );
  console.log("Product temp ma'lumotlari:", productTemp);

  let imageUrl = null;
  let imageFileId = null;

  if (msg.photo && msg.photo.length > 0) {
    console.log(
      "Rasm yuborildi, file_id:",
      msg.photo[msg.photo.length - 1].file_id
    );
    imageFileId = msg.photo[msg.photo.length - 1].file_id;
    try {
      const fileLink = await bot.getFileLink(imageFileId);
      imageUrl = fileLink;
      console.log("Rasm URL olish muvaffaqiyatli:", imageUrl);
    } catch (error) {
      console.error("Rasm faylidan URL olishda xato:", error);
      await bot.sendMessage(
        msg.chat.id,
        "❌ Rasm faylidan URL olishda xato yuz berdi. Iltimos, qaytadan urinib ko'ring yoki boshqa rasm yuboring."
      );
      return;
    }
  } else if (msg.text) {
    const text = msg.text.trim();
    console.log("Matn yuborildi:", text);
    if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(text)) {
      imageUrl = text;
      console.log("To'g'ri URL format:", imageUrl);
    } else {
      await bot.sendMessage(
        msg.chat.id,
        "❌ Noto'g'ri rasm URL format.\n\n✅ To'g'ri formatlar:\n• https://example.com/image.jpg\n• https://example.com/image.png\n• https://example.com/image.jpeg\n\nYoki to'g'ridan-to'g'ri rasm faylini yuboring."
      );
      return;
    }
  } else {
    await bot.sendMessage(
      msg.chat.id,
      "📸 Iltimos, mahsulot rasmini yuboring yoki rasm URLini kiriting.\n\n💡 Maslahat:\n• Rasm faylini to'g'ridan-to'g'ri yuborish tavsiya etiladi\n• URL bo'lsa, to'g'ri formatda bo'lishi kerak"
    );
    return;
  }

  if (
    !productTemp ||
    !productTemp.categoryId ||
    !productTemp.name ||
    !productTemp.description ||
    productTemp.price === undefined ||
    productTemp.price === null
  ) {
    console.error("Mahsulot ma'lumotlari to'liq emas:", productTemp);
    await bot.sendMessage(
      msg.chat.id,
      "❌ Mahsulot ma'lumotlari to'liq emas! Qaytadan boshlang."
    );
    userState.deleteData(telegramId, "product_temp");
    await bot.sendMessage(msg.chat.id, "Mahsulotlarni boshqarish", {
      reply_markup: manageProductsKeyboard(userLanguage),
    });
    userState.setState(telegramId, "admin_manage_products");
    return;
  }

  productTemp.imageUrl = imageUrl;
  productTemp.imageFileId = imageFileId;
  userState.setData(telegramId, "product_temp", productTemp);

  console.log("Mahsulot saqlashga tayyor:", {
    categoryId: productTemp.categoryId,
    name: productTemp.name,
    description: productTemp.description?.substring(0, 50) + "...",
    price: productTemp.price,
    discountPrice: productTemp.discountPrice,
    isDiscount: productTemp.isDiscount,
    imageUrl: imageUrl ? "Mavjud" : "Yo'q",
  });

  // Mahsulotni saqlash
  try {
    const newProduct = await productService.addProduct(productTemp);
    console.log("Mahsulot muvaffaqiyatli saqlandi:", newProduct._id);

    // Mahsulot ma'lumotlari bilan xabar tayyorlash
    const productInfo = `✅ Mahsulot muvaffaqiyatli qo'shildi!\n\n📝 Nomi: ${
      newProduct.name
    }\n💰 Narxi: ${newProduct.price} so'm${
      newProduct.isDiscount
        ? `\n🔥 Skidka: ${newProduct.discountPrice} so'm`
        : ""
    }\n📄 Tavsif: ${newProduct.description.substring(0, 100)}...`;

    // Agar rasm mavjud bo'lsa, rasm bilan birga yuborish
    if (imageFileId) {
      try {
        await bot.sendPhoto(msg.chat.id, imageFileId, {
          caption: productInfo,
          parse_mode: "HTML",
        });
      } catch (photoError) {
        console.error("Rasm bilan yuborishda xato:", photoError);
        // Rasm bilan yuborishda xato bo'lsa, oddiy xabar yuborish
        await bot.sendMessage(msg.chat.id, productInfo);
      }
    } else {
      // Rasm yo'q bo'lsa, oddiy xabar yuborish
      await bot.sendMessage(msg.chat.id, productInfo);
    }

    await bot.sendMessage(msg.chat.id, "Mahsulotlarni boshqarish", {
      reply_markup: manageProductsKeyboard(userLanguage),
    });
    userState.setState(telegramId, "admin_manage_products");
    userState.deleteData(telegramId, "product_temp");
  } catch (error) {
    console.error("Mahsulot qo'shishda xato:", error);
    console.error("Xato stack:", error.stack);
    await bot.sendMessage(
      msg.chat.id,
      `❌ Mahsulot qo'shishda xato yuz berdi:\n\n${error.message}\n\nIltimos, qaytadan urinib ko'ring.`
    );
    await bot.sendMessage(msg.chat.id, "Mahsulotlarni boshqarish", {
      reply_markup: manageProductsKeyboard(userLanguage),
    });
    userState.setState(telegramId, "admin_manage_products");
    userState.deleteData(telegramId, "product_temp");
  }
};

// --- Admin Boshqa Foydalanuvchilarga Xabar Yuborish Logikasi ---
const handleAdminSendMessage = async (
  bot,
  msg,
  telegramId,
  messageText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!messageText || messageText.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_message_text_required")
    );
    return;
  }

  try {
    const allUsers = await userService.getAllUsers();
    let sentCount = 0;
    let failedCount = 0;

    for (const user of allUsers) {
      try {
        if (user.telegramId === telegramId) continue; // Adminning o'ziga xabar yubormaslik
        await bot.sendMessage(user.telegramId, messageText);
        sentCount++;
      } catch (sendError) {
        console.error(
          `Foydalanuvchiga xabar yuborishda xato ${user.telegramId}: `,
          sendError
        );
        failedCount++;
      }
    }

    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_message_sent_summary", {
        sent: sentCount,
        failed: failedCount,
      })
    );
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_panel_welcome_inline"),
      {
        reply_markup: adminMainMenuInlineKeyboard(userLanguage),
      }
    );
    userState.setState(telegramId, "admin_main");
  } catch (error) {
    console.error("Xabarlarni yuborishda xato: ", error);
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_error_sending_message", {
        errorMessage: error.message,
      })
    );
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_panel_welcome_inline"),
      {
        reply_markup: adminMainMenuInlineKeyboard(userLanguage),
      }
    );
    userState.setState(telegramId, "admin_main");
  }
};

// --- Admin: Mahsulot uchun yangi kategoriya yaratish ---
const handleAdminCreateCategoryForProduct = async (
  bot,
  msg,
  telegramId,
  categoryName,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!categoryName || categoryName.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      "Kategoriya nomi bo'sh bo'lishi mumkin emas!"
    );
    return;
  }

  try {
    const productId = userState.getData(telegramId, "new_category_for_product");
    if (!productId) {
      await bot.sendMessage(msg.chat.id, "Mahsulot topilmadi!");
      return;
    }

    // Kategoriyani yaratish
    const existingCategory = await categoryService.getCategoryByName(
      categoryName.trim()
    );
    let category;

    if (existingCategory) {
      category = existingCategory;
    } else {
      category = await categoryService.addCategory(categoryName.trim());
    }

    // Mahsulotga kategoriyani belgilash
    await productService.assignCategoryToProduct(productId, category._id);

    await bot.sendMessage(
      msg.chat.id,
      `✅ Yangi kategoriya "${categoryName}" yaratildi va mahsulotga belgilandi!`
    );

    // Kategoriyasiz mahsulotlar ro'yxatiga qaytish
    await bot.sendMessage(msg.chat.id, "📋 Boshqa kategoriyasiz mahsulotlar:", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📋 Kategoriyasiz mahsulotlar",
              callback_data: "uncategorized_products",
            },
          ],
          [
            {
              text: "🔙 Admin paneliga qaytish",
              callback_data: "back_to_admin_main",
            },
          ],
        ],
      },
    });

    userState.deleteData(telegramId, "new_category_for_product");
    userState.setState(telegramId, "admin_main");
  } catch (error) {
    console.error("Kategoriya yaratishda xato: ", error);
    await bot.sendMessage(msg.chat.id, `❌ Xato: ${error.message}`);
    userState.setState(telegramId, "admin_main");
  }
};

// Kategoriya tahrirlash funksiyasi
const handleAdminEditCategoryName = async (
  bot,
  msg,
  telegramId,
  newCategoryName,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;
  const categoryId = userState.getData(telegramId, "category_to_edit_id");

  if (!categoryId) {
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("error_processing_request")
    );
    userState.setState(telegramId, "admin_main");
    return;
  }

  if (!newCategoryName || newCategoryName.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_category_name_required")
    );
    return;
  }

  try {
    const oldCategory = await categoryService.getCategoryById(categoryId);
    if (!oldCategory) {
      await bot.sendMessage(msg.chat.id, _getTranslation("category_not_found"));
      userState.setState(telegramId, "admin_main");
      return;
    }

    const updatedCategory = await categoryService.updateCategory(
      categoryId,
      newCategoryName.trim()
    );
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_category_updated", {
        oldName: oldCategory.name,
        newName: updatedCategory.name,
      })
    );
    userState.deleteData(telegramId, "category_to_edit_id");
    await displayAdminCategories(bot, telegramId, null);
    userState.setState(telegramId, "admin_manage_categories");
  } catch (error) {
    console.error("Kategoriyani tahrirlashda xato: ", error);
    await bot.sendMessage(
      msg.chat.id,
      _getTranslation("admin_error_updating_category", {
        errorMessage: error.message,
      })
    );
    await displayAdminCategories(bot, telegramId, null);
    userState.setState(telegramId, "admin_manage_categories");
  }
};

// Oddiy post yuborish funksiyasi
const handleAdminSendRegularPost = async (
  bot,
  msg,
  telegramId,
  postText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!postText || postText.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      "❌ Post matni bo'sh bo'lishi mumkin emas!"
    );
    return;
  }

  try {
    const allUsers = await userService.getAllUsers();
    let sentCount = 0;
    let failedCount = 0;

    for (const user of allUsers) {
      try {
        if (user.telegramId === telegramId) continue; // Adminning o'ziga xabar yubormaslik
        await bot.sendMessage(user.telegramId, postText, {
          parse_mode: "HTML",
        });
        sentCount++;
      } catch (sendError) {
        console.error(
          `Foydalanuvchiga post yuborishda xato ${user.telegramId}: `,
          sendError
        );
        failedCount++;
      }
    }

    await bot.sendMessage(
      msg.chat.id,
      `✅ <b>Post yuborildi!</b>\n\n` +
        `📊 <b>Natija:</b>\n` +
        `✅ Yuborildi: ${sentCount} ta\n` +
        `❌ Yuborilmadi: ${failedCount} ta`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: _getTranslation("back_to_admin_main"),
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
  } catch (error) {
    console.error("Post yuborishda xato: ", error);
    await bot.sendMessage(
      msg.chat.id,
      `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: _getTranslation("back_to_admin_main"),
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
  }
};

// Mahsulot tahrirlash funksiyasi
const handleAdminEditProduct = async (
  bot,
  msg,
  telegramId,
  text,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  const productData = userState.getData(telegramId, "product_to_edit");
  if (!productData) {
    await bot.sendMessage(msg.chat.id, "❌ Mahsulot ma'lumotlari topilmadi!");
    userState.setState(telegramId, "admin_main");
    return;
  }

  const { currentStep, productData: product } = productData;

  switch (currentStep) {
    case "edit_name":
      if (!text || text.trim() === "") {
        await bot.sendMessage(
          msg.chat.id,
          "❌ Mahsulot nomi bo'sh bo'lishi mumkin emas!"
        );
        return;
      }
      product.name = text.trim();
      productData.currentStep = "edit_description";
      userState.setData(telegramId, "product_to_edit", productData);

      await bot.sendMessage(msg.chat.id, "📝 Mahsulot tavsifini kiriting:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "❌ Bekor qilish",
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      });
      break;

    case "edit_description":
      product.description = text.trim();
      productData.currentStep = "edit_price";
      userState.setData(telegramId, "product_to_edit", productData);

      await bot.sendMessage(msg.chat.id, "💰 Mahsulot narxini kiriting:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "❌ Bekor qilish",
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      });
      break;

    case "edit_price":
      const price = parseFloat(text.trim());
      if (isNaN(price) || price <= 0) {
        await bot.sendMessage(
          msg.chat.id,
          "❌ Noto'g'ri narx! Faqat raqam kiriting."
        );
        return;
      }
      product.price = price;
      productData.currentStep = "edit_discount";
      userState.setData(telegramId, "product_to_edit", productData);

      await bot.sendMessage(
        msg.chat.id,
        "🏷️ Skidka narxini kiriting (yoki 'yo'q' deb yozing):",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "❌ Skidka yo'q",
                  callback_data: "edit_discount_none",
                },
              ],
              [
                {
                  text: "❌ Bekor qilish",
                  callback_data: "back_to_admin_main",
                },
              ],
            ],
          },
        }
      );
      break;

    case "edit_discount":
      if (
        text.toLowerCase() === "yo'q" ||
        text.toLowerCase() === "yoq" ||
        text.toLowerCase() === "no"
      ) {
        product.discountPrice = null;
        product.isDiscount = false;
      } else {
        const discountPrice = parseFloat(text.trim());
        if (
          isNaN(discountPrice) ||
          discountPrice <= 0 ||
          discountPrice >= product.price
        ) {
          await bot.sendMessage(
            msg.chat.id,
            "❌ Noto'g'ri skidka narxi! Asosiy narxdan kichik bo'lishi kerak."
          );
          return;
        }
        product.discountPrice = discountPrice;
        product.isDiscount = true;
      }

      // Mahsulotni saqlash
      try {
        await productService.updateProduct(productData.productId, product);
        await bot.sendMessage(
          msg.chat.id,
          `✅ <b>Mahsulot muvaffaqiyatli tahrirlandi!</b>\n\n` +
            `📝 Nomi: ${product.name}\n` +
            `💰 Narxi: ${product.price} so'm\n` +
            `${
              product.isDiscount
                ? `🔥 Skidka: ${product.discountPrice} so'm`
                : "❌ Skidka yo'q"
            }\n` +
            `📄 Tavsif: ${product.description.substring(0, 100)}...`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: _getTranslation("back_to_admin_main"),
                    callback_data: "back_to_admin_main",
                  },
                ],
              ],
            },
          }
        );
        userState.deleteData(telegramId, "product_to_edit");
        userState.setState(telegramId, "admin_main");
      } catch (error) {
        console.error("Mahsulotni tahrirlashda xato:", error);
        await bot.sendMessage(
          msg.chat.id,
          `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: _getTranslation("back_to_admin_main"),
                    callback_data: "back_to_admin_main",
                  },
                ],
              ],
            },
          }
        );
        userState.setState(telegramId, "admin_main");
      }
      break;

    default:
      await bot.sendMessage(msg.chat.id, "❌ Noma'lum amal!");
      userState.setState(telegramId, "admin_main");
      break;
  }
};

// Skidka davomiyligini qabul qilish funksiyasi
const handleAdminEnterDiscountDuration = async (
  bot,
  msg,
  telegramId,
  durationText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  const product = userState.getData(telegramId, "discount_post_product");
  if (!product) {
    await bot.sendMessage(msg.chat.id, "❌ Mahsulot ma'lumotlari topilmadi!");
    userState.setState(telegramId, "admin_main");
    return;
  }

  let duration = durationText.trim().toLowerCase();
  let durationDisplay = "";

  if (duration === "cheksiz" || duration === "cheklanmagan") {
    durationDisplay = "Cheksiz";
  } else {
    const days = parseInt(duration);
    if (isNaN(days) || days <= 0) {
      await bot.sendMessage(
        msg.chat.id,
        "❌ Noto'g'ri davomiylik! Kunlarda raqam kiriting yoki 'cheksiz' deb yozing."
      );
      return;
    }
    durationDisplay = `${days} kun`;
  }

  // Tayyor post matni
  let postText = "🔥 <b>MAXSUS TAKLIF!</b> 🔥\n\n";
  postText += `📦 <b>${product.name}</b>\n\n`;

  if (product.description) {
    postText += `📝 <b>Tavsif:</b>\n${product.description}\n\n`;
  }

  postText += `💰 <s>Eski narx: ${product.price} so'm</s>\n`;
  postText += `🔥 <b>Skidka narx: ${product.discountPrice} so'm</b>\n`;
  postText += `💸 <b>Chegirma: ${
    product.price - product.discountPrice
  } so'm</b>\n\n`;
  postText += `⏰ <b>Skidka davomiyligi: ${durationDisplay}</b>\n\n`;
  postText += "⚡️ <b>Tez harakat qiling, taklif cheklangan!</b> ⚡️\n\n";
  postText += "📱 <b>Bog'lanish:</b> +998 77 737 00 95\n";
  postText += "📢 <b>Kanalimiz:</b> @denaroma_oqbilol";

  // Admin uchun ko'rsatish va tasdiqlash
  if (product.imageFileId || product.imageUrl) {
    const imageSource = product.imageFileId || product.imageUrl;
    await bot.sendPhoto(msg.chat.id, imageSource, {
      caption: postText,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Barcha foydalanuvchilarga yuborish",
              callback_data: `confirm_send_single_discount_${product._id}`,
            },
          ],
          [
            {
              text: "❌ Bekor qilish",
              callback_data: "back_to_admin_main",
            },
          ],
        ],
      },
    });
  } else {
    await bot.sendMessage(msg.chat.id, postText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Barcha foydalanuvchilarga yuborish",
              callback_data: `confirm_send_single_discount_${product._id}`,
            },
          ],
          [
            {
              text: "❌ Bekor qilish",
              callback_data: "back_to_admin_main",
            },
          ],
        ],
      },
    });
  }

  userState.setData(telegramId, "discount_post_text", postText);
  userState.setState(telegramId, "admin_main");
};

// Mahsulot qidirish funksiyasi (skidka uchun)
const handleAdminSearchProductForDiscount = async (
  bot,
  msg,
  telegramId,
  searchQuery,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  if (!searchQuery || searchQuery.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      "❌ Qidiruv so'zi bo'sh bo'lishi mumkin emas!"
    );
    return;
  }

  try {
    const allProducts = await productService.getAllProducts();
    const searchTerm = searchQuery.trim().toLowerCase();

    // 1. Aniq moslik qidirish
    let searchResults = allProducts.filter(
      (product) =>
        product.name.toLowerCase() === searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description &&
          product.description.toLowerCase().includes(searchTerm))
    );

    // 2. Agar aniq moslik topilmasa, so'zlarni ajratib qidirish
    if (searchResults.length === 0) {
      const searchWords = searchTerm
        .split(/\s+/)
        .filter((word) => word.length > 1);

      searchResults = allProducts.filter((product) => {
        const productName = product.name.toLowerCase();
        const productDesc = (product.description || "").toLowerCase();

        // Har bir so'z mahsulot nomida yoki tavsifida bo'lishi kerak
        return searchWords.every(
          (word) => productName.includes(word) || productDesc.includes(word)
        );
      });
    }

    // 3. Agar hali ham topilmasa, fuzzy search qilamiz
    if (searchResults.length === 0) {
      try {
        // Fuse.js yordamida fuzzy search
        const Fuse = (await import("fuse.js")).default;
        const fuse = new Fuse(allProducts, {
          keys: ["name", "description"],
          threshold: 0.5, // 50% moslik
          includeScore: true,
          minMatchCharLength: 2,
          ignoreLocation: true,
          useExtendedSearch: false,
        });

        const fuzzyResults = fuse.search(searchTerm);
        const fuzzyProducts = fuzzyResults
          .filter((result) => result.score < 0.7) // Faqat yaxshi natijalarni olish
          .map((result) => result.item)
          .slice(0, 8); // Eng ko'pi bilan 8 ta natija

        if (fuzzyProducts.length > 0) {
          let messageText = `🔍 <b>Qidiruv natijasi: "${searchQuery}"</b>\n\n`;
          messageText += `💡 <i>Aniq moslik topilmadi, lekin o'xshash mahsulotlar:</i>\n\n`;
          const inlineKeyboard = [];

          fuzzyProducts.forEach((product, index) => {
            messageText += `${index + 1}. <b>${product.name}</b>\n`;
            messageText += `💰 ${product.price} so'm\n`;
            if (product.isDiscount && product.discountPrice) {
              messageText += `🔥 Skidka: ${product.discountPrice} so'm\n`;
            }
            if (product.description) {
              messageText += `📝 ${product.description.substring(0, 50)}...\n`;
            }
            messageText += `\n`;

            inlineKeyboard.push([
              {
                text: `${product.name}${product.isDiscount ? " 🔥" : ""}`,
                callback_data: `add_discount_to_product_${product._id}`,
              },
            ]);
          });

          inlineKeyboard.push([
            {
              text: "🔍 Qayta qidirish",
              callback_data: "search_product_for_discount",
            },
          ]);

          inlineKeyboard.push([
            {
              text: _getTranslation("back_to_admin_main"),
              callback_data: "back_to_admin_main",
            },
          ]);

          await bot.sendMessage(msg.chat.id, messageText, {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: inlineKeyboard,
            },
          });
          userState.setState(telegramId, "admin_main");
          return;
        }
      } catch (fuseError) {
        console.error("Fuse.js xatosi:", fuseError);
        // Fuse.js ishlamasa, oddiy qidiruv bilan davom etamiz
      }
    }

    if (searchResults.length === 0) {
      await bot.sendMessage(
        msg.chat.id,
        `🔍 <b>Qidiruv natijasi</b>\n\n"<b>${searchQuery}</b>" so'zi bilan hech qanday mahsulot topilmadi.\n\n` +
          "💡 <b>Maslahat:</b> Boshqa so'z bilan qidiring yoki kategoriyalar orqali ko'ring.",
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔍 Qayta qidirish",
                  callback_data: "search_product_for_discount",
                },
              ],
              [
                {
                  text: _getTranslation("back_to_admin_main"),
                  callback_data: "back_to_admin_main",
                },
              ],
            ],
          },
        }
      );
      userState.setState(telegramId, "admin_main");
      return;
    }

    let messageText = `🔍 <b>Qidiruv natijasi: "${searchQuery}"</b>\n\n`;
    const inlineKeyboard = [];

    searchResults.forEach((product, index) => {
      messageText += `${index + 1}. <b>${product.name}</b>\n`;
      messageText += `💰 ${product.price} so'm\n`;
      if (product.isDiscount && product.discountPrice) {
        messageText += `🔥 Skidka: ${product.discountPrice} so'm\n`;
      }
      if (product.description) {
        messageText += `📝 ${product.description.substring(0, 50)}...\n`;
      }
      messageText += `\n`;

      inlineKeyboard.push([
        {
          text: `${product.name}${product.isDiscount ? " 🔥" : ""}`,
          callback_data: `add_discount_to_product_${product._id}`,
        },
      ]);
    });

    inlineKeyboard.push([
      {
        text: "🔍 Qayta qidirish",
        callback_data: "search_product_for_discount",
      },
    ]);

    inlineKeyboard.push([
      {
        text: _getTranslation("back_to_admin_main"),
        callback_data: "back_to_admin_main",
      },
    ]);

    await bot.sendMessage(msg.chat.id, messageText, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: inlineKeyboard,
      },
    });
    userState.setState(telegramId, "admin_main");
  } catch (error) {
    console.error("Mahsulot qidirishda xato:", error);
    await bot.sendMessage(
      msg.chat.id,
      `❌ <b>Qidiruvda xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: _getTranslation("back_to_admin_main"),
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
  }
};

// Skidka narxini qabul qilish funksiyasi
const handleAdminEnterDiscountPrice = async (
  bot,
  msg,
  telegramId,
  discountPriceText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);
  const userState = botStateInstance;

  const product = userState.getData(telegramId, "product_for_discount");
  if (!product) {
    await bot.sendMessage(msg.chat.id, "❌ Mahsulot ma'lumotlari topilmadi!");
    userState.setState(telegramId, "admin_main");
    return;
  }

  const discountPrice = parseFloat(discountPriceText.trim());
  if (
    isNaN(discountPrice) ||
    discountPrice <= 0 ||
    discountPrice >= product.price
  ) {
    await bot.sendMessage(
      msg.chat.id,
      "❌ Noto'g'ri skidka narxi! Asosiy narxdan kichik bo'lishi kerak."
    );
    return;
  }

  try {
    // Mahsulotga skidka qo'shish
    console.log(
      "Adding discount to product:",
      product._id,
      "Discount price:",
      discountPrice
    );

    const updatedProduct = await productService.updateProduct(product._id, {
      discountPrice: discountPrice,
      isDiscount: true,
    });

    console.log("Updated product:", {
      name: updatedProduct.name,
      isDiscount: updatedProduct.isDiscount,
      discountPrice: updatedProduct.discountPrice,
      price: updatedProduct.price,
    });

    await bot.sendMessage(
      msg.chat.id,
      `✅ <b>Skidka muvaffaqiyatli qo'shildi!</b>\n\n` +
        `📦 <b>Mahsulot:</b> ${product.name}\n` +
        `💰 <b>Eski narx:</b> ${product.price} so'm\n` +
        `🔥 <b>Skidka narx:</b> ${discountPrice} so'm\n` +
        `💸 <b>Chegirma:</b> ${product.price - discountPrice} so'm`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔥 Skidka post yuborish",
                callback_data: `create_discount_post_${product._id}`,
              },
            ],
            [
              {
                text: _getTranslation("back_to_admin_main"),
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );
    userState.deleteData(telegramId, "product_for_discount");
    userState.setState(telegramId, "admin_main");
  } catch (error) {
    console.error("Skidka qo'shishda xato:", error);
    await bot.sendMessage(
      msg.chat.id,
      `❌ <b>Skidka qo'shishda xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: _getTranslation("back_to_admin_main"),
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );
    userState.setState(telegramId, "admin_main");
  }
};

// Admin: Mahsulotni rad etish sababini qabul qilish
const handleAdminRejectReason = async (
  bot,
  msg,
  telegramId,
  reason,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  if (!isAdmin(telegramId)) {
    await bot.sendMessage(msg.chat.id, "Bu funksiya faqat admin uchun mavjud!");
    return;
  }

  const productId = botStateInstance.getData(
    telegramId,
    "rejecting_product_id"
  );
  if (!productId) {
    await bot.sendMessage(msg.chat.id, "❌ Mahsulot ma'lumotlari topilmadi!");
    botStateInstance.setState(telegramId, "admin_main");
    return;
  }

  try {
    await productService.rejectProduct(productId, telegramId, reason);

    await bot.sendMessage(
      msg.chat.id,
      `❌ <b>Mahsulot rad etildi!</b>\n\n` +
        `📝 <b>Sabab:</b> ${reason}\n\n` +
        `Mahsulot sotuvga chiqarilmaydi.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Ko'rib chiqish ro'yxatiga qaytish",
                callback_data: "review_pending_products",
              },
            ],
          ],
        },
      }
    );

    botStateInstance.deleteData(telegramId, "rejecting_product_id");
    botStateInstance.setState(telegramId, "admin_main");
  } catch (error) {
    console.error("Mahsulotni rad etishda xato:", error);
    await bot.sendMessage(
      msg.chat.id,
      `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Orqaga",
                callback_data: "review_pending_products",
              },
            ],
          ],
        },
      }
    );
    botStateInstance.setState(telegramId, "admin_main");
  }
};

const handleAdminAddNewAdmin = async (
  bot,
  msg,
  telegramId,
  adminIdText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const adminId = adminIdText.trim();

    // ID to'g'ri formatda ekanligini tekshirish
    if (!/^\d+$/.test(adminId)) {
      await bot.sendMessage(
        telegramId,
        "❌ Noto'g'ri ID format! Faqat raqamlar bo'lishi kerak.\n\n📝 <b>Masalan:</b> 123456789",
        { parse_mode: "HTML" }
      );
      return;
    }

    // Admin allaqachon mavjudligini tekshirish
    const existingAdmin = await adminService.getAdminByTelegramId(adminId);
    if (existingAdmin) {
      await bot.sendMessage(telegramId, "❌ Bu admin allaqachon mavjud!", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Adminlar boshqaruviga qaytish",
                callback_data: "manage_admins",
              },
            ],
          ],
        },
      });
      return;
    }

    // Telegram API orqali foydalanuvchi ma'lumotlarini olish
    try {
      const chatMember = await bot.getChat(adminId);

      const adminData = {
        telegramId: adminId,
        username: chatMember.username || "",
        firstName: chatMember.first_name || "",
        lastName: chatMember.last_name || "",
        role: "admin",
        permissions: {
          manageAdmins: false,
          manageDelivery: true,
          manageProducts: true,
          manageOrders: true,
          viewStatistics: true,
        },
        addedBy: telegramId,
      };

      await adminService.createAdmin(adminData);

      await bot.sendMessage(
        telegramId,
        `✅ <b>Yangi admin muvaffaqiyatli qo'shildi!</b>\n\n` +
          `👤 <b>Ism:</b> ${chatMember.first_name} ${
            chatMember.last_name || ""
          }\n` +
          `🆔 <b>ID:</b> ${adminId}\n` +
          `📝 <b>Username:</b> @${chatMember.username || "yo'q"}\n` +
          `🔑 <b>Rol:</b> Admin\n\n` +
          `🎉 Endi u admin huquqlariga ega!`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "➕ Yana admin qo'shish",
                  callback_data: "add_new_admin",
                },
              ],
              [
                {
                  text: "🔙 Adminlar boshqaruviga qaytish",
                  callback_data: "manage_admins",
                },
              ],
            ],
          },
        }
      );

      // Yangi admin'ga xabar yuborish
      try {
        await bot.sendMessage(
          adminId,
          `🎉 <b>Tabriklaymiz!</b>\n\nSiz admin huquqlariga ega bo'ldingiz!\n\n` +
            `🔑 <b>Huquqlaringiz:</b>\n` +
            `• Mahsulotlarni boshqarish\n` +
            `• Buyurtmalarni boshqarish\n` +
            `• Dastavchilarni boshqarish\n` +
            `• Statistikalarni ko'rish\n\n` +
            `🚀 Botni ishlatishni boshlashingiz mumkin!`,
          { parse_mode: "HTML" }
        );
      } catch (error) {
        console.log("Yangi admin'ga xabar yuborishda xato:", error.message);
      }
    } catch (error) {
      await bot.sendMessage(
        telegramId,
        "❌ <b>Xato yuz berdi!</b>\n\n" +
          "Bu ID bilan foydalanuvchi topilmadi yoki bot bilan bog'lanmagan.\n\n" +
          "💡 <b>Yechim:</b>\n" +
          "1. Foydalanuvchi botni ishga tushirgan bo'lishi kerak\n" +
          "2. ID to'g'ri ekanligini tekshiring\n" +
          "3. @userinfobot dan ID ni qayta oling",
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Adminlar boshqaruviga qaytish",
                  callback_data: "manage_admins",
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.error("Yangi admin qo'shishda xato:", error);
    await bot.sendMessage(
      telegramId,
      `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Adminlar boshqaruviga qaytish",
                callback_data: "manage_admins",
              },
            ],
          ],
        },
      }
    );
  }

  botStateInstance.setState(telegramId, "admin_main");
};

const handleAdminAddNewDeliveryPerson = async (
  bot,
  msg,
  telegramId,
  deliveryIdText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  try {
    const deliveryId = deliveryIdText.trim();

    // ID to'g'ri formatda ekanligini tekshirish
    if (!/^\d+$/.test(deliveryId)) {
      await bot.sendMessage(
        telegramId,
        "❌ Noto'g'ri ID format! Faqat raqamlar bo'lishi kerak.\n\n📝 <b>Masalan:</b> 123456789",
        { parse_mode: "HTML" }
      );
      return;
    }

    // Dastavchi allaqachon mavjudligini tekshirish
    const existingDelivery =
      await deliveryPersonService.getDeliveryPersonByTelegramId(deliveryId);
    if (existingDelivery) {
      await bot.sendMessage(telegramId, "❌ Bu dastavchi allaqachon mavjud!", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Dastavchilar boshqaruviga qaytish",
                callback_data: "manage_delivery_persons",
              },
            ],
          ],
        },
      });
      return;
    }

    // Telegram API orqali foydalanuvchi ma'lumotlarini olish
    try {
      const chatMember = await bot.getChat(deliveryId);

      const deliveryData = {
        telegramId: deliveryId,
        username: chatMember.username || "",
        firstName: chatMember.first_name || "",
        lastName: chatMember.last_name || "",
        addedBy: telegramId,
      };

      await deliveryPersonService.createDeliveryPerson(deliveryData, bot);

      await bot.sendMessage(
        telegramId,
        `✅ <b>Yangi dastavchi muvaffaqiyatli qo'shildi!</b>\n\n` +
          `👤 <b>Ism:</b> ${chatMember.first_name} ${
            chatMember.last_name || ""
          }\n` +
          `🆔 <b>ID:</b> ${deliveryId}\n` +
          `📝 <b>Username:</b> @${chatMember.username || "yo'q"}\n` +
          `🚚 <b>Rol:</b> Dastavchi\n\n` +
          `🎉 Endi u dastavchi huquqlariga ega!`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "➕ Yana dastavchi qo'shish",
                  callback_data: "add_new_delivery_person",
                },
              ],
              [
                {
                  text: "🔙 Dastavchilar boshqaruviga qaytish",
                  callback_data: "manage_delivery_persons",
                },
              ],
            ],
          },
        }
      );

      // Yangi dastavchiga xabar yuborish
      try {
        await bot.sendMessage(
          deliveryId,
          `🎉 <b>Tabriklaymiz!</b>\n\nSiz dastavchi huquqlariga ega bo'ldingiz!\n\n` +
            `🚚 <b>Vazifalaringiz:</b>\n` +
            `• Buyurtmalarni qabul qilish\n` +
            `• Dastavka qilish\n` +
            `• Mijozlar bilan bog'lanish\n` +
            `• Buyurtma holatini yangilash\n\n` +
            `🚀 Dastavka ishlarini boshlashingiz mumkin!`,
          { parse_mode: "HTML" }
        );
      } catch (error) {
        console.log("Yangi dastavchiga xabar yuborishda xato:", error.message);
      }
    } catch (error) {
      // Agar getChat xato bersa, minimal ma'lumot bilan ham deliveryPerson qo'shamiz
      const deliveryData = {
        telegramId: deliveryId,
        username: "",
        firstName: "Noma'lum",
        lastName: "",
        addedBy: telegramId,
      };
      await deliveryPersonService.createDeliveryPerson(deliveryData, bot);
      await bot.sendMessage(
        telegramId,
        `⚠️ <b>Telegramdan to'liq ma'lumot olinmadi, lekin dastavchi qo'shildi.</b>\n\n🆔 <b>ID:</b> ${deliveryId}\n🚚 <b>Rol:</b> Dastavchi`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "➕ Yana dastavchi qo'shish",
                  callback_data: "add_new_delivery_person",
                },
              ],
              [
                {
                  text: "🔙 Dastavchilar boshqaruviga qaytish",
                  callback_data: "manage_delivery_persons",
                },
              ],
            ],
          },
        }
      );
    }
  } catch (error) {
    console.error("Yangi dastavchi qo'shishda xato:", error);
    await bot.sendMessage(
      telegramId,
      `❌ <b>Xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Dastavchilar boshqaruviga qaytish",
                callback_data: "manage_delivery_persons",
              },
            ],
          ],
        },
      }
    );
  }

  botStateInstance.setState(telegramId, "admin_main");
};

// --- YANGI: Buyurtmani admin tasdiqlaganda dastavchikka xabar yuborish ---
async function handleAdminApproveOrder(
  bot,
  orderId,
  deliveryPersonId,
  adminId
) {
  // Buyurtma va dastavchikni tekshirish
  const order = await orderService.getOrderById(orderId);
  if (!order) throw new Error("Buyurtma topilmadi");
  if (order.status !== "yangi")
    throw new Error("Buyurtma allaqachon tasdiqlangan yoki bekor qilingan");
  const deliveryPerson = await deliveryPersonService.getDeliveryPersonById(
    deliveryPersonId
  );
  if (!deliveryPerson) throw new Error("Dastavchik topilmadi");
  // Statusni yangilash va dastavchikni biriktirish
  await orderService.updateOrderStatus(orderId, "admin_tasdiqladi");
  await orderService.assignDeliveryPerson(orderId, deliveryPersonId);
  // Dastavchikka xabar yuborish
  let productList = order.products
    .map((p) => `• ${p.product.name} x${p.quantity}`)
    .join("\n");
  const msg =
    `🆕 <b>Yangi buyurtma!</b>\n\n` +
    `<b>Buyurtma raqami:</b> ${order._id}\n` +
    `<b>Mijoz:</b> ${order.user.firstName || ""} (${order.contact})\n` +
    `<b>Manzil:</b> ${order.address}\n` +
    `<b>Tovarlar:</b>\n${productList}\n\n` +
    `<b>Umumiy narx:</b> ${order.totalPrice} so'm`;
  await bot.sendMessage(deliveryPerson.telegramId, msg, { parse_mode: "HTML" });
  // Admin va mijozga ham xabar yuborish (agar kerak bo'lsa)
}

// --- YANGI: Dastavchik buyurtmani "Yetkazdim" qilganda ---
async function handleDeliveryMarkAsDelivered(bot, orderId, deliveryPersonId) {
  const order = await orderService.getOrderById(orderId);
  if (!order) throw new Error("Buyurtma topilmadi");
  if (order.status !== "dastavchikka_berildi")
    throw new Error("Buyurtma hali dastavchikka berilmagan");
  if (String(order.deliveryPersonId) !== String(deliveryPersonId))
    throw new Error("Sizga biriktirilmagan buyurtma");
  await orderService.markOrderAsDelivered(orderId, deliveryPersonId);
  // Adminga xabar
  const adminMsg = `✅ <b>Buyurtma yetkazildi!</b>\n\n<b>Buyurtma raqami:</b> ${order._id}\n<b>Dastavchik:</b> ${order.deliveryPersonId}`;
  // TODO: admin telegramId larini aniqlash va xabar yuborish
  // await bot.sendMessage(adminTelegramId, adminMsg, { parse_mode: "HTML" });
  // Dastavchikka xabar
  await bot.sendMessage(
    order.deliveryPersonId,
    "Buyurtma muvaffaqiyatli yetkazildi va admin xabardor qilindi."
  );
}

// --- YANGI: Admin post tashlash funksiyasi ---
const handleAdminPostTashlash = async (
  bot,
  msg,
  telegramId,
  postText,
  userLanguage
) => {
  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  if (!postText || postText.trim() === "") {
    await bot.sendMessage(
      msg.chat.id,
      "❌ Post matni bo'sh bo'lishi mumkin emas!"
    );
    return;
  }

  try {
    // Kanal ID ni config dan olish
    const channelId = config.channelId || "@denaroma_oqbilol";

    // Postni kanalga yuborish
    await bot.sendMessage(channelId, postText, {
      parse_mode: "HTML",
    });

    // Admin ga muvaffaqiyat xabari
    await bot.sendMessage(
      msg.chat.id,
      `✅ <b>Post muvaffaqiyatli tashlandi!</b>\n\n` +
        `📝 <b>Post matni:</b>\n${postText.substring(0, 100)}${
          postText.length > 100 ? "..." : ""
        }\n\n` +
        `📢 <b>Kanal:</b> ${channelId}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Admin paneliga qaytish",
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );

    // Foydalanuvchi holatini tozalash
    global.userStates = global.userStates || {};
    if (global.userStates[telegramId]) {
      delete global.userStates[telegramId];
    }
  } catch (error) {
    console.error("Post tashlashda xato: ", error);
    await bot.sendMessage(
      msg.chat.id,
      `❌ <b>Post tashlashda xato yuz berdi!</b>\n\n${error.message}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Admin paneliga qaytish",
                callback_data: "back_to_admin_main",
              },
            ],
          ],
        },
      }
    );
  }
};

export { defineDeliveryPersonPanel };
export default handleMessage;
