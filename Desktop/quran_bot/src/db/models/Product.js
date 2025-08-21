// src/db/models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    default: "",
  },
  imageFileId: {
    type: String,
    default: "",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false, // Kategoriyasiz mahsulotlar uchun null bo'lishi mumkin
  },
  stock: {
    type: Number,
    default: 1,
  },
  brand: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  discountPrice: {
    type: Number,
    default: null,
  },
  isDiscount: {
    type: Boolean,
    default: false,
  },
  needsCategorization: {
    type: Boolean,
    default: false, // Kategoriyasiz mahsulotlar uchun true
  },
  isPendingReview: {
    type: Boolean,
    default: false, // Admin ko'rib chiqishi kerak
  },
  isApproved: {
    type: Boolean,
    default: false, // Admin tasdiqlagan
  },
  isRejected: {
    type: Boolean,
    default: false, // Admin rad etgan
  },
  rejectionReason: {
    type: String,
    default: "", // Rad etish sababi
  },
  reviewedBy: {
    type: String, // Admin Telegram ID
    default: "",
  },
  reviewedAt: {
    type: Date,
    default: null,
  },
  suggestedCategory: {
    type: String,
    default: "", // AI tomonidan taklif qilingan kategoriya
  },
  tags: {
    type: [String],
    default: [], // AI tomonidan taklif qilingan xeshteglar
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Performance uchun indexlar
ProductSchema.index({ name: 'text', description: 'text' }); // Qidiruv uchun
ProductSchema.index({ categoryId: 1 }); // Kategoriya bo'yicha
ProductSchema.index({ isActive: 1, isApproved: 1 }); // Faol mahsulotlar uchun
ProductSchema.index({ createdAt: -1 }); // Yangi mahsulotlar uchun
ProductSchema.index({ needsCategorization: 1 }); // Kategoriyalash kerak bo'lganlar uchun

export default mongoose.model("Product", ProductSchema);
