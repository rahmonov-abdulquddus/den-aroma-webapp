// src/handlers/deliveryCommands.js

import deliveryPersonService from "../services/deliveryPersonService.js";
import orderService from "../services/orderService.js";
import monitoring from "../utils/monitoring.js";
import logger from "../utils/logger.js";
import config from "../config/index.js";

/**
 * Dastavchik buyruqlarini boshqarish
 * @param {object} bot - Telegram bot instansi
 * @param {object} msg - Xabar obyekti
 */
export const handleDeliveryCommands = async (bot, msg) => {
  const { text, chat } = msg;
  const telegramId = chat.id.toString();

  // Faqat dastavchik buyruqlarni bajarishi mumkin
  const isDeliveryPerson = await deliveryPersonService.isDeliveryPerson(
    telegramId
  );
  if (!isDeliveryPerson) {
    return;
  }

  const command = text.toLowerCase();

  try {
    switch (command) {
      case "/start":
        await handleDeliveryStart(bot, chat.id);
        break;

      case "/online":
        await handleDeliveryOnline(bot, chat.id);
        break;

      case "/offline":
        await handleDeliveryOffline(bot, chat.id);
        break;

      case "/orders":
        await handleDeliveryOrders(bot, chat.id);
        break;

      case "/stats":
        await handleDeliveryStats(bot, chat.id);
        break;

      case "/help":
        await handleDeliveryHelp(bot, chat.id);
        break;

      default:
        if (command.startsWith("/")) {
          await bot.sendMessage(chat.id, "❌ Noma'lum buyruq. /help yozing.");
        }
    }
  } catch (error) {
    await monitoring.logError(error, "Delivery Commands", bot);
    await bot.sendMessage(chat.id, "❌ Buyruq bajarilishida xato yuz berdi.");
  }
};

/**
 * Dastavchik start buyrug'i
 */
async function handleDeliveryStart(bot, chatId) {
  const deliveryPerson =
    await deliveryPersonService.getDeliveryPersonByTelegramId(
      chatId.toString()
    );

  const message =
    `🚚 <b>Dastavchik paneliga xush kelibsiz!</b>\n\n` +
    `👤 <b>Ism:</b> ${deliveryPerson.firstName} ${deliveryPerson.lastName}\n` +
    `📱 <b>Telefon:</b> ${deliveryPerson.phoneNumber || "Kiritilmagan"}\n` +
    `⭐️ <b>Reyting:</b> ${deliveryPerson.rating}/5\n` +
    `📦 <b>Jami dastavkalar:</b> ${deliveryPerson.totalDeliveries}\n` +
    `✅ <b>Bajarilgan:</b> ${deliveryPerson.completedDeliveries}\n` +
    `⏱️ <b>O'rtacha vaqt:</b> ${deliveryPerson.averageDeliveryTime} daqiqa\n\n` +
    `🟢 <b>Holat:</b> ${deliveryPerson.isOnline ? "Online" : "Offline"}\n\n` +
    `📋 <b>Buyruqlar:</b>\n` +
    `/online - Online holatga o'tish\n` +
    `/offline - Offline holatga o'tish\n` +
    `/orders - Buyurtmalarni ko'rish\n` +
    `/stats - Statistika\n` +
    `/help - Yordam`;

  await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}

/**
 * Online holatga o'tish
 */
async function handleDeliveryOnline(bot, chatId) {
  try {
    await deliveryPersonService.setOnlineStatus(chatId.toString(), true);

    const message =
      `🟢 <b>Online holatga o'tdingiz!</b>\n\n` +
      `✅ Endi sizga yangi buyurtmalar keladi\n` +
      `📱 Buyurtmalar avtomatik yuboriladi\n` +
      `⏰ Faqat ish vaqtida buyurtmalar keladi`;

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(chatId, "❌ Online holatga o'tishda xato yuz berdi.");
  }
}

/**
 * Offline holatga o'tish
 */
async function handleDeliveryOffline(bot, chatId) {
  try {
    await deliveryPersonService.setOnlineStatus(chatId.toString(), false);

    const message =
      `🔴 <b>Offline holatga o'tdingiz!</b>\n\n` +
      `❌ Endi sizga yangi buyurtmalar kelmaydi\n` +
      `📱 Mavjud buyurtmalarni bajarishingiz mumkin\n` +
      `🔄 Qayta online bo'lish uchun /online yozing`;

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(
      chatId,
      "❌ Offline holatga o'tishda xato yuz berdi."
    );
  }
}

