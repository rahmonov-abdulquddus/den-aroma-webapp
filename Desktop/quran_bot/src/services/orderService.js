// src/services/orderService.js

import orderRepository from "../db/repositories/orderRepository.js"; // YO'LNI TO'G'IRLASH
import cartService from "./cartService.js"; // cartServiceni ham import qilish
import userService from "./userService.js"; // Foydalanuvchi servisiga ehtiyoj bo'lishi mumkin (agar yaratgan bo'lsangiz)
import validation from "../utils/validation.js"; // Validatsiya uchun
import {
  updateOrderStatistics,
  updateUserStatistics,
  updateDeliveryStatistics,
  getTodayOrderNumber,
} from "../utils/reportGenerator.js";

const orderService = {
  /**
   * Savatdagi mahsulotlar asosida yangi buyurtma yaratadi.
   * @param {string} telegramId - Foydalanuvchining Telegram IDsi.
   * @param {object} orderDetails - Buyurtma tafsilotlari (shippingAddress, phoneNumber, paymentMethod).
   * @returns {Promise<object>} Yangi yaratilgan buyurtma obyekti.
   * @throws {Error} Agar savat bo'sh bo'lsa yoki foydalanuvchi topilmasa.
   */
  createOrderFromCart: async (telegramId, orderDetails) => {
    // Foydalanuvchini topamiz
    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) throw new Error("Foydalanuvchi topilmadi.");
    // Savatni topamiz
    const cart = await cartService.getUserCart(user._id);
    if (!cart || !cart.products.length) throw new Error("Savat bo‘sh.");
    // Buyurtma ma’lumotlari
    // Bugungi buyurtma raqamini olish
    const todayOrderNumber = getTodayOrderNumber();
    console.log("Yaratilgan buyurtma raqami:", todayOrderNumber);

    const orderData = {
      user: user._id,
      products: cart.products,
      contact: orderDetails.phoneNumber || orderDetails.contact,
      address: orderDetails.shippingAddress || orderDetails.address,
      totalPrice: cart.totalPrice,
      paymentMethod: orderDetails.paymentMethod || "cash",
      status: "yangi",
      orderNumber: todayOrderNumber, // Bugungi buyurtma raqami (001, 002...)
    };

    // Validatsiya
    const validationResult = validation.validateOrderData(orderData);
    if (!validationResult.isValid) {
      throw new Error(
        `Buyurtma ma'lumotlari noto'g'ri: ${validationResult.errors.join(", ")}`
      );
    }

    const newOrder = await orderRepository.create(orderData);
    await cartService.clearUserCart(user._id);

    // Statistika yangilash
    try {
      updateOrderStatistics(1, cart.totalPrice, "create"); // 1 ta buyurtma, foyda qo'shilmaydi
      console.log("Buyurtma statistikasi yangilandi");
    } catch (error) {
      console.error("Statistika yangilashda xato:", error.message);
    }

    return newOrder;
  },

  /**
   * Buyurtmani ID bo'yicha oladi.
   * @param {string} orderId - Buyurtma IDsi.
   * @returns {Promise<object|null>} Buyurtma obyekti.
   */
  getOrderById: async (orderId) => {
    return orderRepository.findById(orderId);
  },

  /**
   * Foydalanuvchining barcha buyurtmalarini oladi.
   * @param {string} telegramId - Foydalanuvchining Telegram IDsi.
   * @returns {Promise<Array>} Buyurtmalar ro'yxati.
   */
  getUserOrders: async (telegramId) => {
    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      throw new Error("Foydalanuvchi topilmadi.");
    }
    return orderRepository.findByUserId(user._id);
  },

  /**
   * Admin uchun barcha buyurtmalarni oladi.
   * @returns {Promise<Array>} Barcha buyurtmalar ro'yxati.
   */
  getAllOrdersForAdmin: async () => {
    return orderRepository.findAll();
  },

  /**
   * Buyurtma holatini yangilaydi.
   * @param {string} orderId - Buyurtma IDsi.
   * @param {string} newStatus - Yangi holat.
   * @returns {Promise<object|null>} Yangilangan buyurtma obyekti.
   */
  updateOrderStatus: async (orderId, newStatus) => {
    return orderRepository.updateStatus(orderId, newStatus);
  },

  /**
   * Buyurtmaga dastavchik biriktirish va statusni yangilash.
   */
  assignDeliveryPerson: async (orderId, deliveryPersonId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Buyurtma topilmadi");

    // Dastavchi to'g'ridan-to'g'ri qabul qilayotgan bo'lsa, status tekshiruvini o'tkazib yuborish
    if (order.status === "admin_tasdiqladi" || order.status === "yangi") {
      return orderRepository.assignDeliveryPerson(orderId, deliveryPersonId);
    }

    throw new Error("Buyurtma holati noto'g'ri");
  },

  /**
   * Buyurtmani "yetkazildi" qilish (faqat dastavchik o'ziga biriktirilgan bo'lsa).
   */
  markOrderAsDelivered: async (orderId, deliveryPersonId) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Buyurtma topilmadi");

    // Buyurtma statusi tekshirish
    if (order.status !== "dastavchikka_berildi") {
      throw new Error("Buyurtma hali dastavchikka berilmagan");
    }

    // Dastavchi biriktirilganligini tekshirish
    if (!order.deliveryPersonId) {
      throw new Error("Buyurtmaga dastavchi biriktirilmagan");
    }

    if (String(order.deliveryPersonId) !== String(deliveryPersonId)) {
      throw new Error("Sizga biriktirilmagan buyurtma");
    }

    const updatedOrder = await orderRepository.markAsDelivered(orderId);

    // Dastavchi yetkazib berganida statistika yangilash
    try {
      updateDeliveryStatistics(order.totalPrice);
      console.log("Dastavchi statistikasi yangilandi");
    } catch (error) {
      console.error("Dastavchi statistikasi yangilashda xato:", error.message);
    }

    return updatedOrder;
  },

  /**
   * Jami buyurtmalar sonini oladi.
   * @returns {Promise<number>} - Buyurtmalar soni.
   */
  getTotalOrders: async () => {
    return orderRepository.countAll();
  },

  /**
   * Bugungi buyurtmalar sonini oladi.
   * @returns {Promise<number>} - Bugungi buyurtmalar soni.
   */
  getTodayOrders: async () => {
    return orderRepository.countToday();
  },

  /**
   * Kutilayotgan buyurtmalar sonini oladi.
   * @returns {Promise<number>} - Kutilayotgan buyurtmalar soni.
   */
  getPendingOrders: async () => {
    return orderRepository.countByStatus("yangi");
  },

  /**
   * Dastavchik uchun bugungi yetkazilgan buyurtmalar soni.
   */
  getTodayDeliveredCount: async (deliveryPersonId) => {
    return orderRepository.countDeliveredToday(deliveryPersonId);
  },

  /**
   * Admin uchun bugungi jami yetkazilgan buyurtmalar soni.
   */
  getTodayTotalDeliveredCount: async () => {
    return orderRepository.countDeliveredToday();
  },

  /**
   * Dastavchik va status bo'yicha buyurtmalarni olish
   */
  getOrdersByDeliveryPersonAndStatus: async (deliveryPersonId, status) => {
    return orderRepository.findByDeliveryPersonAndStatus(
      deliveryPersonId,
      status
    );
  },

  // Boshqa buyurtmaga oid servislar

  /**
   * Mijozga buyurtma yolda xabarini yuborish
   */
  sendOrderOnTheWayMessage: async (orderId, bot) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Buyurtma topilmadi");

    // User ID dan telegram ID ni olish
    const user = await userService.getUserById(order.user);
    if (!user) throw new Error("Foydalanuvchi topilmadi");

    const message =
      `🚚 <b>Hurmatli mijoz!</b>\n\n` +
      `✅ <b>Buyurtmangiz yolda!</b>\n\n` +
      `📦 <b>Buyurtma raqami:</b> #${order.orderNumber}\n` +
      `📍 <b>Manzil:</b> ${order.address}\n` +
      `📱 <b>Telefon:</b> ${order.contact}\n` +
      `💰 <b>Jami narx:</b> ${order.totalPrice} so'm\n\n` +
      `🚀 <b>Dastavchi:</b> ${
        order.deliveryPerson?.firstName || "Tayinlanmagan"
      }\n` +
      `⏰ <b>Taxminiy vaqt:</b> 20-30 daqiqa\n\n` +
      `📞 Savollaringiz bo'lsa, biz bilan bog'laning!`;

    try {
      await bot.sendMessage(user.telegramId, message, { parse_mode: "HTML" });
      return true;
    } catch (error) {
      console.error("Mijozga xabar yuborishda xato:", error);
      throw new Error("Mijozga xabar yuborilmadi");
    }
  },

  /**
   * Mijozga fikr so'rash xabarini yuborish
   */
  sendFeedbackRequestMessage: async (orderId, bot) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Buyurtma topilmadi");

    // User ID dan telegram ID ni olish
    const user = await userService.getUserById(order.user);
    if (!user) throw new Error("Foydalanuvchi topilmadi");

    const message =
      `🎉 <b>Buyurtma yetkazildi!</b>\n\n` +
      `✅ <b>Buyurtmangiz muvaffaqiyatli yetkazildi!</b>\n\n` +
      `📦 <b>Buyurtma raqami:</b> #${order.orderNumber}\n` +
      `📍 <b>Manzil:</b> ${order.address}\n` +
      `💰 <b>Jami narx:</b> ${order.totalPrice} so'm\n\n` +
      `⭐ <b>Mahsulotlarimiz sifatini baholang:</b>\n\n` +
      `📝 Fikringizni yozing va yuboring. Bu bizga yaxshilanishga yordam beradi!`;

    try {
      await bot.sendMessage(user.telegramId, message, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "⭐ Fikr yozish",
                callback_data: `write_feedback_${order._id}`,
              },
            ],
          ],
        },
      });
      return true;
    } catch (error) {
      console.error("Mijozga fikr so'rash xabarida xato:", error);
      throw new Error("Mijozga fikr so'rash xabari yuborilmadi");
    }
  },

  /**
   * Foydalanuvchi fikrini saqlash
   */
  saveUserFeedback: async (orderId, feedback) => {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new Error("Buyurtma topilmadi");

    return orderRepository.saveFeedback(orderId, feedback);
  },

  /**
   * Barcha fikrlarni olish (admin uchun)
   */
  getAllFeedbacks: async () => {
    return orderRepository.findAllWithFeedbacks();
  },
};

export default orderService;
