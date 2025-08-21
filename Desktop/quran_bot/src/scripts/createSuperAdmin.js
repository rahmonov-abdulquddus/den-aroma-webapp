// src/scripts/createSuperAdmin.js
// Bu script birinchi super admin'ni yaratish uchun ishlatiladi

import mongoose from "mongoose";
import { config } from "../config/index.js";
import adminService from "../services/adminService.js";

const createSuperAdmin = async () => {
  try {
    // MongoDB ga ulanish
    await mongoose.connect(config.MONGODB_URI);
    console.log("✅ MongoDB ga ulanish muvaffaqiyatli!");

    // Super admin ma'lumotlari
    const superAdminData = {
      telegramId: "5545483477", // Sizning Telegram ID'ngiz
      username: "your_username", // Telegram username'ingiz
      firstName: "Super Admin", // Ismingiz
      lastName: "", // Familiyangiz
      role: "super_admin",
      permissions: {
        manageAdmins: true,
        manageDelivery: true,
        manageProducts: true,
        manageOrders: true,
        viewStatistics: true,
      },
      addedBy: "system",
    };

    // Super admin'ni yaratish
    const superAdmin = await adminService.createAdmin(superAdminData);
    
    console.log("✅ Super admin muvaffaqiyatli yaratildi!");
    console.log("👑 Super Admin ma'lumotlari:");
    console.log(`   ID: ${superAdmin.telegramId}`);
    console.log(`   Ism: ${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log(`   Username: @${superAdmin.username}`);
    console.log(`   Rol: ${superAdmin.role}`);
    console.log(`   Huquqlar: ${Object.keys(superAdmin.permissions).join(", ")}`);

  } catch (error) {
    console.error("❌ Xato yuz berdi:", error.message);
  } finally {
    // MongoDB ulanishini yopish
    await mongoose.disconnect();
    console.log("🔌 MongoDB ulanishi yopildi.");
  }
};

// Scriptni ishga tushirish
createSuperAdmin(); 