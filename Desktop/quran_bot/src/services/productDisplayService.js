// src/services/productDisplayService.js

import productService from "./productService.js";
import categoryService from "./categoryService.js";

class ProductDisplayService {
  /**
   * Mahsulotni to'liq ko'rsatish uchun ma'lumotlarni tayyorlash
   * @param {string} productId - Mahsulot IDsi
   * @returns {Promise<Object>} Mahsulot ma'lumotlari
   */
  async getProductForDisplay(productId) {
    const product = await productService.getProduct(productId);

    if (!product) {
      throw new Error("Mahsulot topilmadi");
    }

    // Kategoriya ma'lumotini olish
    let categoryName = "Kategoriyasiz";
    if (product.categoryId) {
      const category = await categoryService.getCategoryById(
        product.categoryId
      );
      if (category) {
        categoryName = category.name;
      }
    }

    return {
      ...product.toObject(),
      categoryName,
      formattedPrice: this.formatPrice(product.price),
      formattedDiscountPrice: product.discountPrice
        ? this.formatPrice(product.discountPrice)
        : null,
      hasDiscount: product.isDiscount && product.discountPrice,
      stockStatus: this.getStockStatus(product.stock),
    };
  }

  /**
   * Kategoriyadagi mahsulotlarni sahifalab olish
   * @param {string} categoryId - Kategoriya IDsi
   * @param {number} page - Sahifa raqami
   * @param {number} limit - Sahifadagi mahsulotlar soni
   * @returns {Promise<Object>} Mahsulotlar va sahifa ma'lumotlari
   */
  async getProductsByCategory(categoryId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let products,
      total,
      categoryName = "Kategoriya";

    if (categoryId === "all") {
      products = await productService.getAllProducts();
      total = products.length;
      products = products.slice(skip, skip + limit);
    } else {
      products = await productService.getProductsByCategoryId(categoryId);
      total = products.length;
      products = products.slice(skip, skip + limit);

      // Kategoriya nomini olish
      if (products.length > 0 && products[0].categoryId) {
        const category = await categoryService.getCategoryById(
          products[0].categoryId
        );
        if (category) {
          categoryName = category.name;
        }
      }
    }

    const totalPages = Math.ceil(total / limit);

    return {
      products: products.map((product) => ({
        ...product.toObject(),
        formattedPrice: this.formatPrice(product.price),
        categoryName: categoryName,
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Mahsulot qidiruv natijalarini tayyorlash
   * @param {string} query - Qidiruv so'zi
   * @param {number} limit - Natijalar soni
   * @returns {Promise<Array>} Qidiruv natijalari
   */
  async searchProductsForDisplay(query, limit = 10) {
    const products = await productService.searchProducts(query);

    return products.slice(0, limit).map((product) => ({
      ...product.toObject(),
      formattedPrice: this.formatPrice(product.price),
    }));
  }

  /**
   * Eng yangi mahsulotlarni olish
   * @param {number} limit - Mahsulotlar soni
   * @returns {Promise<Array>} Yangi mahsulotlar
   */
  async getLatestProducts(limit = 10) {
    const allProducts = await productService.getAllProducts();

    return allProducts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((product) => ({
        ...product.toObject(),
        formattedPrice: this.formatPrice(product.price),
      }));
  }

  /**
   * Chegirmali mahsulotlarni olish
   * @param {number} limit - Mahsulotlar soni
   * @returns {Promise<Array>} Chegirmali mahsulotlar
   */
  async getDiscountedProducts(limit = 10) {
    const allProducts = await productService.getAllProducts();

    return allProducts
      .filter((product) => product.isDiscount && product.discountPrice)
      .slice(0, limit)
      .map((product) => ({
        ...product.toObject(),
        formattedPrice: this.formatPrice(product.price),
        formattedDiscountPrice: this.formatPrice(product.discountPrice),
        discountPercent: Math.round(
          ((product.price - product.discountPrice) / product.price) * 100
        ),
      }));
  }

  /**
   * Narxni formatlash
   * @param {number} price - Narx
   * @returns {string} Formatlangan narx
   */
  formatPrice(price) {
    return new Intl.NumberFormat("uz-UZ").format(price) + " so'm";
  }

  /**
   * Mahsulot mavjudligini aniqlash
   * @param {number} stock - Mahsulot soni
   * @returns {string} Mavjudlik holati
   */
  getStockStatus(stock) {
    if (stock <= 0) {
      return "❌ Mavjud emas";
    } else if (stock <= 5) {
      return `⚠️ Faqat ${stock} ta qoldi`;
    } else {
      return "✅ Mavjud";
    }
  }

  /**
   * Mahsulotni Telegram xabar formatida tayyorlash
   * @param {Object} product - Mahsulot obyekti
   * @returns {string} Formatlangan xabar
   */
  formatProductMessage(product) {
    let message = `📦 **${product.name}**\n\n`;

    if (product.description) {
      message += `📝 ${product.description}\n\n`;
    }

    if (product.hasDiscount) {
      message += `💰 Narxi: ~~${product.formattedPrice}~~\n`;
      message += `🔥 Chegirma: ${product.formattedDiscountPrice} (-${product.discountPercent}%)\n`;
    } else {
      message += `💰 Narxi: ${product.formattedPrice}\n`;
    }

    message += `📂 Kategoriya: ${product.categoryName}\n`;
    message += `📊 ${product.stockStatus}\n`;

    if (product.tags && product.tags.length > 0) {
      message += `🏷️ #${product.tags.join(" #")}`;
    }

    return message;
  }
}

export default new ProductDisplayService();
