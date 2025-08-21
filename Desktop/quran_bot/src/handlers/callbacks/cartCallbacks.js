// src/handlers/callbacks/cartCallbacks.js

import { getTranslation } from "../../utils/i18n.js";
import cartService from "../../services/cartService.js";
import productService from "../../services/productService.js";
import { cartMenuKeyboard } from "../../keyboards/cartMenu.js";

/**
 * Savat callback'larini boshqarish
 */
export const handleCartCallbacks = async (
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

  // Savatga mahsulot qo'shish
  if (data.startsWith("add_to_cart_")) {
    const productId = data.split("add_to_cart_")[1];

    try {
      const product = await productService.getProductById(productId);
      if (!product) {
        await safeEditMessage("❌ Mahsulot topilmadi!");
        return true;
      }

      await cartService.addToCart(telegramId, productId, 1);

      await safeEditMessage(
        `✅ <b>Mahsulot savatga qo'shildi!</b>\n\n` +
          `📦 <b>Mahsulot:</b> ${product.name}\n` +
          `💰 <b>Narxi:</b> ${product.price} so'm\n` +
          `📊 <b>Miqdori:</b> 1 dona`,
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

  // Miqdorni o'rnatish
  if (data.startsWith("set_quantity_")) {
    const [productId, quantity] = data.split("set_quantity_")[1].split("_");

    try {
      await cartService.updateCartItemQuantity(
        telegramId,
        productId,
        parseInt(quantity)
      );

      await safeEditMessage(
        `✅ <b>Miqdor yangilandi!</b>\n\n` +
          `📊 <b>Yangi miqdor:</b> ${quantity} dona`,
        {
          parse_mode: "HTML",
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
        }
      );
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Maxsus miqdor kiritish
  if (data.startsWith("custom_quantity_")) {
    const productId = data.split("custom_quantity_")[1];

    await safeEditMessage(
      `📝 <b>Maxsus miqdor kiritish</b>\n\n` +
        `Mahsulot ID: ${productId}\n\n` +
        `Kerakli miqdorni raqamda yuboring:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Orqaga qaytish",
                callback_data: `view_product_${productId}`,
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // Savatni ko'rish
  if (data === "view_cart") {
    try {
      const cart = await cartService.getCart(telegramId);
      if (!cart || cart.items.length === 0) {
        await safeEditMessage(
          `🛒 <b>Savat bo'sh</b>\n\n` + `Savatda hech qanday mahsulot yo'q.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🛍️ Mahsulotlarni ko'rish",
                    callback_data: "back_to_categories",
                  },
                ],
              ],
            },
          }
        );
        return true;
      }

      let messageText = `🛒 <b>Savat</b>\n\n`;
      let totalPrice = 0;

      for (const item of cart.items) {
        const product = await productService.getProductById(item.productId);
        if (product) {
          const itemTotal = product.price * item.quantity;
          totalPrice += itemTotal;
          messageText +=
            `📦 <b>${product.name}</b>\n` +
            `💰 ${product.price} so'm × ${item.quantity} = ${itemTotal} so'm\n\n`;
        }
      }

      messageText += `💵 <b>Jami:</b> ${totalPrice} so'm`;

      await safeEditMessage(messageText, {
        parse_mode: "HTML",
        reply_markup: cartMenuKeyboard,
      });
    } catch (error) {
      await safeEditMessage(`❌ <b>Xato yuz berdi!</b>\n\n${error.message}`, {
        parse_mode: "HTML",
      });
    }
    return true;
  }

  // Savatni tozalash
  if (data === "clear_cart") {
    try {
      await cartService.clearCart(telegramId);

      await safeEditMessage(
        `🗑️ <b>Savat tozalandi!</b>\n\n` +
          `Savatdagi barcha mahsulotlar o'chirildi.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🛍️ Yangi mahsulotlar",
                  callback_data: "back_to_categories",
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

  // Xarid qilishni davom ettirish
  if (data === "continue_shopping") {
    await safeEditMessage(
      `🛍️ <b>Xarid qilishni davom eting</b>\n\n` +
        `Kategoriyalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📂 Kategoriyalar",
                callback_data: "back_to_categories",
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

