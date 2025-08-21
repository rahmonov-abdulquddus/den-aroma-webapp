import mongoose from "mongoose";

const DeliverySettingsSchema = new mongoose.Schema({
  isDeliveryEnabled: {
    type: Boolean,
    default: true,
  },
  baseDeliveryPrice: {
    type: Number,
    default: 5000, // so'm
  },
  freeDeliveryThreshold: {
    type: Number,
    default: 100000, // so'm
  },
  maxDeliveryDistance: {
    type: Number,
    default: 10, // km
  },
  deliveryTimeEstimate: {
    type: Number,
    default: 30, // daqiqada
  },
  workingHours: {
    start: { type: String, default: "09:00" },
    end: { type: String, default: "22:00" },
  },
  deliveryZones: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      estimatedTime: { type: Number, required: true }, // daqiqada
    },
  ],
  autoAssignDelivery: {
    type: Boolean,
    default: true,
  },
  requireDeliveryConfirmation: {
    type: Boolean,
    default: true,
  },
  updatedBy: {
    type: String, // Admin Telegram ID
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("DeliverySettings", DeliverySettingsSchema);
