// src/utils/backup.js

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import logger from "./logger.js";
import config from "../config/index.js";

const execAsync = promisify(exec);

class DatabaseBackup {
  constructor() {
    this.backupDir = "./backups";
    this.ensureBackupDirectory();
  }

  /**
   * Backup papkasini yaratish
   */
  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * MongoDB backup yaratish
   * @param {string} databaseName - Database nomi
   * @returns {Promise<string>} Backup fayl yo'li
   */
  async createBackup(databaseName = "quran_bot") {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `backup-${databaseName}-${timestamp}.gz`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // MongoDB URI dan host va port ni ajratish
      const mongoUri = config.mongoUri;
      const uriMatch = mongoUri.match(/mongodb:\/\/([^\/]+)/);

      if (!uriMatch) {
        throw new Error("Noto'g'ri MongoDB URI format");
      }

      const hostPort = uriMatch[1];
      const [host, port = "27017"] = hostPort.split(":");

      // mongodump buyrug'ini bajarish
      const command = `mongodump --host ${host} --port ${port} --db ${databaseName} --archive=${backupPath} --gzip`;

      logger.info(`Database backup boshlandi: ${databaseName}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes("WARNING")) {
        throw new Error(`Backup xatosi: ${stderr}`);
      }

      // Backup fayl hajmini tekshirish
      const stats = fs.statSync(backupPath);
      const fileSizeInMB = stats.size / (1024 * 1024);

      logger.info(
        `Database backup muvaffaqiyatli yaratildi: ${backupPath} (${fileSizeInMB.toFixed(
          2
        )} MB)`
      );

      // Eski backup fayllarini tozalash (7 kundan eski)
      await this.cleanOldBackups();

      return backupPath;
    } catch (error) {
      logger.error("Database backup xatosi:", error);
      throw error;
    }
  }

  /**
   * Eski backup fayllarini tozalash
   * @param {number} daysToKeep - Saqlash kerak bo'lgan kunlar
   */
  async cleanOldBackups(daysToKeep = 7) {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = new Date();
      const cutoffDate = new Date(
        now.getTime() - daysToKeep * 24 * 60 * 60 * 1000
      );

      let deletedCount = 0;
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info(`Eski backup fayli o'chirildi: ${file}`);
        }
      }

      if (deletedCount > 0) {
        logger.info(`${deletedCount} ta eski backup fayli tozalandi`);
      }
    } catch (error) {
      logger.error("Eski backup fayllarini tozalashda xato:", error);
    }
  }

  /**
   * Backup faylini restore qilish
   * @param {string} backupPath - Backup fayl yo'li
   * @param {string} databaseName - Database nomi
   */
  async restoreBackup(backupPath, databaseName = "quran_bot") {
    try {
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup fayli topilmadi: ${backupPath}`);
      }

      const mongoUri = config.mongoUri;
      const uriMatch = mongoUri.match(/mongodb:\/\/([^\/]+)/);

      if (!uriMatch) {
        throw new Error("Noto'g'ri MongoDB URI format");
      }

      const hostPort = uriMatch[1];
      const [host, port = "27017"] = hostPort.split(":");

      // mongorestore buyrug'ini bajarish
      const command = `mongorestore --host ${host} --port ${port} --db ${databaseName} --archive=${backupPath} --gzip --drop`;

      logger.info(`Database restore boshlandi: ${databaseName}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes("WARNING")) {
        throw new Error(`Restore xatosi: ${stderr}`);
      }

      logger.info(
        `Database restore muvaffaqiyatli yakunlandi: ${databaseName}`
      );
    } catch (error) {
      logger.error("Database restore xatosi:", error);
      throw error;
    }
  }

  /**
   * Backup ro'yxatini olish
   * @returns {Array} Backup fayllar ro'yxati
   */
  getBackupList() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const backups = [];

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        backups.push({
          name: file,
          path: filePath,
          size: fileSizeInMB,
          createdAt: stats.mtime,
          sizeFormatted: `${fileSizeInMB.toFixed(2)} MB`,
        });
      }

      return backups.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      logger.error("Backup ro'yxatini olishda xato:", error);
      return [];
    }
  }

  /**
   * Avtomatik backup jadvalini o'rnatish
   */
  scheduleBackups() {
    // Har kun soat 2:00 da backup yaratish
    setInterval(async () => {
      const now = new Date();
      if (now.getHours() === 2 && now.getMinutes() === 0) {
        try {
          await this.createBackup();
          logger.info("Avtomatik backup muvaffaqiyatli yaratildi");
        } catch (error) {
          logger.error("Avtomatik backup xatosi:", error);
        }
      }
    }, 60 * 1000); // Har daqiqa tekshirish
  }
}

export default new DatabaseBackup();
