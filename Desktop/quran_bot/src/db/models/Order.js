// src/db/models/Order.js

import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  contact: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "yangi",
      "admin_tasdiqladi",
      "dastavchikka_berildi",
      "yetkazildi",
      "cancelled",
    ],
    default: "yangi",
  },
  deliveryPersonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryPerson",
    default: null,
  },
  paymentMethod: {
    type: String,
    default: "cash", // yoki 'click', 'payme', 'uzum', va h.k.
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  feedback: {
    text: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    createdAt: {
      type: Date,
      default: null,
    },
  },
  feedbackAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Yangilanish vaqtini avtomatik yangilash
OrderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Validatsiya
OrderSchema.pre("save", function (next) {
  if (this.products.length === 0) {
    return next(new Error("Buyurtmada kamida bitta mahsulot bo'lishi kerak"));
  }

  if (this.totalPrice <= 0) {
    return next(new Error("Buyurtma narxi 0 dan katta bo'lishi kerak"));
  }

  next();
});

// Performance uchun indexlar
OrderSchema.index({ user: 1, createdAt: -1 }); // Foydalanuvchi buyurtmalari
OrderSchema.index({ status: 1 }); // Status bo'yicha
OrderSchema.index({ deliveryPersonId: 1 }); // Dastavchik bo'yicha
OrderSchema.index({ createdAt: -1 }); // Yangi buyurtmalar
OrderSchema.index({ orderNumber: 1 }); // Buyurtma raqami bo'yicha

export default mongoose.model("Order", OrderSchema);
