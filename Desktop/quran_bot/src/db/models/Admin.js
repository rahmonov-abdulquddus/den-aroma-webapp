import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    default: "",
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["super_admin", "admin", "moderator"],
    default: "admin",
  },
  permissions: {
    manageAdmins: { type: Boolean, default: false },
    manageDelivery: { type: Boolean, default: false },
    manageProducts: { type: Boolean, default: true },
    manageOrders: { type: Boolean, default: true },
    viewStatistics: { type: Boolean, default: true },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  addedBy: {
    type: String, // Super admin Telegram ID
    default: "",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Admin", AdminSchema);
