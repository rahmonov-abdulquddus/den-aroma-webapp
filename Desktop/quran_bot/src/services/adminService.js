import { AdminRepository } from "../db/repositories/adminRepository.js";

class AdminService {
  constructor() {
    this.adminRepository = new AdminRepository();
  }

  async createAdmin(adminData) {
    try {
      // Admin allaqachon mavjudligini tekshirish
      const existingAdmin = await this.adminRepository.getAdminByTelegramId(
        adminData.telegramId
      );
      if (existingAdmin) {
        throw new Error("Bu admin allaqachon mavjud!");
      }

      return await this.adminRepository.createAdmin(adminData);
    } catch (error) {
      throw error;
    }
  }

  async getAdminByTelegramId(telegramId) {
    return await this.adminRepository.getAdminByTelegramId(telegramId);
  }

  async getAllAdmins() {
    return await this.adminRepository.getAllAdmins();
  }

  async getAdminsCount() {
    return await this.adminRepository.getAdminsCount();
  }

  async updateAdmin(telegramId, updateData) {
    return await this.adminRepository.updateAdmin(telegramId, updateData);
  }

  async deleteAdmin(telegramId) {
    return await this.adminRepository.deleteAdmin(telegramId);
  }

  async isAdmin(telegramId) {
    const admin = await this.adminRepository.getAdminByTelegramId(telegramId);
    return admin && admin.isActive;
  }

  async isSuperAdmin(telegramId) {
    const admin = await this.adminRepository.getAdminByTelegramId(telegramId);
    return admin && admin.isActive && admin.role === "super_admin";
  }

  async hasPermission(telegramId, permission) {
    const admin = await this.adminRepository.getAdminByTelegramId(telegramId);
    if (!admin || !admin.isActive) return false;

    if (admin.role === "super_admin") return true;

    return admin.permissions[permission] || false;
  }

  async updateLastActivity(telegramId) {
    return await this.adminRepository.updateLastActivity(telegramId);
  }

  async getAdminStats() {
    const totalAdmins = await this.adminRepository.getAdminsCount();
    const superAdmins = await this.adminRepository.getSuperAdmins();

    return {
      totalAdmins,
      superAdminsCount: superAdmins.length,
      regularAdminsCount: totalAdmins - superAdmins.length,
    };
  }
}

export default new AdminService();
