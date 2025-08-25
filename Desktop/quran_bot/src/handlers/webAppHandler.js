const Order = require("../db/models/Order");
const Product = require("../db/models/Product");
const Category = require("../db/models/Category");
const { logAdminAction } = require("../utils/adminUtils");

// Web App'dan kelgan ma'lumotlarni qayta ishlash
async function handleWebAppData(msg) {
  try {
    const webAppData = msg.web_app_data;
    if (!webAppData || !webAppData.data) {
      return bot.sendMessage(msg.from.id, "❌ Web App'dan ma'lumot olinmadi!");
    }

    // JSON ma'lumotlarni parse qilish
    let data;
    try {
      data = JSON.parse(webAppData.data);
    } catch (error) {
      console.error("Web App ma'lumotlarini parse qilishda xatolik:", error);
      return bot.sendMessage(msg.from.id, "❌ Ma'lumotlar noto'g'ri formatda!");
    }

    // Admin buyruqlarini tekshirish
    if (data.action === "admin_action") {
      return await handleAdminAction(msg.from.id, data);
    }

    // Oddiy buyurtma ma'lumotlarini tekshirish
    if (!validateOrderData(data)) {
      return bot.sendMessage(
        msg.from.id,
        "❌ Buyurtma ma'lumotlari to'liq emas!"
      );
    }

    // Buyurtmani yaratish
    const order = await createOrder(msg.from.id, data);

    if (order) {
      // Foydalanuvchiga tasdiq xabari
      await sendOrderConfirmation(msg.from.id, order);

      // Admin'larga xabar yuborish
      await notifyAdmins(order);

      // Log qilish
      logAdminAction("system", "order_created", {
        orderId: order._id,
        userId: msg.from.id,
      });

      return true;
    }
  } catch (error) {
    console.error("Web App ma'lumotlarini qayta ishlashda xatolik:", error);
    bot.sendMessage(msg.from.id, "❌ Buyurtma yaratishda xatolik yuz berdi!");
    return false;
  }
}

// Admin buyruqlarini qayta ishlash
async function handleAdminAction(adminId, data) {
  try {
    switch (data.command) {
      case "add_product":
        return await addProduct(adminId, data.productData);

      case "edit_product":
        return await editProduct(adminId, data.productId, data.productData);

      case "delete_product":
        return await deleteProduct(adminId, data.productId);

      case "add_category":
        return await addCategory(adminId, data.categoryData);

      case "edit_category":
        return await editCategory(adminId, data.categoryId, data.categoryData);

            case "delete_category":
        return await deleteCategory(adminId, data.categoryId);
      
      case "approve_product":
        return await approveProduct(adminId, data.productId);
      
      case "reject_product":
        return await rejectProduct(adminId, data.productId, data.reason);
      
      case "update_pending_product":
        return await updatePendingProduct(adminId, data.productId, data.productData);
      
      case "get_products":
        return await getProducts(adminId, data.filters);
      
      case "get_categories":
        return await getCategories(adminId);

      default:
        return { success: false, message: "Noma'lum buyruq" };
    }
  } catch (error) {
    console.error("Admin buyrug'ini qayta ishlashda xatolik:", error);
    return { success: false, message: "Xatolik yuz berdi" };
  }
}

// Mahsulot qo'shish
async function addProduct(adminId, productData) {
  try {
    const product = new Product({
      ...productData,
      createdBy: adminId,
      source: "manual",
      isActive: true,
    });

    await product.save();

    logAdminAction(adminId, "product_added", { productId: product._id });

    return {
      success: true,
      message: "Mahsulot muvaffaqiyatli qo'shildi",
      productId: product._id,
    };
  } catch (error) {
    console.error("Mahsulot qo'shishda xatolik:", error);
    return { success: false, message: "Mahsulot qo'shishda xatolik" };
  }
}

