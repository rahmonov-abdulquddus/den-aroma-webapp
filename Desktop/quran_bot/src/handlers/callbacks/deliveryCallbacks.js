// src/handlers/callbacks/deliveryCallbacks.js

import { getTranslation } from "../../utils/i18n.js";
import orderService from "../../services/orderService.js";
import deliveryPersonService from "../../services/deliveryPersonService.js";
import { isDeliveryPerson } from "../../utils/adminUtils.js";

/**
 * Dastavchi callback'larini boshqarish
 */
export const handleDeliveryCallbacks = async (
  bot,
  callbackQuery,
  safeEditMessage
) => {
  const { data, from, message } = callbackQuery;
  const chatId = message.chat.id;
  const telegramId = from.id;
  const userLanguage = "uzbek";

  const _getTranslation = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  // Dastavchi yetkazdi tugmasi
  if (data.startsWith("yetkazdim_")) {
    const orderId = data.split("yetkazdim_")[1];

    try {
      // Buyurtmani yetkazildi qilish
      await orderService.markOrderAsDelivered(orderId, telegramId);

      // Mijozga fikr so'rash xabarini yuborish
      await orderService.sendFeedbackRequestMessage(orderId, bot);

      await safeEditMessage(
        `✅ <b>Buyurtma yetkazildi!</b>\n\n` +
          `📦 <b>Buyurtma raqami:</b> #${orderId}\n` +
          `✅ Mijozga fikr so'rash xabari yuborildi\n\n` +
          `🎉 Yaxshi ishladiz!`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Dastavchi paneliga qaytish",
                  callback_data: "back_to_delivery_main",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {
      console.error("Buyurtmani yetkazildi qilishda xato:", error);
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Dastavchi paneliga qaytish",
                callback_data: "back_to_delivery_main",
              },
            ],
          ],
        },
      });
    }
    return true;
  }

  // Buyurtmani qabul qilish
  if (data.startsWith("accept_delivery_")) {
    const orderId = data.split("accept_delivery_")[1];

    try {
      await orderService.assignDeliveryPerson(orderId, telegramId);

      await safeEditMessage(
        `✅ <b>Buyurtma qabul qilindi!</b>\n\n` +
          `📦 <b>Buyurtma raqami:</b> #${orderId}\n` +
          `🚚 Siz buyurtmani yetkazish vazifasini oldingiz`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Dastavchi paneliga qaytish",
                  callback_data: "back_to_delivery_main",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Dastavchi ma'lumotlarini ko'rsatish
  if (data.startsWith("show_phone_")) {
    const deliveryPersonId = data.split("show_phone_")[1];

    try {
      const deliveryPerson = await deliveryPersonService.getDeliveryPersonById(
        deliveryPersonId
      );
      if (deliveryPerson && deliveryPerson.phone) {
        await safeEditMessage(
          `📞 <b>Dastavchi telefon raqami</b>\n\n` +
            `👤 <b>Ism:</b> ${deliveryPerson.name}\n` +
            `📱 <b>Telefon:</b> ${deliveryPerson.phone}`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga qaytish",
                    callback_data: "back_to_admin_main",
                  },
                ],
              ],
            },
          }
        );
      }
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Dastavchi manzilini ko'rsatish
  if (data.startsWith("show_location_")) {
    const deliveryPersonId = data.split("show_location_")[1];

    try {
      const deliveryPerson = await deliveryPersonService.getDeliveryPersonById(
        deliveryPersonId
      );
      if (deliveryPerson && deliveryPerson.location) {
        await safeEditMessage(
          `📍 <b>Dastavchi manzili</b>\n\n` +
            `👤 <b>Ism:</b> ${deliveryPerson.name}\n` +
            `📍 <b>Manzil:</b> ${deliveryPerson.location}`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga qaytish",
                    callback_data: "back_to_admin_main",
                  },
                ],
              ],
            },
          }
        );
      }
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Dastavchi mahsulotlarini ko'rsatish
  if (data.startsWith("show_products_")) {
    const deliveryPersonId = data.split("show_products_")[1];

    try {
      const orders = await orderService.getOrdersByDeliveryPerson(
        deliveryPersonId
      );
      if (orders && orders.length > 0) {
        let messageText = `📦 <b>Dastavchi buyurtmalari</b>\n\n`;

        for (const order of orders.slice(0, 5)) {
          // Faqat dastlabki 5 tasini ko'rsatish
          messageText +=
            `🆔 <b>Buyurtma #${order.id}</b>\n` +
            `📅 ${new Date(order.createdAt).toLocaleDateString()}\n` +
            `💰 ${order.totalAmount} so'm\n` +
            `📊 ${order.status}\n\n`;
        }

        if (orders.length > 5) {
          messageText += `... va yana ${orders.length - 5} ta buyurtma`;
        }

        await safeEditMessage(messageText, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Orqaga qaytish",
                  callback_data: "back_to_admin_main",
                },
              ],
            ],
          },
        });
      } else {
        await safeEditMessage(
          `📦 <b>Dastavchi buyurtmalari</b>\n\n` + `Hozircha buyurtmalar yo'q.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga qaytish",
                    callback_data: "back_to_admin_main",
                  },
                ],
              ],
            },
          }
        );
      }
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Dastavchi bilan bog'lanish
  if (data.startsWith("contact_delivery_")) {
    const deliveryPersonId = data.split("contact_delivery_")[1];

    try {
      const deliveryPerson = await deliveryPersonService.getDeliveryPersonById(
        deliveryPersonId
      );
      if (deliveryPerson) {
        await safeEditMessage(
          `📞 <b>Dastavchi bilan bog'lanish</b>\n\n` +
            `👤 <b>Ism:</b> ${deliveryPerson.name}\n` +
            `📱 <b>Telefon:</b> ${deliveryPerson.phone || "Kiritilmagan"}\n` +
            `📍 <b>Manzil:</b> ${
              deliveryPerson.location || "Kiritilmagan"
            }\n\n` +
            `U bilan bog'lanish uchun yuqoridagi ma'lumotlardan foydalaning.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔙 Orqaga qaytish",
                    callback_data: "back_to_admin_main",
                  },
                ],
              ],
            },
          }
        );
      }
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Dastavchi paneliga qaytish
  if (data === "back_to_delivery_main") {
    await safeEditMessage(
      `🚚 <b>Dastavchi paneli</b>\n\n` +
        `Quyidagi funksiyalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📦 Buyurtmalar",
                callback_data: "delivery_orders",
              },
            ],
            [
              {
                text: "🔙 Orqaga qaytish",
                callback_data: "back_to_main_menu",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  return false; // Bu callback bu faylda boshqarilmagan
};

