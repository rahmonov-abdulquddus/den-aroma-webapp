// src/handlers/callbacks/orderCallbacks.js

import { getTranslation } from "../../utils/i18n.js";
import orderService from "../../services/orderService.js";
import cartService from "../../services/cartService.js";
import { mainMenuKeyboard } from "../../keyboards/mainMenu.js";

/**
 * Buyurtma callback'larini boshqarish
 */
export const handleOrderCallbacks = async (
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

  // Buyurtmani qabul qilish
  if (data.startsWith("accept_order_")) {
    const orderId = data.split("accept_order_")[1];

    try {
      await orderService.acceptOrder(orderId);

      await safeEditMessage(
        `✅ <b>Buyurtma qabul qilindi!</b>\n\n` +
          `📦 <b>Buyurtma raqami:</b> #${orderId}\n` +
          `✅ Buyurtma muvaffaqiyatli qabul qilindi`,
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
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Buyurtmani bekor qilish
  if (data.startsWith("cancel_order_")) {
    const orderId = data.split("cancel_order_")[1];

    try {
      await orderService.cancelOrder(orderId);

      await safeEditMessage(
        `❌ <b>Buyurtma bekor qilindi!</b>\n\n` +
          `📦 <b>Buyurtma raqami:</b> #${orderId}\n` +
          `❌ Buyurtma bekor qilindi`,
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
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Mahsulotni tanlash
  if (data.startsWith("select_product_")) {
    const productId = data.split("select_product_")[1];

    try {
      await cartService.addToCart(telegramId, productId, 1);

      await safeEditMessage(
        `✅ <b>Mahsulot tanlandi!</b>\n\n` + `Mahsulot savatga qo'shildi.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛒 Savatni ko'rish",
                  callback_data: "view_cart",
                },
                {
                  text: "🔄 Davom etish",
                  callback_data: "continue_shopping",
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

  // Mahsulotni tanlashdan chiqarish
  if (data.startsWith("unselect_product_")) {
    const productId = data.split("unselect_product_")[1];

    try {
      await cartService.removeFromCart(telegramId, productId);

      await safeEditMessage(
        `❌ <b>Mahsulot olib tashlandi!</b>\n\n` +
          `Mahsulot savatdan olib tashlandi.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛒 Savatni ko'rish",
                  callback_data: "view_cart",
                },
                {
                  text: "🔄 Davom etish",
                  callback_data: "continue_shopping",
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

  // Buyurtmani ko'rish
  if (data.startsWith("view_order_")) {
    const orderId = data.split("view_order_")[1];

    try {
      const order = await orderService.getOrderById(orderId);
      if (order) {
        let messageText =
          `📦 <b>Buyurtma ma'lumotlari</b>\n\n` +
          `🆔 <b>Buyurtma raqami:</b> #${order.id}\n` +
          `📅 <b>Sana:</b> ${new Date(
            order.createdAt
          ).toLocaleDateString()}\n` +
          `💰 <b>Jami narx:</b> ${order.totalAmount} so'm\n` +
          `📊 <b>Holat:</b> ${order.status}\n\n`;

        if (order.items && order.items.length > 0) {
          messageText += `<b>Mahsulotlar:</b>\n`;
          for (const item of order.items) {
            messageText += `• ${item.productName} × ${item.quantity}\n`;
          }
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
      }
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Admin buyurtmani tasdiqlash
  if (data.startsWith("admin_approve_order_")) {
    const orderId = data.split("admin_approve_order_")[1];

    try {
      await orderService.approveOrder(orderId);

      await safeEditMessage(
        `✅ <b>Buyurtma tasdiqlandi!</b>\n\n` +
          `📦 <b>Buyurtma raqami:</b> #${orderId}\n` +
          `✅ Buyurtma muvaffaqiyatli tasdiqlandi`,
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
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  return false; // Bu callback bu faylda boshqarilmagan
};