// Mahsulotni tahrirlash
async function editProduct(adminId, productId, productData) {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { ...productData, updatedBy: adminId, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return { success: false, message: "Mahsulot topilmadi" };
    }

    logAdminAction(adminId, "product_edited", { productId });

    return {
      success: true,
      message: "Mahsulot muvaffaqiyatli yangilandi",
    };
  } catch (error) {
    console.error("Mahsulotni tahrirlashda xatolik:", error);
    return { success: false, message: "Mahsulotni tahrirlashda xatolik" };
  }
}

// Mahsulotni o'chirish
async function deleteProduct(adminId, productId) {
  try {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      return { success: false, message: "Mahsulot topilmadi" };
    }

    logAdminAction(adminId, "product_deleted", { productId });

    return {
      success: true,
      message: "Mahsulot muvaffaqiyatli o'chirildi",
    };
  } catch (error) {
    console.error("Mahsulotni o'chirishda xatolik:", error);
    return { success: false, message: "Mahsulotni o'chirishda xatolik" };
  }
}

// Kategoriya qo'shish
async function addCategory(adminId, categoryData) {
  try {
    const category = new Category({
      ...categoryData,
      createdBy: adminId,
    });

    await category.save();

    logAdminAction(adminId, "category_added", { categoryId: category._id });

    return {
      success: true,
      message: "Kategoriya muvaffaqiyatli qo'shildi",
      categoryId: category._id,
    };
  } catch (error) {
    console.error("Kategoriya qo'shishda xatolik:", error);
    return { success: false, message: "Kategoriya qo'shishda xatolik" };
  }
}

// Kategoriyani tahrirlash
async function editCategory(adminId, categoryId, categoryData) {
  try {
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { ...categoryData, updatedBy: adminId, updatedAt: new Date() },
      { new: true }
    );

    if (!category) {
      return { success: false, message: "Kategoriya topilmadi" };
    }

    logAdminAction(adminId, "category_edited", { categoryId });

    return {
      success: true,
      message: "Kategoriya muvaffaqiyatli yangilandi",
    };
  } catch (error) {
    console.error("Kategoriyani tahrirlashda xatolik:", error);
    return { success: false, message: "Kategoriyani tahrirlashda xatolik" };
  }
}

// Mahsulotni tasdiqlash
async function approveProduct(adminId, productId) {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { 
        needsReview: false,
        isActive: true,
        approvedBy: adminId,
        approvedAt: new Date()
      },
      { new: true }
    );
    
    if (!product) {
      return { success: false, message: "Mahsulot topilmadi" };
    }
    
    logAdminAction(adminId, "product_approved", { productId });
    
    return {
      success: true,
      message: "Mahsulot muvaffaqiyatli tasdiqlandi va Web App'ga qo'shildi!",
    };
  } catch (error) {
    console.error("Mahsulotni tasdiqlashda xatolik:", error);
    return { success: false, message: "Mahsulotni tasdiqlashda xatolik yuz berdi" };
  }
}

// Mahsulotni rad etish
async function rejectProduct(adminId, productId, reason) {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { 
        needsReview: false,
        isActive: false,
        rejectedBy: adminId,
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    );
    
    if (!product) {
      return { success: false, message: "Mahsulot topilmadi" };
    }
    
    logAdminAction(adminId, "product_rejected", { productId, reason });
    
    return {
      success: true,
      message: "Mahsulot rad etildi!",
    };
  } catch (error) {
    console.error("Mahsulotni rad etishda xatolik:", error);
    return { success: false, message: "Mahsulotni rad etishda xatolik yuz berdi" };
  }
}

