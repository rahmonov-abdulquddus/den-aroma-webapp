// src/keyboards/deliveryMenu.js

import { getTranslation } from "../utils/i18n.js";

/**
 * Dastavchik asosiy menyu klaviaturasi
 */
export function deliveryMainMenuKeyboard(userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  return {
    inline_keyboard: [
      [
        { text: "🆕 Yangi buyurtmalar", callback_data: "delivery_new_orders" },
        {
          text: "🚚 Mening buyurtmalarim",
          callback_data: "delivery_my_orders",
        },
      ],
      [
        {
          text: "✅ Yetkazilganlar",
          callback_data: "delivery_delivered_orders",
        },
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
  };
}

/**
 * Buyurtma bajarish klaviaturasi
 */
export function deliveryOrderActionKeyboard(orderId, userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  return {
    inline_keyboard: [
      [
        {
          text: "✅ Yetkazildi",
          callback_data: `delivery_mark_delivered_${orderId}`,
        },
        {
          text: "❌ Muammo",
          callback_data: `delivery_report_issue_${orderId}`,
        },
      ],
      [
        {
          text: "📞 Mijoz bilan bog'lanish",
          callback_data: `delivery_contact_customer_${orderId}`,
        },
      ],
      [{ text: "⬅️ Orqaga", callback_data: "delivery_new_orders" }],
    ],
  };
}

/**
 * Buyurtma tafsilotlari klaviaturasi
 */
export function deliveryOrderDetailsKeyboard(orderId, userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  return {
    inline_keyboard: [
      [
        {
          text: "📍 Manzilni ko'rish",
          callback_data: `delivery_view_location_${orderId}`,
        },
        {
          text: "📱 Mijoz ma'lumotlari",
          callback_data: `delivery_customer_info_${orderId}`,
        },
      ],
      [
        {
          text: "✅ Yetkazildi",
          callback_data: `delivery_mark_delivered_${orderId}`,
        },
        {
          text: "❌ Muammo",
          callback_data: `delivery_report_issue_${orderId}`,
        },
      ],
      [{ text: "⬅️ Orqaga", callback_data: "delivery_new_orders" }],
    ],
  };
}

/**
 * Dastavchik statistika klaviaturasi
 */
export function deliveryStatsKeyboard(userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  return {
    inline_keyboard: [
      [
        { text: "📅 Bugun", callback_data: "delivery_stats_today" },
        { text: "📊 Hafta", callback_data: "delivery_stats_week" },
      ],
      [
        { text: "📈 Oylik", callback_data: "delivery_stats_month" },
        { text: "📋 Umumiy", callback_data: "delivery_stats_total" },
      ],
      [{ text: "⬅️ Orqaga", callback_data: "delivery_main_menu" }],
    ],
  };
}

/**
 * Dastavchik sozlamalar klaviaturasi
 */
export function deliverySettingsKeyboard(userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  return {
    inline_keyboard: [
      [
        { text: "📱 Telefon raqam", callback_data: "delivery_set_phone" },
        { text: "📍 Manzil", callback_data: "delivery_set_location" },
      ],
      [
        { text: "⏰ Ish vaqti", callback_data: "delivery_set_working_hours" },
        { text: "🚚 Dastavka zonasi", callback_data: "delivery_set_zones" },
      ],
      [{ text: "⬅️ Orqaga", callback_data: "delivery_main_menu" }],
    ],
  };
}

/**
 * Dastavchik yordam klaviaturasi
 */
export function deliveryHelpKeyboard(userLanguage = "uzbek") {
  const _ = (key, replacements) =>
    getTranslation(key, replacements, userLanguage);

  return {
    inline_keyboard: [
      [
        {
          text: "📞 Admin bilan bog'lanish",
          callback_data: "delivery_contact_admin",
        },
        {
          text: "❓ Ko'p so'raladigan savollar",
          callback_data: "delivery_faq",
        },
      ],
      [
        { text: "📋 Ko'rsatmalar", callback_data: "delivery_instructions" },
        { text: "🔧 Texnik yordam", callback_data: "delivery_tech_support" },
      ],
      [{ text: "⬅️ Orqaga", callback_data: "delivery_main_menu" }],
    ],
  };
}
