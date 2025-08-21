// src/handlers/deliveryCallbackHandler.js

import deliveryPersonService from "../services/deliveryPersonService.js";
import orderService from "../services/orderService.js";
import monitoring from "../utils/monitoring.js";
import logger from "../utils/logger.js";
import {
  deliveryMainMenuKeyboard,
  deliveryOrderActionKeyboard,
  deliveryOrderDetailsKeyboard,
} from "../keyboards/deliveryMenu.js";

/**
 * Dastavchik callback query handler
 * @param {object} bot - Telegram bot instansi
 * @param {object} callbackQuery - Callback query obyekti
 */
export const handleDeliveryCallbackQuery = async (bot, callbackQuery) => {
  const { data, message } = callbackQuery;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Dastavchik ekanligini tekshirish
    const isDeliveryPerson = await deliveryPersonService.isDeliveryPerson(
      telegramId
    );
    if (!isDeliveryPerson) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "Siz dastavchik emassiz!",
        show_alert: true,
      });
      return;
    }

    // Callback data bo'yicha amallarni bajarish
    if (data === "delivery_new_orders") {
      await handleNewOrders(bot, callbackQuery);
    } else if (data === "delivery_my_orders") {
      await handleMyOrders(bot, callbackQuery);
    } else if (data === "delivery_delivered_orders") {
      await handleDeliveredOrders(bot, callbackQuery);
    } else if (data === "delivery_stats") {
      await handleDeliveryStats(bot, callbackQuery);
    } else if (data === "delivery_profile") {
      await handleDeliveryProfile(bot, callbackQuery);
    } else if (data === "delivery_phone") {
      await handleDeliveryPhone(bot, callbackQuery);
    } else if (data === "delivery_online") {
      await handleGoOnline(bot, callbackQuery);
    } else if (data === "delivery_offline") {
      await handleGoOffline(bot, callbackQuery);
    } else if (data === "delivery_daily_income") {
      await handleDailyIncome(bot, callbackQuery);
    } else if (data === "delivery_weekly_stats") {
      await handleWeeklyStats(bot, callbackQuery);
    } else if (data === "delivery_map") {
      await handleDeliveryMap(bot, callbackQuery);
    } else if (data === "delivery_work_time") {
      await handleWorkTime(bot, callbackQuery);
    } else if (data === "delivery_help") {
      await handleDeliveryHelp(bot, callbackQuery);
    } else if (data === "delivery_info") {
      await handleDeliveryInfo(bot, callbackQuery);
    } else if (data.startsWith("delivery_mark_delivered_")) {
      await handleMarkAsDelivered(bot, callbackQuery);
    } else if (data.startsWith("delivery_report_issue_")) {
      await handleReportIssue(bot, callbackQuery);
    } else if (data.startsWith("delivery_view_order_")) {
      await handleViewOrder(bot, callbackQuery);
    } else {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "Noma'lum amal!",
        show_alert: true,
      });
    }
  } catch (error) {
    await monitoring.logError(error, "Delivery Callback Handler", bot);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Xato yuz berdi!",
      show_alert: true,
    });
  }
};

/**
 * Yangi buyurtmalarni ko'rsatish
 */
async function handleNewOrders(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const orders = await orderService.getOrdersByDeliveryPersonAndStatus(
    telegramId,
    "dastavchikka_berildi"
  );

  if (orders.length === 0) {
    await bot.editMessageText(
      "🆕 Yangi buyurtmalar yo'q!\n\nHozircha sizga biriktirilgan yangi buyurtmalar mavjud emas.",
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        reply_markup: deliveryMainMenuKeyboard(),
      }
    );
    return;
  }

  let message = "🆕 <b>Yangi buyurtmalar:</b>\n\n";

  orders.slice(0, 5).forEach((order, index) => {
    message += `${index + 1}. <b>Buyurtma #${order._id
      .toString()
      .slice(-6)}</b>\n`;
    message += `   💰 ${order.totalPrice} so'm\n`;
    message += `   📍 ${order.address.substring(0, 40)}...\n`;
    message += `   📞 ${order.contact}\n\n`;
  });

  if (orders.length > 5) {
    message += `... va yana ${orders.length - 5} ta buyurtma`;
  }

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Yetkazilgan buyurtmalarni ko'rsatish
 */