// Ko'rib chiqilishi kerak mahsulotni yangilash va tasdiqlash
async function updatePendingProduct(adminId, productId, productData) {
  try {
    const product = await Product.findByIdAndUpdate(
      productId,
      { 
        ...productData,
        needsReview: false,
        isActive: true,
        approvedBy: adminId,
        approvedAt: new Date(),
        updatedBy: adminId,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!product) {
      return { success: false, message: "Mahsulotni tasdiqlashda xatolik yuz berdi" };
    }
    
    logAdminAction(adminId, "pending_product_updated", { productId });
    
    return {
      success: true,
      message: "Mahsulot muvaffaqiyatli yangilandi va tasdiqlandi!",
    };
  } catch (error) {
    console.error("Ko'rib chiqilishi kerak mahsulotni yangilashda xatolik:", error);
    return { success: false, message: "Mahsulotni yangilashda xatolik yuz berdi" };
  }
}

// Kategoriyani o'chirish
async function deleteCategory(adminId, categoryId) {
  try {
    // Kategoriyada mahsulotlar bor-yo'qligini tekshirish
    const productsCount = await Product.countDocuments({ categoryId });

    if (productsCount > 0) {
      return {
        success: false,
        message: `Bu kategoriyada ${productsCount} ta mahsulot bor. Avval ularni o'chiring yoki boshqa kategoriyaga ko'chiring.`,
      };
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      return { success: false, message: "Kategoriya topilmadi" };
    }

    logAdminAction(adminId, "category_deleted", { categoryId });

    return {
      success: true,
      message: "Kategoriya muvaffaqiyatli o'chirildi",
    };
  } catch (error) {
    console.error("Kategoriyani o'chirishda xatolik:", error);
    return { success: false, message: "Kategoriyani o'chirishda xatolik" };
  }
}

// Mahsulotlarni olish
async function getProducts(adminId, filters = {}) {
  try {
    let query = {};

    if (filters.categoryId) query.categoryId = filters.categoryId;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
      ];
    }

    const products = await Product.find(query)
      .populate("categoryId")
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50);

    return {
      success: true,
      products: products,
    };
  } catch (error) {
    console.error("Mahsulotlarni olishda xatolik:", error);
    return { success: false, message: "Mahsulotlarni olishda xatolik" };
  }
}

// Kategoriyalarni olish
async function getCategories(adminId) {
  try {
    const categories = await Category.find().sort({ name: 1 });

    return {
      success: true,
      categories: categories,
    };
  } catch (error) {
    console.error("Kategoriyalarni olishda xatolik:", error);
    return { success: false, message: "Kategoriyalarni olishda xatolik" };
  }
}

