import DeliverySettings from "../models/DeliverySettings.js";

class DeliverySettingsRepository {
  async getSettings() {
    let settings = await DeliverySettings.findOne();
    if (!settings) {
      // Agar sozlamalar yo'q bo'lsa, standart sozlamalarni yaratamiz
      settings = new DeliverySettings({
        updatedBy: "system",
        deliveryZones: [
          { name: "Toshkent markazi", price: 5000, estimatedTime: 30 },
          { name: "Toshkent tumani", price: 8000, estimatedTime: 45 },
          { name: "Boshqa tumanlar", price: 12000, estimatedTime: 60 },
        ],
      });
      await settings.save();
    }
    return settings;
  }

  async updateSettings(updateData) {
    let settings = await DeliverySettings.findOne();
    if (!settings) {
      settings = new DeliverySettings(updateData);
    } else {
      Object.assign(settings, updateData);
    }
    return await settings.save();
  }

  async updateDeliveryZones(zones) {
    let settings = await this.getSettings();
    settings.deliveryZones = zones;
    return await settings.save();
  }

  async toggleDeliveryEnabled(isEnabled) {
    let settings = await this.getSettings();
    settings.isDeliveryEnabled = isEnabled;
    return await settings.save();
  }

  async updateBasePrice(price) {
    let settings = await this.getSettings();
    settings.baseDeliveryPrice = price;
    return await settings.save();
  }

  async updateFreeDeliveryThreshold(threshold) {
    let settings = await this.getSettings();
    settings.freeDeliveryThreshold = threshold;
    return await settings.save();
  }

  async updateWorkingHours(start, end) {
    let settings = await this.getSettings();
    settings.workingHours = { start, end };
    return await settings.save();
  }

  async calculateDeliveryPrice(orderAmount, zoneName = null) {
    const settings = await this.getSettings();

    // Bepul dastavka shartini tekshirish
    if (orderAmount >= settings.freeDeliveryThreshold) {
      return 0;
    }

    // Zona bo'yicha narx
    if (zoneName) {
      const zone = settings.deliveryZones.find((z) => z.name === zoneName);
      if (zone) {
        return zone.price;
      }
    }

    // Standart narx
    return settings.baseDeliveryPrice;
  }

  async getEstimatedDeliveryTime(zoneName = null) {
    const settings = await this.getSettings();

    if (zoneName) {
      const zone = settings.deliveryZones.find((z) => z.name === zoneName);
      if (zone) {
        return zone.estimatedTime;
      }
    }

    return settings.deliveryTimeEstimate;
  }
}

export { DeliverySettingsRepository };