async function handleDeliveredOrders(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const todayDelivered = await orderService.getTodayDeliveredCount(telegramId);

  const message =
    `✅ <b>Yetkazilgan buyurtmalar</b>\n\n` +
    `📅 <b>Bugun yetkazilgan:</b> ${todayDelivered} ta\n\n` +
    `🎉 Tabriklaymiz! Siz bugun ${todayDelivered} ta buyurtmani muvaffaqiyatli yetkazdingiz.`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Dastavchik statistikasini ko'rsatish
 */
async function handleDeliveryStats(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const deliveryPerson =
    await deliveryPersonService.getDeliveryPersonByTelegramId(telegramId);
  const todayDelivered = await orderService.getTodayDeliveredCount(telegramId);

  const message =
    `📊 <b>Dastavchik statistikasi</b>\n\n` +
    `👤 <b>Ism:</b> ${deliveryPerson.firstName} ${deliveryPerson.lastName}\n` +
    `⭐️ <b>Reyting:</b> ${deliveryPerson.rating}/5\n` +
    `📦 <b>Jami dastavkalar:</b> ${deliveryPerson.totalDeliveries}\n` +
    `✅ <b>Bajarilgan:</b> ${deliveryPerson.completedDeliveries}\n` +
    `⏱️ <b>O'rtacha vaqt:</b> ${deliveryPerson.averageDeliveryTime} daqiqa\n\n` +
    `📅 <b>Bugun:</b> ${todayDelivered} ta yetkazildi\n` +
    `🟢 <b>Holat:</b> ${deliveryPerson.isOnline ? "Online" : "Offline"}`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Dastavchik ma'lumotlarini ko'rsatish
 */
async function handleDeliveryInfo(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const deliveryPerson =
    await deliveryPersonService.getDeliveryPersonByTelegramId(telegramId);

  const message =
    `ℹ️ <b>Dastavchik ma'lumotlari</b>\n\n` +
    `👤 <b>Ism:</b> ${deliveryPerson.firstName} ${deliveryPerson.lastName}\n` +
    `📱 <b>Telefon:</b> ${deliveryPerson.phoneNumber || "Kiritilmagan"}\n` +
    `🆔 <b>ID:</b> ${deliveryPerson.telegramId}\n` +
    `📅 <b>Qo'shilgan:</b> ${new Date(
      deliveryPerson.addedAt
    ).toLocaleDateString("uz-UZ")}\n` +
    `⏰ <b>Ish vaqti:</b> ${deliveryPerson.workingHours.start} - ${deliveryPerson.workingHours.end}\n` +
    `🚚 <b>Dastavka zonasi:</b> ${
      deliveryPerson.deliveryZones.join(", ") || "Kiritilmagan"
    }\n\n` +
    `📞 <b>Admin bilan bog'lanish:</b> @denaroma_oqbilol_admin`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Online holatga o'tish
 */
async function handleGoOnline(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();

  try {
    await deliveryPersonService.setOnlineStatus(telegramId, true);

    await bot.editMessageText(
      "🟢 <b>Online holatga o'tdingiz!</b>\n\n✅ Endi sizga yangi buyurtmalar keladi\n📱 Buyurtmalar avtomatik yuboriladi\n⏰ Faqat ish vaqtida buyurtmalar keladi",
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        parse_mode: "HTML",
        reply_markup: deliveryMainMenuKeyboard(),
      }
    );
  } catch (error) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Online holatga o'tishda xato!",
      show_alert: true,
    });
  }
}

/**
 * Offline holatga o'tish
 */
async function handleGoOffline(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();

  try {
    await deliveryPersonService.setOnlineStatus(telegramId, false);

    await bot.editMessageText(
      "🔴 <b>Offline holatga o'tdingiz!</b>\n\n❌ Endi sizga yangi buyurtmalar kelmaydi\n📱 Mavjud buyurtmalarni bajarishingiz mumkin\n🔄 Qayta online bo'lish uchun tugmani bosing",
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        parse_mode: "HTML",
        reply_markup: deliveryMainMenuKeyboard(),
      }
    );
  } catch (error) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Offline holatga o'tishda xato!",
      show_alert: true,
    });
  }
}