// Buyurtma ma'lumotlarini tekshirish
function validateOrderData(data) {
  const requiredFields = [
    "products",
    "totalAmount",
    "deliveryAddress",
    "phone",
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Yetishmayotgan maydon: ${field}`);
      return false;
    }
  }

  if (!Array.isArray(data.products) || data.products.length === 0) {
    console.error("Mahsulotlar ro'yxati bo'sh!");
    return false;
  }

  if (data.totalAmount <= 0) {
    console.error("Buyurtma summasi noto'g'ri!");
    return false;
  }

  return true;
}

// Buyurtmani yaratish
async function createOrder(userId, orderData) {
  try {
    // Foydalanuvchi ma'lumotlarini olish
    const userInfo = await getUserInfo(userId);

    // Buyurtma elementlarini tayyorlash
    const orderItems = orderData.products.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      total: item.price * item.quantity,
    }));

    // Buyurtmani yaratish
    const order = new Order({
      userId: userId.toString(),
      userInfo: {
        firstName: userInfo.firstName || "Foydalanuvchi",
        lastName: userInfo.lastName || "",
        phone: orderData.phone,
        telegramUsername: userInfo.username || "",
      },
      items: orderItems,
      totalAmount: orderData.totalAmount,
      deliveryAddress: {
        city: orderData.deliveryAddress.city || "Toshkent",
        district: orderData.deliveryAddress.district || "",
        street: orderData.deliveryAddress.street || "",
        house: orderData.deliveryAddress.house || "",
        apartment: orderData.deliveryAddress.apartment || "",
        landmark: orderData.deliveryAddress.landmark || "",
      },
      deliveryInfo: {
        method: "delivery",
        cost: 0, // Bepul yetkazib berish
        estimatedTime: "2-3 soat",
      },
      payment: {
        method: "cash",
        status: "pending",
      },
      status: "pending",
      notes: {
        customer: orderData.notes || "",
        admin: "",
      },
    });

    await order.save();

    // Mahsulot ko'rishlarini yangilash
    await updateProductViews(orderData.products);

    return order;
  } catch (error) {
    console.error("Buyurtma yaratishda xatolik:", error);
    throw error;
  }
}

// Foydalanuvchi ma'lumotlarini olish
async function getUserInfo(userId) {
  try {
    // Telegram API orqali foydalanuvchi ma'lumotlarini olish
    const user = await bot.getChat(userId);

    return {
      firstName: user.first_name || "",
      lastName: user.last_name || "",
      username: user.username || "",
    };
  } catch (error) {
    console.error("Foydalanuvchi ma'lumotlarini olishda xatolik:", error);
    return {
      firstName: "Foydalanuvchi",
      lastName: "",
      username: "",
    };
  }
}

// Mahsulot ko'rishlarini yangilash
async function updateProductViews(products) {
  try {
    for (const product of products) {
      await Product.findByIdAndUpdate(product.id, { $inc: { views: 1 } });
    }
  } catch (error) {
    console.error("Mahsulot ko'rishlarini yangilashda xatolik:", error);
  }
}

// Foydalanuvchiga buyurtma tasdiqini yuborish
async function sendOrderConfirmation(userId, order) {
  try {
    const message = `
✅ *Buyurtma muvaffaqiyatli qabul qilindi!*

📦 *Buyurtma raqami:* ${order.orderNumber}
💰 *Jami summa:* ${order.totalAmount.toLocaleString()} so'm
📍 *Yetkazib berish manzili:* ${order.deliveryAddress.city}
📱 *Telefon:* ${order.userInfo.phone}

🚚 *Yetkazib berish vaqti:* ${order.deliveryInfo.estimatedTime}
💳 *To'lov usuli:* Naqd pul bilan

Buyurtmangiz tekshirilmoqda. Tez orada siz bilan bog'lanamiz!
    `;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "📋 Buyurtma ma'lumotlari",
            callback_data: `order_details_${order._id}`,
          },
          {
            text: "❌ Bekor qilish",
            callback_data: `cancel_order_${order._id}`,
          },
        ],
      ],
    };

    await bot.sendMessage(userId, message, {
      reply_markup: keyboard,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error("Buyurtma tasdiqini yuborishda xatolik:", error);
  }
}

// Admin'larga xabar yuborish
async function notifyAdmins(order) {
  try {
    const config = require("../config");
    const adminIds = [config.adminId, ...(config.adminIds || [])];

    const message = `
🆕 *Yangi buyurtma!*

📦 *Buyurtma raqami:* ${order.orderNumber}
👤 *Foydalanuvchi:* ${order.userInfo.firstName} ${order.userInfo.lastName}
📱 *Telefon:* ${order.userInfo.phone}
💰 *Summa:* ${order.totalAmount.toLocaleString()} so'm
📍 *Manzil:* ${order.deliveryAddress.city}
    `;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: "✅ Tasdiqlash",
            callback_data: `confirm_order_${order._id}`,
          },
          { text: "❌ Rad etish", callback_data: `reject_order_${order._id}` },
        ],
        [{ text: "📋 Batafsil", callback_data: `order_details_${order._id}` }],
      ],
    };

    for (const adminId of adminIds) {
      try {
        await bot.sendMessage(adminId, message, {
          reply_markup: keyboard,
          parse_mode: "Markdown",
        });
      } catch (error) {
        console.error(`Admin ${adminId} ga xabar yuborishda xatolik:`, error);
      }
    }
  } catch (error) {
    console.error("Admin'larga xabar yuborishda xatolik:", error);
  }
}

// Buyurtma ma'lumotlarini ko'rsatish
async function showOrderDetails(userId, orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return bot.sendMessage(userId, "❌ Buyurtma topilmadi!");
    }

    const itemsList = order.items
      .map(
        (item) =>
          `• ${item.name} x${
            item.quantity
          } = ${item.total.toLocaleString()} so'm`
      )
      .join("\n");

    const message = `
📋 *Buyurtma ma'lumotlari*

📦 *Buyurtma raqami:* ${order.orderNumber}
📅 *Sana:* ${order.createdAt.toLocaleDateString("uz-UZ")}
⏰ *Vaqt:* ${order.createdAt.toLocaleTimeString("uz-UZ")}
👤 *Foydalanuvchi:* ${order.userInfo.firstName} ${order.userInfo.lastName}
📱 *Telefon:* ${order.userInfo.phone}

🛍️ *Mahsulotlar:*
${itemsList}

💰 *Jami summa:* ${order.totalAmount.toLocaleString()} so'm
📍 *Manzil:* ${order.deliveryAddress.city}
🚚 *Status:* ${getStatusText(order.status)}
    `;

    await bot.sendMessage(userId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Buyurtma ma'lumotlarini ko'rsatishda xatolik:", error);
    bot.sendMessage(userId, "❌ Ma'lumotlarni olishda xatolik!");
  }
}

