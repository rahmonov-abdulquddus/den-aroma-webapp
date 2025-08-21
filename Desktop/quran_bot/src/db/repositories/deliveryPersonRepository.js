import DeliveryPerson from "../models/DeliveryPerson.js";

class DeliveryPersonRepository {
  async createDeliveryPerson(deliveryData) {
    const deliveryPerson = new DeliveryPerson(deliveryData);
    return await deliveryPerson.save();
  }

  async getDeliveryPersonByTelegramId(telegramId) {
    return await DeliveryPerson.findOne({ telegramId });
  }

  async getAllDeliveryPersons() {
    return await DeliveryPerson.find({ isActive: true }).sort({ addedAt: -1 });
  }

  async getAllActiveDeliveryPersons() {
    return await DeliveryPerson.find({ isActive: true }).sort({ rating: -1 });
  }

  async getOnlineDeliveryPersons() {
    return await DeliveryPerson.find({
      isActive: true,
      isOnline: true,
    }).sort({ rating: -1 });
  }

  async getDeliveryPersonsCount() {
    return await DeliveryPerson.countDocuments({ isActive: true });
  }

  async getOnlineDeliveryPersonsCount() {
    return await DeliveryPerson.countDocuments({
      isActive: true,
      isOnline: true,
    });
  }

  async updateDeliveryPerson(telegramId, updateData) {
    return await DeliveryPerson.findOneAndUpdate(
      { telegramId },
      { ...updateData, lastActivity: new Date() },
      { new: true }
    );
  }

  async deleteDeliveryPerson(telegramId) {
    return await DeliveryPerson.findOneAndUpdate(
      { telegramId },
      { isActive: false },
      { new: true }
    );
  }

  async setOnlineStatus(telegramId, isOnline) {
    return await DeliveryPerson.findOneAndUpdate(
      { telegramId },
      { isOnline, lastActivity: new Date() },
      { new: true }
    );
  }

  async updateLocation(telegramId, location) {
    return await DeliveryPerson.findOneAndUpdate(
      { telegramId },
      {
        currentLocation: location,
        lastActivity: new Date(),
      },
      { new: true }
    );
  }

  async updateDeliveryStats(telegramId, deliveryTime) {
    const deliveryPerson = await this.getDeliveryPersonByTelegramId(telegramId);
    if (!deliveryPerson) return null;

    const newTotalDeliveries = deliveryPerson.totalDeliveries + 1;
    const newCompletedDeliveries = deliveryPerson.completedDeliveries + 1;

    // O'rtacha dastavka vaqtini hisoblash
    const totalTime =
      deliveryPerson.averageDeliveryTime * deliveryPerson.totalDeliveries +
      deliveryTime;
    const newAverageTime = Math.round(totalTime / newTotalDeliveries);

    return await DeliveryPerson.findOneAndUpdate(
      { telegramId },
      {
        totalDeliveries: newTotalDeliveries,
        completedDeliveries: newCompletedDeliveries,
        averageDeliveryTime: newAverageTime,
        lastActivity: new Date(),
      },
      { new: true }
    );
  }

  async updateRating(telegramId, newRating) {
    const deliveryPerson = await this.getDeliveryPersonByTelegramId(telegramId);
    if (!deliveryPerson) return null;

    // Reytingni yangilash (oddiy o'rtacha)
    const currentRating = deliveryPerson.rating;
    const newAverageRating =
      Math.round(((currentRating + newRating) / 2) * 10) / 10;

    return await DeliveryPerson.findOneAndUpdate(
      { telegramId },
      {
        rating: newAverageRating,
        lastActivity: new Date(),
      },
      { new: true }
    );
  }
}

export { DeliveryPersonRepository };
