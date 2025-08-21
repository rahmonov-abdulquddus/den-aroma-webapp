// src/handlers/callbacks/index.js

import { handleAdminCallbacks } from "./adminCallbacks.js";
import { handleUserCallbacks } from "./userCallbacks.js";
import { handleCartCallbacks } from "./cartCallbacks.js";
import { handleOrderCallbacks } from "./orderCallbacks.js";
import { handleDeliveryCallbacks } from "./deliveryCallbacks.js";

/**
 * Barcha callback'larni boshqarish
 */
export const handleAllCallbacks = async (
  bot,
  callbackQuery,
  safeEditMessage
) => {
  // Admin callback'larini tekshirish
  if (await handleAdminCallbacks(bot, callbackQuery, safeEditMessage)) {
    return true;
  }

  // User callback'larini tekshirish
  if (await handleUserCallbacks(bot, callbackQuery, safeEditMessage)) {
    return true;
  }

  // Cart callback'larini tekshirish
  if (await handleCartCallbacks(bot, callbackQuery, safeEditMessage)) {
    return true;
  }

  // Order callback'larini tekshirish
  if (await handleOrderCallbacks(bot, callbackQuery, safeEditMessage)) {
    return true;
  }

  // Delivery callback'larini tekshirish
  if (await handleDeliveryCallbacks(bot, callbackQuery, safeEditMessage)) {
    return true;
  }

  // Agar hech qaysi callback handler'da boshqarilmagan bo'lsa
  return false;
};

