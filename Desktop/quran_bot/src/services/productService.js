// src/services/productService.js

import Fuse from "fuse.js";
import Product from "../db/models/Product.js"; // Product modelini import qilish
import mongoose from "mongoose"; // ObjectId tekshiruvi uchun
import {
  getAICategorySuggestion,
  suggestTags,
} from "../utils/aiCategorySuggestion.js"; // AI kategoriya va tag taklifi
import axios from "axios";

class ProductService {
  /**
   * Yangi mahsulot qo'shadi.
   * @param {Object} productData - Mahsulot ma'lumotlari obyekt sifatida.
   * @param {string} [productData.categoryId] - Mahsulot kategoriyasi IDsi (ixtiyoriy).
   * @param {string} productData.name - Mahsulot nomi.
   * @param {string} productData.description - Mahsulot tavsifi.
   * @param {number} productData.price - Mahsulot narxi.
   * @param {string} productData.imageUrl - Mahsulot rasmi URL'i.
   * @param {number} productData.stock - Mahsulot soni.
   * @returns {Promise<Object>} Qo'shilgan mahsulot obyekti.
   */
  async addProduct(productData) {
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      imageFileId,
      stock,
      discountPrice,
      isDiscount,
    } = productData;

    // imageUrl null/undefined/bo'sh string bo'lsa, default rasm URL'ini ishlatish
    const finalImageUrl =
      imageUrl || "https://via.placeholder.com/300x200?text=No+Image";

    // Kategoriya ID bor-yo'qligini tekshirish
    let finalCategoryId = categoryId;
    let needsCategorization = false;
    let suggestedCategory = "";
    let tags = [];

