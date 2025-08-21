import { DeliverySettingsRepository } from "../db/repositories/deliverySettingsRepository.js";

class DeliverySettingsService {
  constructor() {
    this.deliverySettingsRepository = new DeliverySettingsRepository();
  }

  async getSettings() {
    return await this.deliverySettingsRepository.getSettings();
  }

  async updateSettings(updateData) {
    return await this.deliverySettingsRepository.updateSettings(updateData);
  }

  async updateDeliveryZones(zones) {
    return await this.deliverySettingsRepository.updateDeliveryZones(zones);
  }

  async toggleDeliveryEnabled(isEnabled) {
    return await this.deliverySettingsRepository.toggleDeliveryEnabled(
      isEnabled
    );
  }

  async updateBasePrice(price) {
    return await this.deliverySettingsRepository.updateBasePrice(price);
  }

  async updateFreeDeliveryThreshold(threshold) {
    return await this.deliverySettingsRepository.updateFreeDeliveryThreshold(
      threshold
    );
  }

  async updateWorkingHours(start, end) {
    return await this.deliverySettingsRepository.updateWorkingHours(start, end);
  }

  async calculateDeliveryPrice(orderAmount, zoneName = null) {
    return await this.deliverySettingsRepository.calculateDeliveryPrice(
      orderAmount,
      zoneName
    );
  }

  async getEstimatedDeliveryTime(zoneName = null) {
    return await this.deliverySettingsRepository.getEstimatedDeliveryTime(
      zoneName
    );
  }

  async isDeliveryEnabled() {
    const settings = await this.deliverySettingsRepository.getSettings();
    return settings.isDeliveryEnabled;
  }

  async getDeliveryZones() {
    const settings = await this.deliverySettingsRepository.getSettings();
    return settings.deliveryZones;
  }

  async getWorkingHours() {
    const settings = await this.deliverySettingsRepository.getSettings();
    return settings.workingHours;
  }

  async isWithinWorkingHours() {
    const settings = await this.deliverySettingsRepository.getSettings();
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    const startTime = parseInt(settings.workingHours.start.replace(":", ""));
    const endTime = parseInt(settings.workingHours.end.replace(":", ""));

    return currentTime >= startTime && currentTime <= endTime;
  }

  async getDeliverySettingsSummary() {
    const settings = await this.deliverySettingsRepository.getSettings();

    return {
      isEnabled: settings.isDeliveryEnabled,
      basePrice: settings.baseDeliveryPrice,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      workingHours: settings.workingHours,
      zonesCount: settings.deliveryZones.length,
      autoAssign: settings.autoAssignDelivery,
      requireConfirmation: settings.requireDeliveryConfirmation,
    };
  }
}

export default new DeliverySettingsService();