/**
 * Buyurtmani yetkazildi deb belgilash
 */
async function handleMarkAsDelivered(bot, callbackQuery) {
  const orderId = callbackQuery.data.split("delivery_mark_delivered_")[1];
  const telegramId = callbackQuery.from.id.toString();

  try {
    await orderService.markOrderAsDelivered(orderId, telegramId);

    await bot.editMessageText(
      "✅ <b>Buyurtma yetkazildi!</b>\n\n🎉 Tabriklaymiz! Buyurtmani muvaffaqiyatli yetkazdingiz.\n📊 Statistika avtomatik yangilanadi.",
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        parse_mode: "HTML",
        reply_markup: deliveryMainMenuKeyboard(),
      }
    );

    // Admin ga xabar yuborish
    const adminId = process.env.ADMIN_ID;
    if (adminId) {
      await bot.sendMessage(
        adminId,
        `✅ <b>Buyurtma yetkazildi!</b>\n\n<b>Buyurtma raqami:</b> ${orderId}\n<b>Dastavchik:</b> ${telegramId}`,
        { parse_mode: "HTML" }
      );
    }
  } catch (error) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Buyurtmani belgilashda xato!",
      show_alert: true,
    });
  }
}

/**
 * Muammo haqida xabar berish
 */
async function handleReportIssue(bot, callbackQuery) {
  const orderId = callbackQuery.data.split("delivery_report_issue_")[1];

  await bot.editMessageText(
    "❌ <b>Muammo haqida xabar bering</b>\n\nIltimos, muammo haqida batafsil ma'lumot bering. Masalan:\n• Mijoz javob bermayapti\n• Manzil noto'g'ri\n• Mahsulot yo'q\n• Boshqa muammo",
    {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬅️ Orqaga", callback_data: "delivery_new_orders" }],
        ],
      },
    }
  );
}

/**
 * Buyurtma tafsilotlarini ko'rsatish
 */
async function handleViewOrder(bot, callbackQuery) {
  const orderId = callbackQuery.data.split("delivery_view_order_")[1];

  try {
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: "Buyurtma topilmadi!",
        show_alert: true,
      });
      return;
    }

    const message =
      `📦 <b>Buyurtma tafsilotlari</b>\n\n` +
      `🆔 <b>Buyurtma raqami:</b> ${
        order.orderNumber || order._id.toString().slice(-6)
      }\n` +
      `💰 <b>Narxi:</b> ${order.totalPrice} so'm\n` +
      `📍 <b>Manzil:</b> ${order.address}\n` +
      `📞 <b>Telefon:</b> ${order.contact}\n` +
      `📅 <b>Sana:</b> ${new Date(order.createdAt).toLocaleDateString(
        "uz-UZ"
      )}\n\n` +
      `📋 <b>Mahsulotlar:</b>\n` +
      order.products
        .map(
          (item) =>
            `• ${item.product.name} x${item.quantity} = ${
              item.price * item.quantity
            } so'm`
        )
        .join("\n");

    await bot.editMessageText(message, {
      chat_id: callbackQuery.message.chat.id,
      message_id: callbackQuery.message.message_id,
      parse_mode: "HTML",
      reply_markup: deliveryOrderDetailsKeyboard(orderId),
    });
  } catch (error) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Buyurtma ma'lumotlarini olishda xato!",
      show_alert: true,
    });
  }
}

/**
 * Dastavchik buyurtmalarini ko'rsatish
 */
