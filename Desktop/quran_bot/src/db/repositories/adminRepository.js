import Admin from "../models/Admin.js";

class AdminRepository {
  async createAdmin(adminData) {
    const admin = new Admin(adminData);
    return await admin.save();
  }

  async getAdminByTelegramId(telegramId) {
    return await Admin.findOne({ telegramId });
  }

  async getAllAdmins() {
    return await Admin.find({ isActive: true }).sort({ addedAt: -1 });
  }

  async getAdminsCount() {
    return await Admin.countDocuments({ isActive: true });
  }

  async updateAdmin(telegramId, updateData) {
    return await Admin.findOneAndUpdate(
      { telegramId },
      { ...updateData, lastActivity: new Date() },
      { new: true }
    );
  }

  async deleteAdmin(telegramId) {
    return await Admin.findOneAndUpdate(
      { telegramId },
      { isActive: false },
      { new: true }
    );
  }

  async getSuperAdmins() {
    return await Admin.find({ role: "super_admin", isActive: true });
  }

  async updateLastActivity(telegramId) {
    return await Admin.findOneAndUpdate(
      { telegramId },
      { lastActivity: new Date() },
      { new: true }
    );
  }
}

export { AdminRepository };
