import { DeliveryPersonRepository } from "../db/repositories/deliveryPersonRepository.js";
import {
  setupDeliveryCommands,
  removeDeliveryCommands,
} from "../handlers/commandHandler.js";

class DeliveryPersonService {
  constructor() {
    this.deliveryPersonRepository = new DeliveryPersonRepository();
  }

  async createDeliveryPerson(deliveryData, bot = null) {
    try {
      // Dastavchi allaqachon mavjudligini tekshirish
      const existingDelivery =
        await this.deliveryPersonRepository.getDeliveryPersonByTelegramId(
          deliveryData.telegramId
        );
      if (existingDelivery) {
        throw new Error("Bu dastavchi allaqachon mavjud!");
      }

      const newDeliveryPerson =
        await this.deliveryPersonRepository.createDeliveryPerson(deliveryData);

      // Dastavchik buyruqlarini o'rnatish
      if (bot) {
        try {
          await setupDeliveryCommands(bot, deliveryData.telegramId);
        } catch (error) {
          console.error("Dastavchik buyruqlarini o'rnatishda xato:", error);
        }
      }

      return newDeliveryPerson;
    } catch (error) {
      throw error;
    }
  }

  async getDeliveryPersonByTelegramId(telegramId) {
    return await this.deliveryPersonRepository.getDeliveryPersonByTelegramId(
      telegramId
    );
  }

  async getAllDeliveryPersons() {
    return await this.deliveryPersonRepository.getAllDeliveryPersons();
  }

  async getOnlineDeliveryPersons() {
    return await this.deliveryPersonRepository.getOnlineDeliveryPersons();
  }

  async getAllActiveDeliveryPersons() {
    return await this.deliveryPersonRepository.getAllActiveDeliveryPersons();
  }

  async getDeliveryPersonsCount() {
    return await this.deliveryPersonRepository.getDeliveryPersonsCount();
  }

  async getOnlineDeliveryPersonsCount() {
    return await this.deliveryPersonRepository.getOnlineDeliveryPersonsCount();
  }

  async updateDeliveryPerson(telegramId, updateData) {
    return await this.deliveryPersonRepository.updateDeliveryPerson(
      telegramId,
      updateData
    );
  }

  async deleteDeliveryPerson(telegramId, bot = null) {
    const deletedPerson =
      await this.deliveryPersonRepository.deleteDeliveryPerson(telegramId);

    // Dastavchik buyruqlarini olib tashlash
    if (bot) {
      try {
        await removeDeliveryCommands(bot, telegramId);
      } catch (error) {
        console.error("Dastavchik buyruqlarini olib tashlashda xato:", error);
      }
    }

    return deletedPerson;
  }

  async isDeliveryPerson(telegramId) {
    const deliveryPerson =
      await this.deliveryPersonRepository.getDeliveryPersonByTelegramId(
        telegramId
      );
    return deliveryPerson && deliveryPerson.isActive;
  }

  async setOnlineStatus(telegramId, isOnline) {
    return await this.deliveryPersonRepository.setOnlineStatus(
      telegramId,
      isOnline
    );
  }

  async updateLocation(telegramId, location) {
    return await this.deliveryPersonRepository.updateLocation(
      telegramId,
      location
    );
  }

  async updateDeliveryStats(telegramId, deliveryTime) {
    return await this.deliveryPersonRepository.updateDeliveryStats(
      telegramId,
      deliveryTime
    );
  }

  async updateRating(telegramId, newRating) {
    return await this.deliveryPersonRepository.updateRating(
      telegramId,
      newRating
    );
  }

  async getDeliveryPersonStats() {
    const totalDeliveryPersons =
      await this.deliveryPersonRepository.getDeliveryPersonsCount();
    const onlineDeliveryPersons =
      await this.deliveryPersonRepository.getOnlineDeliveryPersonsCount();

    return {
      totalDeliveryPersons,
      onlineDeliveryPersons,
      offlineDeliveryPersons: totalDeliveryPersons - onlineDeliveryPersons,
    };
  }

  async getBestDeliveryPerson() {
    const onlineDeliveryPersons =
      await this.deliveryPersonRepository.getOnlineDeliveryPersons();
    if (onlineDeliveryPersons.length === 0) return null;

    // Eng yaxshi reytingga ega va eng ko'p dastavka qilgan dastavchini tanlash
    return onlineDeliveryPersons.sort((a, b) => {
      const aScore = a.rating * 0.7 + (a.completedDeliveries / 100) * 0.3;
      const bScore = b.rating * 0.7 + (b.completedDeliveries / 100) * 0.3;
      return bScore - aScore;
    })[0];
  }

  async assignDeliveryToBestPerson() {
    const bestDeliveryPerson = await this.getBestDeliveryPerson();
    if (!bestDeliveryPerson) {
      throw new Error("Online dastavchilar yo'q!");
    }
    return bestDeliveryPerson;
  }
}

export default new DeliveryPersonService();