async function handleMyOrders(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const orders = await orderService.getOrdersByDeliveryPersonAndStatus(
    telegramId,
    "dastavchikka_berildi"
  );

  if (orders.length === 0) {
    await bot.editMessageText(
      "🚚 <b>Mening buyurtmalarim:</b>\n\nHozircha sizga biriktirilgan buyurtmalar mavjud emas.",
      {
        chat_id: callbackQuery.message.chat.id,
        message_id: callbackQuery.message.message_id,
        parse_mode: "HTML",
        reply_markup: deliveryMainMenuKeyboard(),
      }
    );
    return;
  }

  let message = "🚚 <b>Mening buyurtmalarim:</b>\n\n";

  orders.slice(0, 5).forEach((order, index) => {
    message += `${index + 1}. <b>Buyurtma #${
      order.orderNumber || order._id.toString().slice(-6)
    }</b>\n`;
    message += `   💰 ${order.totalPrice} so'm\n`;
    message += `   📍 ${order.address.substring(0, 40)}...\n`;
    message += `   📞 ${order.contact}\n\n`;
  });

  if (orders.length > 5) {
    message += `... va yana ${orders.length - 5} ta buyurtma`;
  }

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Dastavchik shaxsiy ma'lumotlarini ko'rsatish
 */
async function handleDeliveryProfile(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const deliveryPerson =
    await deliveryPersonService.getDeliveryPersonByTelegramId(telegramId);

  if (!deliveryPerson) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Dastavchik ma'lumotlari topilmadi!",
      show_alert: true,
    });
    return;
  }

  let message = "👤 <b>Shaxsiy ma'lumotlar:</b>\n\n";
  message += `📱 <b>Telegram ID:</b> ${deliveryPerson.telegramId}\n`;
  message += `📞 <b>Telefon:</b> ${deliveryPerson.phone || "Kiritilmagan"}\n`;
  message += `📧 <b>Email:</b> ${deliveryPerson.email || "Kiritilmagan"}\n`;
  message += `📍 <b>Manzil:</b> ${deliveryPerson.address || "Kiritilmagan"}\n`;
  message += `🚗 <b>Transport:</b> ${
    deliveryPerson.transport || "Kiritilmagan"
  }\n`;
  message += `📅 <b>Qo'shilgan sana:</b> ${deliveryPerson.createdAt.toLocaleDateString()}\n`;
  message += `🔄 <b>Holat:</b> ${
    deliveryPerson.isActive ? "🟢 Faol" : "🔴 Faol emas"
  }\n`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Dastavchik telefon raqamini ko'rsatish
 */
async function handleDeliveryPhone(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();
  const deliveryPerson =
    await deliveryPersonService.getDeliveryPersonByTelegramId(telegramId);

  if (!deliveryPerson) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: "Dastavchik ma'lumotlari topilmadi!",
      show_alert: true,
    });
    return;
  }

  let message = "📱 <b>Telefon raqam:</b>\n\n";
  message += `📞 <b>Asosiy telefon:</b> ${
    deliveryPerson.phone || "Kiritilmagan"
  }\n`;
  message += `📱 <b>Telegram ID:</b> ${deliveryPerson.telegramId}\n\n`;
  message += `💡 <b>Mijozlar bilan bog'lanish uchun:</b>\n`;
  message += `• Telegram orqali: @${deliveryPerson.telegramId}\n`;
  message += `• Telefon orqali: ${deliveryPerson.phone || "Mavjud emas"}\n`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Kunlik daromadni ko'rsatish
 */