    if (!categoryId) {
      // Kategoriya yo'q bo'lsa, AI taklif qiladi
      const aiSuggestion = getAICategorySuggestion({ name, description });
      suggestedCategory = aiSuggestion.category;
      needsCategorization = true;
    } else if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid category ID provided.");
    }

    // AI yordamida tag/xeshteg ajratish
    tags = suggestTags(name, description);

    const newProduct = new Product({
      categoryId: finalCategoryId,
      name,
      description,
      price,
      imageUrl: finalImageUrl,
      imageFileId: imageFileId || "",
      stock,
      discountPrice: discountPrice || null,
      isDiscount: isDiscount || false,
      needsCategorization,
      suggestedCategory,
      tags,
    });
    await newProduct.save();
    return newProduct;
  }

  /**
   * Barcha mahsulotlarni qaytaradi (faqat ma'lum kategoriyada bo'lishi mumkin).
   * @param {string} [categoryId] - Filtr uchun kategoriya IDsi.
   * @returns {Promise<Array>} Mahsulotlar ro'yxati.
   */
  async getAllProducts(categoryId = null) {
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new Error("Invalid category ID provided.");
      }
      return await Product.find({ categoryId: categoryId })
        .populate("categoryId")
        .sort({ name: 1 });
    }
    return await Product.find().populate("categoryId").sort({ name: 1 });
  }

  /**
   * Berilgan kategoriya ID bo'yicha mahsulotlarni qaytaradi.
   * @param {string} categoryId
   * @returns {Promise<Array>}
   */
  async getProductsByCategoryId(categoryId) {
    if (!categoryId) throw new Error("Category ID is required");
    return await this.getAllProducts(categoryId);
  }

  /**
   * ID bo'yicha mahsulotni qaytaradi.
   * @param {string} productId - Mahsulot IDsi.
   * @returns {Promise<Object|null>} Mahsulot obyekti yoki null.
   */
  async getProduct(productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }
    return await Product.findById(productId).populate("categoryId");
  }

  /**
   * Mahsulot nomi yoki tavsifi bo'yicha AI + 'fuzzy' qidiruv (AI ishlamasa Fuse.js bilan).
   * @param {string} query - Qidiruv so'zi.
   * @returns {Promise<Array>} Mos keladigan mahsulotlar ro'yxati.
   */
  async searchProducts(query) {
    // 1. AI qidiruv (masalan, OpenAI)
    try {
      // AI API chaqiruvi (misol uchun OpenAI, sizning API kalitingiz kerak)
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (openaiApiKey) {
        const allProducts = await Product.find().populate("categoryId");
        const productList = allProducts.map(
          (p) => `${p.name} - ${p.description || ""}`
        );
        const prompt = `Mahsulotlar ro'yxatidan quyidagi so'rovga eng moslarini topib, faqat nomlarini vergul bilan ajratib qaytar: "${query}". Mahsulotlar: ${productList.join(
          "; "
        )}`;
        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "Siz mahsulot qidiruvchisiz." },
              { role: "user", content: prompt },
            ],
            max_tokens: 200,
            temperature: 0.2,
          },
          {
            headers: {
              Authorization: `Bearer ${openaiApiKey}`,
              "Content-Type": "application/json",
            },
          }
        );
        const aiResult = response.data.choices[0].message.content;
        // AI natijasidan nomlarni ajratib olish
        const aiNames = aiResult
          .split(",")
          .map((n) => n.trim().toLowerCase())
          .filter((n) => n.length > 0);
        // Mahsulotlarni nomi bo‘yicha filter qilamiz
        const aiProducts = allProducts.filter((p) =>
          aiNames.some((n) => p.name.toLowerCase().includes(n))
        );
        if (aiProducts.length > 0) {
          return aiProducts;
        }
      }
    } catch (err) {
      console.error(
        "AI qidiruv ishlamadi, oddiy qidiruvga o‘tamiz:",
        err.message
      );
      // AI ishlamasa, oddiy qidiruvga o‘tamiz
    }
    // 2. Fallback: oddiy Fuse.js qidiruv
    const allProducts = await Product.find().populate("categoryId");
    const options = {
      keys: ["name", "description"],
      threshold: 0.4, // 0 - faqat to‘liq mos, 1 - juda yumshoq
    };
    const fuse = new Fuse(allProducts, options);
    const result = fuse.search(query);
    return result.map((r) => r.item);
  }

  /**
   * Mahsulotni yangilaydi.
   * @param {string} productId - Yangilanadigan mahsulot IDsi.
   * @param {Object} updates - Yangilanadigan maydonlar obyekti.
   * @returns {Promise<Object|null>} Yangilangan mahsulot obyekti yoki null.
   */
  async updateProduct(productId, updates) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }
    return await Product.findByIdAndUpdate(productId, updates, { new: true });
  }

  /**
   * Mahsulotni o'chiradi.
   * @param {string} productId - O'chiriladigan mahsulot IDsi.
   * @returns {Promise<Object|null>} O'chirilgan mahsulot obyekti yoki null.
   */
  async deleteProduct(productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }
    return await Product.findByIdAndDelete(productId);
  }

  /**
   * Mahsulot nomi bo'yicha mahsulotni qaytaradi.
   * @param {string} name - Mahsulot nomi.
   * @returns {Promise<Object|null>} Mahsulot obyekti yoki null.
   */
  async getProductByName(name) {
    if (!name || typeof name !== "string") {
      return null;
    }
    return await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });
  }

  /**
   * Berilgan kategoriyadagi barcha mahsulotlarni o'chiradi.
   * @param {string} categoryId - Mahsulotlari o'chiriladigan kategoriya IDsi.
   * @returns {Promise<Object>} O'chirilgan hujjatlar sonini o'z ichiga olgan natija.
   */
  async deleteProductsByCategory(categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid category ID provided.");
    }
    return await Product.deleteMany({ categoryId: categoryId });
  }

  /**
   * Kategoriyasiz mahsulotlarni qaytaradi.
   * @returns {Promise<Array>} Kategoriyasiz mahsulotlar ro'yxati.
   */
  async getUncategorizedProducts() {
    return await Product.find({
      $or: [
        { categoryId: null },
        { categoryId: { $exists: false } },
        { needsCategorization: true },
      ],
    }).sort({ createdAt: -1 });
  }

  /**
   * Eng ko‘p ishlatilgan xeshteglar (top N)
   * @param {number} limit
   * @returns {Promise<Array<{tag: string, count: number}>>}
   */
  async getTopTags(limit = 5) {
    const pipeline = [
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ];
    const result = await Product.aggregate(pipeline);
    return result.map((r) => ({ tag: r._id, count: r.count }));
  }

  /**
   * Kategoriyasiz mahsulotlar soni
   * @returns {Promise<number>}
   */
  async getUncategorizedProductsCount() {
    return await Product.countDocuments({
      $or: [
        { categoryId: null },
        { categoryId: { $exists: false } },
        { needsCategorization: true },
      ],
    });
  }

  /**
   * Mahsulotga kategoriya belgilash.
   * @param {string} productId - Mahsulot IDsi.
   * @param {string} categoryId - Kategoriya IDsi.
   * @returns {Promise<Object>} Yangilangan mahsulot obyekti.
   */
  async assignCategoryToProduct(productId, categoryId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid category ID provided.");
    }

    return await Product.findByIdAndUpdate(
      productId,
      {
        categoryId: categoryId,
        needsCategorization: false,
        suggestedCategory: "",
        isActive: true, // Kategoriya belgilangandan keyin faol qilish
      },
      { new: true }
    );
  }

  /**
   * Bir nechta mahsulotga kategoriya belgilash (toplu kategoriyalash).
   * @param {Array<string>} productIds - Mahsulot IDlari ro'yxati.
   * @param {string} categoryId - Kategoriya IDsi.
   * @returns {Promise<Object>} Yangilangan mahsulotlar soni.
   */
  async assignCategoryToMultipleProducts(productIds, categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new Error("Invalid category ID provided.");
    }

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      {
        categoryId: categoryId,
        needsCategorization: false,
        suggestedCategory: "",
        isActive: true,
      }
    );

    return result;
  }

  /**
   * ID yo‘q mahsulotlarni bazadan tozalash.
   * @returns {Promise<Object>} O‘chirilgan mahsulotlar soni.
   */
  async deleteInvalidProducts() {
    return await Product.deleteMany({
      $or: [{ _id: { $exists: false } }, { _id: null }],
    });
  }

  /**
   * Ko'rib chiqilishi kerak mahsulotlarni qaytaradi.
   * @param {number} limit - Maksimal soni (default: 50)
   * @returns {Promise<Array>} Ko'rib chiqilishi kerak mahsulotlar ro'yxati.
   */
  async getPendingReviewProducts(limit = 50) {
    return await Product.find({
      isPendingReview: true,
      isApproved: false,
      isRejected: false,
    })
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  /**
   * Ko'rib chiqilishi kerak mahsulotlar sonini qaytaradi.
   * @returns {Promise<number>} Ko'rib chiqilishi kerak mahsulotlar soni.
   */
  async getPendingReviewProductsCount() {
    return await Product.countDocuments({
      isPendingReview: true,
      isApproved: false,
      isRejected: false,
    });
  }

  /**
   * Mahsulotni ko'rib chiqish uchun belgilash.
   * @param {string} productId - Mahsulot IDsi.
   * @returns {Promise<Object>} Yangilangan mahsulot obyekti.
   */
  async markProductForReview(productId) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }

    return await Product.findByIdAndUpdate(
      productId,
      {
        isPendingReview: true,
        isActive: false, // Ko'rib chiqilguncha faol emas
      },
      { new: true }
    );
  }

  /**
   * Mahsulotni tasdiqlash.
   * @param {string} productId - Mahsulot IDsi.
   * @param {string} adminId - Admin Telegram IDsi.
   * @param {string} categoryId - Kategoriya IDsi (ixtiyoriy).
   * @returns {Promise<Object>} Yangilangan mahsulot obyekti.
   */
  async approveProduct(productId, adminId, categoryId = null) {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }

    const updateData = {
      isPendingReview: false,
      isApproved: true,
      isRejected: false,
      isActive: true,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    };

    if (categoryId) {
      updateData.categoryId = categoryId;
      updateData.needsCategorization = false;
    }

    return await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    });
  }

  /**
   * Mahsulotni rad etish.
   * @param {string} productId - Mahsulot IDsi.
   * @param {string} adminId - Admin Telegram IDsi.
   * @param {string} reason - Rad etish sababi.
   * @returns {Promise<Object>} Yangilangan mahsulot obyekti.
   */
  async rejectProduct(productId, adminId, reason = "") {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid product ID provided.");
    }

    return await Product.findByIdAndUpdate(
      productId,
      {
        isPendingReview: false,
        isApproved: false,
        isRejected: true,
        isActive: false,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true }
    );
  }

  /**
   * Kanal postidan mahsulot qo'shish (ko'rib chiqish uchun).
   * @param {Object} productData - Mahsulot ma'lumotlari.
   * @returns {Promise<Object>} Qo'shilgan mahsulot obyekti.
   */
  async addProductFromChannel(productData) {
    const {
      categoryId,
      name,
      description,
      price,
      imageUrl,
      imageFileId,
      stock,
      suggestedCategory,
      tags,
    } = productData;

    const newProduct = new Product({
      categoryId: null, // Avval kategoriyasiz
      name,
      description,
      price,
      imageUrl: imageUrl || "https://via.placeholder.com/300x200?text=No+Image",
      imageFileId: imageFileId || "",
      stock: stock || 1,
      isPendingReview: true, // Ko'rib chiqish uchun
      isActive: false, // Ko'rib chiqilguncha faol emas
      needsCategorization: true,
      suggestedCategory: suggestedCategory || "",
      tags: tags || [],
    });

    await newProduct.save();
    return newProduct;
  }

  /**
   * Jami mahsulotlar sonini oladi.
   * @returns {Promise<number>} - Mahsulotlar soni.
   */
  async getTotalProducts() {
    return await Product.countDocuments({});
  }

  /**
   * Faol mahsulotlar sonini oladi.
   * @returns {Promise<number>} - Faol mahsulotlar soni.
   */
  async getActiveProducts() {
    return await Product.countDocuments({ isActive: true, isApproved: true });
  }

  /**
   * Kutilayotgan mahsulotlar sonini oladi.
   * @returns {Promise<number>} - Kutilayotgan mahsulotlar soni.
   */
  async getPendingProducts() {
    return await Product.countDocuments({
      $or: [{ isPendingReview: true }, { needsCategorization: true }],
    });
  }
}

export default new ProductService();
