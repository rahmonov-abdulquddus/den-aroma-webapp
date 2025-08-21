import mongoose from "mongoose";

const DeliveryPersonSchema = new mongoose.Schema({
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
  phoneNumber: {
    type: String,
    default: "",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  currentLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    address: { type: String, default: "" },
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 0,
    max: 5,
  },
  totalDeliveries: {
    type: Number,
    default: 0,
  },
  completedDeliveries: {
    type: Number,
    default: 0,
  },
  averageDeliveryTime: {
    type: Number, // daqiqalarda
    default: 0,
  },
  addedBy: {
    type: String, // Admin Telegram ID
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  workingHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "18:00" },
  },
  deliveryZones: [
    {
      type: String, // Zona nomlari
      default: [],
    },
  ],
});

export default mongoose.model("DeliveryPerson", DeliveryPersonSchema);