async function handleDailyIncome(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();

  // Simulyatsiya qilingan kunlik daromad
  const dailyIncome = Math.floor(Math.random() * 50000) + 10000; // 10,000 - 60,000 so'm

  let message = "💰 <b>Kunlik daromad:</b>\n\n";
  message += `📅 <b>Bugun:</b> ${new Date().toLocaleDateString()}\n`;
  message += `💵 <b>Daromad:</b> ${dailyIncome.toLocaleString()} so'm\n`;
  message += `🚚 <b>Yetkazilgan buyurtmalar:</b> ${
    Math.floor(Math.random() * 10) + 1
  } ta\n`;
  message += `⏰ <b>Ish vaqti:</b> ${
    Math.floor(Math.random() * 8) + 4
  } soat\n\n`;
  message += `💡 <b>Maslahat:</b>\n`;
  message += `• Ko'proq buyurtmalar qabul qiling\n`;
  message += `• Tez yetkazib bering\n`;
  message += `• Mijozlar bilan yaxshi munosabatda bo'ling`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Haftalik statistikani ko'rsatish
 */
async function handleWeeklyStats(bot, callbackQuery) {
  const telegramId = callbackQuery.from.id.toString();

  // Simulyatsiya qilingan haftalik statistika
  const weeklyStats = {
    orders: Math.floor(Math.random() * 50) + 20,
    income: Math.floor(Math.random() * 300000) + 100000,
    hours: Math.floor(Math.random() * 40) + 20,
    rating: (Math.random() * 2 + 3).toFixed(1),
  };

  let message = "📈 <b>Haftalik statistika:</b>\n\n";
  message += `📅 <b>Hafta:</b> ${new Date().toLocaleDateString()}\n`;
  message += `📦 <b>Buyurtmalar:</b> ${weeklyStats.orders} ta\n`;
  message += `💵 <b>Daromad:</b> ${weeklyStats.income.toLocaleString()} so'm\n`;
  message += `⏰ <b>Ish vaqti:</b> ${weeklyStats.hours} soat\n`;
  message += `⭐ <b>Reyting:</b> ${weeklyStats.rating}/5.0\n\n`;
  message += `💡 <b>Natija:</b>\n`;
  message += `• O'rtacha kunlik: ${Math.round(
    weeklyStats.orders / 7
  )} buyurtma\n`;
  message += `• O'rtacha soatlik: ${Math.round(
    weeklyStats.income / weeklyStats.hours
  )} so'm`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Xarita funksiyasini ko'rsatish
 */
async function handleDeliveryMap(bot, callbackQuery) {
  let message = "🗺️ <b>Xarita funksiyasi:</b>\n\n";
  message += `📍 <b>Google Maps:</b> https://maps.google.com\n`;
  message += `🗺️ <b>Yandex Maps:</b> https://maps.yandex.com\n`;
  message += `🍎 <b>Apple Maps:</b> iOS da mavjud\n\n`;
  message += `💡 <b>Xarita orqali:</b>\n`;
  message += `• Mijoz manzilini topish\n`;
  message += `• Eng qisqa yo'lni tanlash\n`;
  message += `• Trafik holatini kuzatish\n`;
  message += `• Parkovka joylarini topish`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Ish vaqtini ko'rsatish
 */
async function handleWorkTime(bot, callbackQuery) {
  let message = "⏰ <b>Ish vaqti:</b>\n\n";
  message += `🕐 <b>Dushanba - Shanba:</b> 09:00 - 22:00\n`;
  message += `🕐 <b>Yakshanba:</b> 10:00 - 20:00\n\n`;
  message += `💡 <b>Ish tartibi:</b>\n`;
  message += `• 09:00 - 12:00: Tushlik oldidan\n`;
  message += `• 12:00 - 15:00: Tushlik vaqti\n`;
  message += `• 15:00 - 19:00: Eng faol vaqt\n`;
  message += `• 19:00 - 22:00: Kechki vaqt\n\n`;
  message += `📱 <b>Online/Offline:</b>\n`;
  message += `• Online: Buyurtmalar qabul qilish\n`;
  message += `• Offline: Dam olish vaqtida`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}

/**
 * Dastavchik yordamini ko'rsatish
 */
async function handleDeliveryHelp(bot, callbackQuery) {
  let message = "ℹ️ <b>Dastavchik yordami:</b>\n\n";
  message += `📱 <b>Asosiy funksiyalar:</b>\n`;
  message += `• Yangi buyurtmalarni qabul qilish\n`;
  message += `• Buyurtmalarni yetkazib berish\n`;
  message += `• Statistika va daromadni kuzatish\n`;
  message += `• Online/Offline holatni boshqarish\n\n`;
  message += `🔧 <b>Muammolar bo'lsa:</b>\n`;
  message += `• Admin bilan bog'laning: @denaroma_oqbilol_admin\n`;
  message += `• Telefon: +998 77 737 00 95\n`;
  message += `• Email: support@denaroma.uz\n\n`;
  message += `💡 <b>Maslahatlar:</b>\n`;
  message += `• Buyurtmalarni tez yetkazib bering\n`;
  message += `• Mijozlar bilan yaxshi munosabatda bo'ling\n`;
  message += `• Xavfsizlik qoidalariga amal qiling`;

  await bot.editMessageText(message, {
    chat_id: callbackQuery.message.chat.id,
    message_id: callbackQuery.message.message_id,
    parse_mode: "HTML",
    reply_markup: deliveryMainMenuKeyboard(),
  });
}
