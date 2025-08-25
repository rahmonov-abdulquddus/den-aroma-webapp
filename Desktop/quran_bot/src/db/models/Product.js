// src/db/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
    min: 0,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: false, // ixtiyoriy qilamiz
    default: "https://via.placeholder.com/300x200?text=No+Image",
  },
  category: {
    type: String,
    required: false, // ixtiyoriy qilamiz
    enum: [
      "premium",
      "classic",
      "deluxe",
      "organic",
      "limited",
      "food",
      "sports",
      "discounts",
      "family",
      "market",
      "cards",
      "auto",
      "repair",
      "school",
      "household", // xo'jalik buyumlari
      "cosmetics", // kosmetika
      "hygiene", // gigiena
      "detergents", // yuvish vositalari
      "other", // boshqa
      // Uzbekcha kategoriyalar
      "Kosmetika",
      "Ayollar atirlari 🌺",
      "Erkaklar atirlari 👳🏻‍♂️",
      "Hojalik anjomlari",
      "Yangi",
      "Atirlar",
      "Boshqa"
    ],
    default: "other",
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
  rating: {
    type: Number,
    default: 5,
    min: 1,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: false, // ixtiyoriy qilamiz
    default: "admin",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  sales: {
    type: Number,
    default: 0,
  },
  // Yangi maydonlar
  source: {
    type: String,
    enum: ["manual", "channel_post", "import"],
    default: "manual",
  },
  needsReview: {
    type: Boolean,
    default: false,
  },
  importData: {
    messageId: String,
    channelId: String,
    originalCaption: String,
  },
});

// Indexes for better performance
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ createdAt: -1 });

export default mongoose.model("Product", productSchema);