/**
 * Buyurtmalarni ko'rish
 */
async function handleDeliveryOrders(bot, chatId) {
  try {
    const telegramId = chatId.toString();

    // Yangi buyurtmalar
    const newOrders = await orderService.getOrdersByDeliveryPersonAndStatus(
      telegramId,
      "dastavchikka_berildi"
    );

    // Bugungi yetkazilgan buyurtmalar
    const todayDelivered = await orderService.getTodayDeliveredCount(
      telegramId
    );

    const message =
      `📦 <b>Buyurtmalar</b>\n\n` +
      `🆕 <b>Yangi buyurtmalar:</b> ${newOrders.length} ta\n` +
      `✅ <b>Bugun yetkazilgan:</b> ${todayDelivered} ta\n\n` +
      `📋 <b>Yangi buyurtmalar ro'yxati:</b>\n` +
      (newOrders.length > 0
        ? newOrders
            .slice(0, 5)
            .map(
              (order, index) =>
                `${index + 1}. Buyurtma #${order._id.toString().slice(-6)}\n` +
                `   💰 ${order.totalPrice} so'm\n` +
                `   📍 ${order.address.substring(0, 30)}...`
            )
            .join("\n\n")
        : "Yangi buyurtmalar yo'q");

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(chatId, "❌ Buyurtmalarni olishda xato yuz berdi.");
  }
}

/**
 * Statistika
 */
async function handleDeliveryStats(bot, chatId) {
  try {
    const telegramId = chatId.toString();
    const deliveryPerson =
      await deliveryPersonService.getDeliveryPersonByTelegramId(telegramId);

    // Bugungi statistika
    const todayDelivered = await orderService.getTodayDeliveredCount(
      telegramId
    );
    const todayOrders = await orderService.getOrdersByDeliveryPersonAndStatus(
      telegramId,
      "dastavchikka_berildi"
    );

    const message =
      `📊 <b>Dastavchik statistikasi</b>\n\n` +
      `👤 <b>Ism:</b> ${deliveryPerson.firstName} ${deliveryPerson.lastName}\n` +
      `⭐️ <b>Reyting:</b> ${deliveryPerson.rating}/5\n` +
      `📦 <b>Jami dastavkalar:</b> ${deliveryPerson.totalDeliveries}\n` +
      `✅ <b>Bajarilgan:</b> ${deliveryPerson.completedDeliveries}\n` +
      `⏱️ <b>O'rtacha vaqt:</b> ${deliveryPerson.averageDeliveryTime} daqiqa\n\n` +
      `📅 <b>Bugungi statistika:</b>\n` +
      `   🆕 <b>Yangi buyurtmalar:</b> ${todayOrders.length} ta\n` +
      `   ✅ <b>Yetkazilgan:</b> ${todayDelivered} ta\n\n` +
      `🟢 <b>Holat:</b> ${deliveryPerson.isOnline ? "Online" : "Offline"}`;

    await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
  } catch (error) {
    await bot.sendMessage(chatId, "❌ Statistika olishda xato yuz berdi.");
  }
}

/**
 * Yordam
 */
async function handleDeliveryHelp(bot, chatId) {
  const message =
    `🚚 <b>Dastavchik buyruqlari</b>\n\n` +
    `/start - Dastavchik paneli\n` +
    `/online - Online holatga o'tish\n` +
    `/offline - Offline holatga o'tish\n` +
    `/orders - Buyurtmalarni ko'rish\n` +
    `/stats - Statistika\n` +
    `/help - Bu yordam xabari\n\n` +
    `📱 <b>Qo'shimcha ma'lumot:</b>\n` +
    `• Yangi buyurtmalar avtomatik yuboriladi\n` +
    `• Buyurtmani bajarganingizda "✅ Yetkazildi" tugmasini bosing\n` +
    `• Ish vaqti: 09:00 - 22:00\n` +
    `• Savollar uchun admin bilan bog'laning`;

  await bot.sendMessage(chatId, message, { parse_mode: "HTML" });
}
