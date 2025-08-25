// src/handlers/callbacks/adminCallbacks.js

import { getTranslation } from "../../utils/i18n.js";
import categoryService from "../../services/categoryService.js";
import productService from "../../services/productService.js";
import adminService from "../../services/adminService.js";
import deliveryPersonService from "../../services/deliveryPersonService.js";
import { adminSettings } from "../../config/adminSettings.js";
import {
  generatePDFReport,
  generateExcelReport,
  getSimulatedData,
  clearStatisticsData,
} from "../../utils/reportGenerator.js";
import {
  adminMainMenuInlineKeyboard,
  manageProductsKeyboard,
} from "../../keyboards/adminMenu.js";
import {
  manageCategoriesKeyboard,
  confirmDeleteCategoryKeyboard,
  productCategorySelectionKeyboard,
} from "../../keyboards/categoryMenu.js";
import {
  isAdmin,
  displayAdminCategories,
  displayCategoriesForProduct,
  displayAdminProducts,
  displayAdminProductsByCategory,
  displayAdminList,
  displayDeliveryPersonList,
} from "../../utils/adminUtils.js";
import { handleImportAllPosts } from "../channelPostHandler.js";

/**
 * Admin callback'larini boshqarish (faqat super admin uchun)
 */
export const handleAdminCallbacks = async (
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

  // ===== ADMIN OYNA TUGMALARI =====

  // Mahsulotlarni boshqarish
  if (data === "manage_products") {
    await safeEditMessage(
      `📦 <b>Mahsulotlarni boshqarish</b>\n\n` +
        `Quyidagi funksiyalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: manageProductsKeyboard(userLanguage),
      }
    );
    return true;
  }

  // Kategoriyalarni boshqarish
  if (data === "manage_categories") {
    await displayAdminCategories(bot, telegramId);
    return true;
  }

  // Xabar yuborish
  if (data === "send_message") {
    await safeEditMessage(
      `📝 <b>Xabar yuborish</b>\n\n` +
        `Barcha foydalanuvchilarga yuboriladigan xabarni yuboring:`,
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
    return true;
  }

  // Skidka post yuborish
  if (data === "send_discount_post") {
    await safeEditMessage(
      `🔥 <b>Skidka post yuborish</b>\n\n` + `Skidka haqidagi postni yuboring:`,
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
    return true;
  }

  // Post tashlash
  if (data === "send_post") {
    await safeEditMessage(
      `📝 <b>Post tashlash</b>\n\n` +
        `Kanalga yuboriladigan postni yuboring:\n\n` +
        `📋 <b>Post turlari:</b>\n` +
        `• Mahsulot haqida\n` +
        `• Yangiliklar\n` +
        `• Chegirmalar\n` +
        `• Boshqa ma'lumotlar\n\n` +
        `Postni yuboring yoki "🔙 Orqaga" tugmasini bosing:`,
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

    // Foydalanuvchi holatini o'rnatish
    global.userStates = global.userStates || {};
    global.userStates[telegramId] = {
      step: "waiting_post_content",
      postData: {},
    };

    return true;
  }

  // Hisobotlar
  if (data === "generate_reports") {
    await safeEditMessage(
      `📊 <b>Hisobotlar</b>\n\n` + `Quyidagi hisobotlardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📈 PDF Hisobot",
                callback_data: "report_pdf",
              },
              {
                text: "📊 Excel Hisobot",
                callback_data: "report_excel",
              },
            ],
            [
              {
                text: "📋 Statistika",
                callback_data: "report_stats",
              },
              {
                text: "🗑️ Ma'lumotlarni tozalash",
                callback_data: "report_clear",
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
      }
    );
    return true;
  }

  // Admin sozlamalari
  if (data === "admin_settings") {
    await safeEditMessage(
      `⚙️ <b>Admin Sozlamalari</b>\n\n` +
        `Quyidagi sozlamalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "👥 Foydalanuvchilarni boshqarish",
                callback_data: "manage_users",
              },
              {
                text: "🚚 Yetkazib beruvchilarni boshqarish",
                callback_data: "manage_delivery",
              },
            ],
            [
              {
                text: "📦 Buyurtmalarni boshqarish",
                callback_data: "manage_orders",
              },
              {
                text: "🔧 Boshqa sozlamalar",
                callback_data: "other_settings",
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
      }
    );
    return true;
  }

  // ===== MAHSULOTLARNI BOSHQARISH =====

  // Yangi mahsulot qo'shish
  if (data === "add_product") {
    await displayCategoriesForProduct(bot, telegramId, "admin_view");
    return true;
  }

  // Mahsulotlarni ko'rish
  if (data === "view_products") {
    await displayAdminProducts(bot, telegramId);
    return true;
  }

  // Kategoriya bo'yicha mahsulotlarni ko'rish
  if (data.startsWith("admin_view_products_in_category_")) {
    const categoryId = data.replace("admin_view_products_in_category_", "");
    await displayAdminProductsByCategory(bot, telegramId, categoryId);
    return true;
  }

  // Mahsulotlar sahifasi
  if (data.startsWith("admin_products_page_")) {
    const parts = data.replace("admin_products_page_", "").split("_");
    const page = parseInt(parts[0]);
    const categoryId = parts[1] || "all";
    await displayAdminProductsByCategory(
      bot,
      telegramId,
      categoryId,
      null,
      page
    );
    return true;
  }

  // Mahsulotlarni kategoriya bo'yicha ko'rish
  if (data === "view_products_by_category") {
    await displayCategoriesForProduct(bot, chatId, "admin_view");
    return true;
  }

  // Mahsulotni tahrirlash
  if (data.startsWith("edit_product_")) {
    const productId = data.replace("edit_product_", "");
    // Mahsulotni tahrirlash logikasi
    await safeEditMessage(
      `✏️ <b>Mahsulotni tahrirlash</b>\n\n` +
        `Mahsulot ID: ${productId}\n` +
        `Qaysi maydonni tahrirlamoqchisiz?`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📝 Nomi",
                callback_data: `edit_product_name_${productId}`,
              },
              {
                text: "💰 Narxi",
                callback_data: `edit_product_price_${productId}`,
              },
            ],
            [
              {
                text: "📖 Tavsifi",
                callback_data: `edit_product_description_${productId}`,
              },
              {
                text: "🏷️ Kategoriyasi",
                callback_data: `edit_product_category_${productId}`,
              },
            ],
            [
              {
                text: "🔙 Mahsulotlarni boshqarishga qaytish",
                callback_data: "manage_products",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // Mahsulotni o'chirish
  if (data.startsWith("delete_product_")) {
    const productId = data.replace("delete_product_", "");
    await safeEditMessage(
      `🗑️ <b>Mahsulotni o'chirish</b>\n\n` +
        `Mahsulot ID: ${productId}\n` +
        `Bu mahsulotni o'chirishni xohlaysizmi?`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Ha, o'chir",
                callback_data: `confirm_delete_product_${productId}`,
              },
              {
                text: "❌ Yo'q",
                callback_data: "manage_products",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // ===== KATEGORIYALARNI BOSHQARISH =====

  // Yangi kategoriya qo'shish
  if (data === "add_category") {
    await safeEditMessage(
      `➕ <b>Yangi kategoriya qo'shish</b>\n\n` + `Kategoriya nomini yuboring:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Kategoriyalarni boshqarishga qaytish",
                callback_data: "manage_categories",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // Kategoriyani tahrirlash
  if (data.startsWith("edit_category_")) {
    const categoryId = data.replace("edit_category_", "");
    await safeEditMessage(
      `✏️ <b>Kategoriyani tahrirlash</b>\n\n` +
        `Kategoriya ID: ${categoryId}\n` +
        `Yangi nomini yuboring:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Kategoriyalarni boshqarishga qaytish",
                callback_data: "manage_categories",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // Kategoriyani o'chirish
  if (data.startsWith("delete_category_")) {
    const categoryId = data.replace("delete_category_", "");
    await safeEditMessage(
      `🗑️ <b>Kategoriyani o'chirish</b>\n\n` +
        `Kategoriya ID: ${categoryId}\n` +
        `Bu kategoriyani o'chirishni xohlaysizmi?`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "✅ Ha, o'chir",
                callback_data: `confirm_delete_category_${categoryId}`,
              },
              {
                text: "❌ Yo'q",
                callback_data: "manage_categories",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // ===== FOYDALANUVCHILARNI BOSHQARISH =====

  // Foydalanuvchilarni ko'rish
  if (data === "view_users") {
    await displayAdminList(bot, telegramId, "users");
    return true;
  }

  // Dastavchilarni ko'rish
  if (data === "view_delivery_persons") {
    await displayDeliveryPersonList(bot, telegramId);
    return true;
  }

  // Foydalanuvchini bloklash
  if (data.startsWith("block_user_")) {
    const userId = data.replace("block_user_", "");
    // Foydalanuvchini bloklash logikasi
    await safeEditMessage(
      `🚫 <b>Foydalanuvchini bloklash</b>\n\n` +
        `Foydalanuvchi ID: ${userId}\n` +
        `Foydalanuvchi bloklandi.`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Foydalanuvchilarni boshqarishga qaytish",
                callback_data: "manage_users",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // ===== YETKAZIB BERISHNI BOSHQARISH =====

  // Yetkazib beruvchilarni boshqarish
  if (data === "manage_delivery") {
    await displayDeliveryPersonList(bot, chatId);
    return true;
  }

  // Yangi yetkazib beruvchi qo'shish
  if (data === "add_delivery_person") {
    await safeEditMessage(
      `➕ <b>Yangi yetkazib beruvchi qo'shish</b>\n\n` +
        `Yetkazib beruvchi nomini yuboring:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Yetkazib berishni boshqarishga qaytish",
                callback_data: "manage_delivery",
              },
            ],
          ],
        },
      }
    );
    return true;
  }

  // ===== BUYURTMA BOSHQARISH =====

  // Buyurtmalarni boshqarish
  if (data === "manage_orders") {
    await safeEditMessage(
      `📋 <b>Buyurtmalarni boshqarish</b>\n\n` +
        `Quyidagi funksiyalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📊 Barcha buyurtmalar",
                callback_data: "view_all_orders",
              },
              {
                text: "⏳ Kutilayotgan buyurtmalar",
                callback_data: "view_pending_orders",
              },
            ],
            [
              {
                text: "✅ Bajarilgan buyurtmalar",
                callback_data: "view_completed_orders",
              },
              {
                text: "❌ Bekor qilingan buyurtmalar",
                callback_data: "view_cancelled_orders",
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
      }
    );
    return true;
  }

  // ===== HISOBOTLAR =====

  // PDF hisobot
  if (data === "report_pdf") {
    try {
      const report = await generatePDFReport();
      await bot.sendDocument(chatId, report, {
        caption: "📊 PDF hisobot tayyorlandi",
      });
    } catch (error) {
      await safeEditMessage(
        `❌ <b>Xato</b>\n\n` +
          `PDF hisobot yaratishda xato yuz berdi: ${error.message}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Hisobotlarga qaytish",
                  callback_data: "generate_reports",
                },
              ],
            ],
          },
        }
      );
    }
    return true;
  }

  // Excel hisobot
  if (data === "report_excel") {
    try {
      const report = await generateExcelReport();
      await bot.sendDocument(chatId, report, {
        caption: "📊 Excel hisobot tayyorlandi",
      });
    } catch (error) {
      await safeEditMessage(
        `❌ <b>Xato</b>\n\n` +
          `Excel hisobot yaratishda xato yuz berdi: ${error.message}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Hisobotlarga qaytish",
                  callback_data: "generate_reports",
                },
              ],
            ],
          },
        }
      );
    }
    return true;
  }

  // Statistika
  if (data === "report_stats") {
    try {
      const stats = await getSimulatedData();
      await safeEditMessage(
        `📊 <b>Statistika</b>\n\n` +
          `Jami foydalanuvchilar: ${stats.totalUsers}\n` +
          `Jami buyurtmalar: ${stats.totalOrders}\n` +
          `Jami mahsulotlar: ${stats.totalProducts}\n` +
          `Jami kategoriyalar: ${stats.totalCategories}\n` +
          `Bugungi buyurtmalar: ${stats.todayOrders}\n` +
          `Bu oydagi buyurtmalar: ${stats.monthOrders}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Hisobotlarga qaytish",
                  callback_data: "generate_reports",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {
      await safeEditMessage(
        `❌ <b>Xato</b>\n\n` +
          `Statistika olishda xato yuz berdi: ${error.message}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Hisobotlarga qaytish",
                  callback_data: "generate_reports",
                },
              ],
            ],
          },
        }
      );
    }
    return true;
  }

  // Ma'lumotlarni tozalash
  if (data === "report_clear") {
    try {
      await clearStatisticsData();
      await safeEditMessage(
        `🗑️ <b>Ma'lumotlar tozalandi</b>\n\n` +
          `Barcha statistika ma'lumotlari muvaffaqiyatli tozalandi.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Hisobotlarga qaytish",
                  callback_data: "generate_reports",
                },
              ],
            ],
          },
        }
      );
    } catch (error) {
      await safeEditMessage(
        `❌ <b>Xato</b>\n\n` +
          `Ma'lumotlarni tozalashda xato yuz berdi: ${error.message}`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🔙 Hisobotlarga qaytish",
                  callback_data: "generate_reports",
                },
              ],
            ],
          },
        }
      );
    }
    return true;
  }

  // ===== ADMIN ASOSIY MENYUGA QAYTISH =====

  if (data === "back_to_admin_main") {
    await safeEditMessage(
      `🔧 <b>Admin Panel</b>\n\n` + `Quyidagi funksiyalardan birini tanlang:`,
      {
        parse_mode: "HTML",
        reply_markup: adminMainMenuInlineKeyboard(userLanguage),
      }
    );
    return true;
  }

  return false;
};