// Status matnini olish
function getStatusText(status) {
  const statusMap = {
    pending: "⏳ Kutilmoqda",
    confirmed: "✅ Tasdiqlandi",
    preparing: "👨‍🍳 Tayyorlanmoqda",
    delivering: "🚚 Yetkazilmoqda",
    delivered: "🎉 Yetkazildi",
    cancelled: "❌ Bekor qilindi",
  };

  return statusMap[status] || status;
}

// Buyurtmani bekor qilish
async function cancelOrder(userId, orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return bot.sendMessage(userId, "❌ Buyurtma topilmadi!");
    }

    if (order.userId !== userId.toString()) {
      return bot.sendMessage(userId, "❌ Bu buyurtmani bekor qila olmaysiz!");
    }

    if (order.status !== "pending") {
      return bot.sendMessage(
        userId,
        "❌ Faqat kutilayotgan buyurtmani bekor qilish mumkin!"
      );
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = "Foydalanuvchi tomonidan bekor qilindi";

    await order.save();

    bot.sendMessage(userId, "✅ Buyurtma bekor qilindi!");

    // Admin'larga xabar
    await notifyOrderCancellation(order);
  } catch (error) {
    console.error("Buyurtmani bekor qilishda xatolik:", error);
    bot.sendMessage(userId, "❌ Buyurtmani bekor qilishda xatolik!");
  }
}

// Buyurtma bekor qilish haqida admin'larni xabardor qilish
async function notifyOrderCancellation(order) {
  try {
    const config = require("../config");
    const adminIds = [config.adminId, ...(config.adminIds || [])];

    const message = `
❌ *Buyurtma bekor qilindi*

📦 *Buyurtma raqami:* ${order.orderNumber}
👤 *Foydalanuvchi:* ${order.userInfo.firstName} ${order.userInfo.lastName}
💰 *Summa:* ${order.totalAmount.toLocaleString()} so'm
📅 *Bekor qilingan sana:* ${order.cancelledAt.toLocaleDateString("uz-UZ")}
    `;

    for (const adminId of adminIds) {
      try {
        await bot.sendMessage(adminId, message, { parse_mode: "Markdown" });
      } catch (error) {
        console.error(`Admin ${adminId} ga xabar yuborishda xatolik:`, error);
      }
    }
  } catch (error) {
    console.error(
      "Admin'larga bekor qilish haqida xabar yuborishda xatolik:",
      error
    );
  }
}

module.exports = {
  handleWebAppData,
  createOrder,
  showOrderDetails,
  cancelOrder,
  validateOrderData,
};
