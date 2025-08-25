// src/db/models/Order.js

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  userInfo: {
    firstName: String,
    lastName: String,
    phone: String,
    telegramUsername: String,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  deliveryAddress: {
    city: String,
    district: String,
    street: String,
    house: String,
    apartment: String,
    landmark: String,
  },
  deliveryInfo: {
    method: {
      type: String,
      enum: ["delivery", "pickup"],
      default: "delivery",
    },
    cost: {
      type: Number,
      default: 0,
    },
    estimatedTime: String,
  },
  payment: {
    method: {
      type: String,
      enum: ["cash", "card"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "delivering",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  notes: {
    customer: String,
    admin: String,
  },
  assignedTo: {
    type: String, // Delivery person ID
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
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });

// Update timestamp on save
orderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `DA-${Date.now().toString().slice(-6)}-${count + 1}`;
  }
  next();
});

export default mongoose.model("Order", orderSchema);
