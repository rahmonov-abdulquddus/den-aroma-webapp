// src/db/repositories/orderRepository.js

import Order from "../models/Order.js";
import mongoose from "mongoose"; // YO'LNI TO'G'IRLASH

const orderRepository = {
  /**
   * Yangi buyurtma yaratadi.
   * @param {object} orderData - Buyurtma ma'lumotlari.
   * @returns {Promise<object>} Yangi buyurtma obyekti.
   */
  create: async (orderData) => {
    const order = new Order(orderData);
    return order.save();
  },

  /**
   * Foydalanuvchi IDsi bo'yicha barcha buyurtmalarni topadi.
   * @param {string} userId - Foydalanuvchi IDsi.
   * @returns {Promise<Array>} Buyurtmalar ro'yxati.
   */
  findByUserId: async (userId) => {
    return Order.find({ user: userId })
      .populate("user")
      .populate("products.product")
      .sort({ createdAt: -1 });
  },

  /**
   * Buyurtmani ID bo'yicha topadi.
   * @param {string} orderId - Buyurtma IDsi.
   * @returns {Promise<object|null>} Buyurtma obyekti yoki null.
   */
  findById: async (orderId) => {
    return Order.findById(orderId)
      .populate("user")
      .populate("products.product");
  },

  /**
   * Buyurtma holatini yangilaydi.
   * @param {string} orderId - Buyurtma IDsi.
   * @param {string} newStatus - Yangi holat (e.g., 'processing', 'delivered').
   * @returns {Promise<object|null>} Yangilangan buyurtma obyekti yoki null.
   */
  updateStatus: async (orderId, newStatus) => {
    return Order.findByIdAndUpdate(
      orderId,
      { status: newStatus, updatedAt: Date.now() },
      { new: true }
    );
  },

  /**
   * Barcha buyurtmalarni topadi (Admin uchun).
   * @returns {Promise<Array>} Barcha buyurtmalar ro'yxati.
   */
  findAll: async () => {
    return Order.find({})
      .populate("user")
      .populate("products.product")
      .sort({ createdAt: -1 });
  },

  /**
   * Dastavchik ID bo'yicha buyurtmalarni topadi.
   * @param {string} deliveryPersonId - Dastavchik IDsi.
   * @returns {Promise<Array>} Buyurtmalar ro'yxati.
   */
  findByDeliveryPersonId: async (deliveryPersonId) => {
    return Order.find({ deliveryPersonId })
      .populate("user")
      .populate("products.product")
      .sort({ createdAt: -1 });
  },

  /**
   * Buyurtmaga dastavchik biriktirish va statusni yangilash.
   * @param {string} orderId
   * @param {string} deliveryPersonId
   * @returns {Promise<object|null>}
   */
  assignDeliveryPerson: async (orderId, deliveryPersonId) => {
    return Order.findByIdAndUpdate(
      orderId,
      {
        deliveryPersonId,
        status: "dastavchikka_berildi",
        updatedAt: Date.now(),
      },
      { new: true }
    )
      .populate("user")
      .populate("products.product");
  },

  /**
   * Buyurtmani "yetkazildi" qilish.
   * @param {string} orderId
   * @returns {Promise<object|null>}
   */
  markAsDelivered: async (orderId) => {
    return Order.findByIdAndUpdate(
      orderId,
      { status: "yetkazildi", updatedAt: Date.now() },
      { new: true }
    );
  },

  /**
   * Bugungi yetkazilgan buyurtmalar soni (dastavchik bo'yicha yoki umumiy).
   * @param {string} [deliveryPersonId]
   * @returns {Promise<number>}
   */
  countDeliveredToday: async (deliveryPersonId = null) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const filter = {
      status: "yetkazildi",
      createdAt: { $gte: start, $lte: end },
    };
    if (deliveryPersonId) {
      try {
        filter.deliveryPersonId = new mongoose.Types.ObjectId(deliveryPersonId);
      } catch (error) {
        console.error(`Invalid ObjectId: ${deliveryPersonId}`);
        return 0;
      }
    }
    return Order.countDocuments(filter);
  },

  /**
   * Jami buyurtmalar sonini oladi.
   * @returns {Promise<number>} - Buyurtmalar soni.
   */
  countAll: async () => {
    return Order.countDocuments({});
  },

  /**
   * Bugungi buyurtmalar sonini oladi.
   * @returns {Promise<number>} - Bugungi buyurtmalar soni.
   */
  countToday: async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return Order.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });
  },

  /**
   * Status bo'yicha buyurtmalar sonini oladi.
   * @param {string} status - Buyurtma statusi.
   * @returns {Promise<number>} - Buyurtmalar soni.
   */
  countByStatus: async (status) => {
    return Order.countDocuments({ status });
  },

  /**
   * Dastavchik va status bo'yicha buyurtmalarni olish
   * @param {string} deliveryPersonId - Dastavchik ID
   * @param {string} status - Buyurtma statusi
   * @returns {Promise<Array>} - Buyurtmalar ro'yxati
   */
  findByDeliveryPersonAndStatus: async (deliveryPersonId, status) => {
    // deliveryPersonId ni ObjectId ga o'tkazish
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(deliveryPersonId);
    } catch (error) {
      console.error(`Invalid ObjectId: ${deliveryPersonId}`);
      return [];
    }

    return Order.find({
      deliveryPersonId: objectId,
      status,
    })
      .populate("user")
      .populate("products.product")
      .sort({ createdAt: -1 });
  },

  /**
   * Foydalanuvchi fikrini saqlash
   * @param {string} orderId - Buyurtma ID
   * @param {object} feedback - Fikr ma'lumotlari
   * @returns {Promise<object|null>} - Yangilangan buyurtma
   */
  saveFeedback: async (orderId, feedback) => {
    return Order.findByIdAndUpdate(
      orderId,
      {
        feedback,
        feedbackAt: Date.now(),
        updatedAt: Date.now(),
      },
      { new: true }
    );
  },

  /**
   * Barcha fikrlar bilan buyurtmalarni olish (admin uchun)
   * @returns {Promise<Array>} - Fikrlar bilan buyurtmalar
   */
  findAllWithFeedbacks: async () => {
    return Order.find({ feedback: { $exists: true, $ne: null } })
      .populate("user")
      .populate("products.product")
      .populate("deliveryPersonId")
      .sort({ feedbackAt: -1 });
  },
};

export default orderRepository;
