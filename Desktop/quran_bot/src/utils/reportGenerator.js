import PDFDocument from "pdfkit";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

// PDF hisobot yaratish
export const generatePDFReport = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const fileName = `report_${Date.now()}.pdf`;
      const filePath = path.join(process.cwd(), "temp", fileName);

      // Temp papkani yaratish
      if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
        fs.mkdirSync(path.join(process.cwd(), "temp"));
      }

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // PDF sarlavhasi - chiroyli ko'rinish
      doc
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("DO'KON HISOBOTI", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(14)
        .font("Helvetica")
        .text(`Yaratilgan vaqti: ${new Date().toLocaleString("uz-UZ")}`, {
          align: "center",
        });
      doc.moveDown(2);

      // Chiziq chizish
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Foyda statistikasi
      doc.fontSize(20).font("Helvetica-Bold").text("FOYDA STATISTIKASI");
      doc.moveDown();
      doc.fontSize(14).font("Helvetica");
      doc.text(`• Bugun: ${data.profit.today.toLocaleString()} so'm`);
      doc.text(`• Kecha: ${data.profit.yesterday.toLocaleString()} so'm`);
      doc.text(`• Bu hafta: ${data.profit.thisWeek.toLocaleString()} so'm`);
      doc.text(`• Bu oy: ${data.profit.thisMonth.toLocaleString()} so'm`);
      doc.text(`• Bu yil: ${data.profit.thisYear.toLocaleString()} so'm`);
      doc.moveDown(2);

      // Chiziq chizish
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Buyurtma statistikasi
      doc.fontSize(20).font("Helvetica-Bold").text("BUYURTMA STATISTIKASI");
      doc.moveDown();
      doc.fontSize(14).font("Helvetica");
      doc.text(`• Bugun: ${data.orders.today} ta`);
      doc.text(`• Kecha: ${data.orders.yesterday} ta`);
      doc.text(`• Bu hafta: ${data.orders.thisWeek} ta`);
      doc.text(`• Bu oy: ${data.orders.thisMonth} ta`);
      doc.text(`• Bu yil: ${data.orders.thisYear} ta`);
      doc.moveDown(2);

      // Chiziq chizish
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Foydalanuvchilar statistikasi
      doc.fontSize(20).font("Helvetica-Bold").text("FOYDALANUVCHILAR");
      doc.moveDown();
      doc.fontSize(14).font("Helvetica");
      doc.text(`• Bugun: ${data.users.today} ta`);
      doc.text(`• Kecha: ${data.users.yesterday} ta`);
      doc.text(`• Bu hafta: ${data.users.thisWeek} ta`);
      doc.text(`• Bu oy: ${data.users.thisMonth} ta`);
      doc.text(`• Bu yil: ${data.users.thisYear} ta`);
      doc.moveDown(2);

      // Chiziq chizish
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Yakun - chiroyli ko'rinish
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .text("UMUMIY NATIJA", { align: "center" });
      doc.moveDown();
      doc.fontSize(16).font("Helvetica");
      doc.text(`Jami foyda: ${data.profit.thisYear.toLocaleString()} so'm`, {
        align: "center",
      });
      doc.text(`Jami buyurtmalar: ${data.orders.thisYear} ta`, {
        align: "center",
      });
      doc.text(`Jami foydalanuvchilar: ${data.users.thisYear} ta`, {
        align: "center",
      });

      doc.end();

      stream.on("finish", () => {
        resolve({ filePath, fileName });
      });

      stream.on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
};

// Excel hisobot yaratish
export const generateExcelReport = async (data) => {
  try {
    // Foyda statistikasi - chiroyli ko'rinish
    const profitSheet = [
      ["📊 FOYDA STATISTIKASI", "", ""],
      ["", "", ""],
      ["Vaqt oralig'i", "Foyda (so'm)", "O'zgarish (%)"],
      ["Bugun", data.profit.today, "0%"],
      ["Kecha", data.profit.yesterday, "0%"],
      ["Bu hafta", data.profit.thisWeek, "0%"],
      ["Bu oy", data.profit.thisMonth, "0%"],
      ["Bu yil", data.profit.thisYear, "0%"],
      ["", "", ""],
      ["Jami foyda:", data.profit.thisYear, ""],
    ];

    // Buyurtma statistikasi - chiroyli ko'rinish
    const orderSheet = [
      ["📦 BUYURTMA STATISTIKASI", "", ""],
      ["", "", ""],
      ["Vaqt oralig'i", "Buyurtmalar soni", "O'zgarish (%)"],
      ["Bugun", data.orders.today, "0%"],
      ["Kecha", data.orders.yesterday, "0%"],
      ["Bu hafta", data.orders.thisWeek, "0%"],
      ["Bu oy", data.orders.thisMonth, "0%"],
      ["Bu yil", data.orders.thisYear, "0%"],
      ["", "", ""],
      ["Jami buyurtmalar:", data.orders.thisYear, ""],
    ];

    // Foydalanuvchilar statistikasi - chiroyli ko'rinish
    const userSheet = [
      ["👥 FOYDALANUVCHILAR", "", ""],
      ["", "", ""],
      ["Vaqt oralig'i", "Foydalanuvchilar soni", "O'zgarish (%)"],
      ["Bugun", data.users.today, "0%"],
      ["Kecha", data.users.yesterday, "0%"],
      ["Bu hafta", data.users.thisWeek, "0%"],
      ["Bu oy", data.users.thisMonth, "0%"],
      ["Bu yil", data.users.thisYear, "0%"],
      ["", "", ""],
      ["Jami foydalanuvchilar:", data.users.thisYear, ""],
    ];

    // Workbook yaratish
    const workbook = XLSX.utils.book_new();

    // Sheetlarni qo'shish va chiroyli ko'rinish berish
    const profitWS = XLSX.utils.aoa_to_sheet(profitSheet);
    const orderWS = XLSX.utils.aoa_to_sheet(orderSheet);
    const userWS = XLSX.utils.aoa_to_sheet(userSheet);

    // Foyda statistikasi sheet
    XLSX.utils.book_append_sheet(workbook, profitWS, "Foyda statistikasi");
    XLSX.utils.book_append_sheet(workbook, orderWS, "Buyurtma statistikasi");
    XLSX.utils.book_append_sheet(workbook, userWS, "Foydalanuvchilar");

    // Chiroyli ko'rinish uchun stillar
    // Ustun kengliklari
    profitWS["!cols"] = [
      { width: 30 }, // Birinchi ustun
      { width: 25 }, // Ikkinchi ustun
      { width: 20 }, // Uchinchi ustun
    ];

    orderWS["!cols"] = [
      { width: 30 }, // Birinchi ustun
      { width: 25 }, // Ikkinchi ustun
      { width: 20 }, // Uchinchi ustun
    ];

    userWS["!cols"] = [
      { width: 30 }, // Birinchi ustun
      { width: 25 }, // Ikkinchi ustun
      { width: 20 }, // Uchinchi ustun
    ];

    // Satr balandliklari
    profitWS["!rows"] = [
      { hpt: 25 }, // Sarlavha
      { hpt: 15 }, // Bo'sh qator
      { hpt: 20 }, // Ustun sarlavhalari
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 15 }, // Bo'sh qator
      { hpt: 20 }, // Jami
    ];

    orderWS["!rows"] = [
      { hpt: 25 }, // Sarlavha
      { hpt: 15 }, // Bo'sh qator
      { hpt: 20 }, // Ustun sarlavhalari
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 15 }, // Bo'sh qator
      { hpt: 20 }, // Jami
    ];

    userWS["!rows"] = [
      { hpt: 25 }, // Sarlavha
      { hpt: 15 }, // Bo'sh qator
      { hpt: 20 }, // Ustun sarlavhalari
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 18 }, // Ma'lumotlar
      { hpt: 15 }, // Bo'sh qator
      { hpt: 20 }, // Jami
    ];

    // Fayl nomi va yo'li
    const fileName = `report_${Date.now()}.xlsx`;
    const filePath = path.join(process.cwd(), "temp", fileName);

    // Temp papkani yaratish
    if (!fs.existsSync(path.join(process.cwd(), "temp"))) {
      fs.mkdirSync(path.join(process.cwd(), "temp"));
    }

    // Excel faylni saqlash
    XLSX.writeFile(workbook, filePath);

    // Chiroyli ko'rinish uchun qo'shimcha stillar
    try {
      // Har bir sheet uchun stillar
      const sheets = [profitWS, orderWS, userWS];
      sheets.forEach((sheet) => {
        // Sarlavha qatorlari uchun stillar
        if (sheet["A1"]) {
          sheet["A1"].s = {
            font: { bold: true, size: 16, color: { rgb: "2E75B6" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "D9E1F2" } },
            border: {
              top: { style: "thin", color: { rgb: "2E75B6" } },
              bottom: { style: "thin", color: { rgb: "2E75B6" } },
              left: { style: "thin", color: { rgb: "2E75B6" } },
              right: { style: "thin", color: { rgb: "2E75B6" } },
            },
          };
        }

        // Sarlavha chiziqlari (A1:C1)
        if (sheet["B1"]) {
          sheet["B1"].s = {
            font: { bold: true, size: 16, color: { rgb: "2E75B6" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "D9E1F2" } },
            border: {
              top: { style: "thin", color: { rgb: "2E75B6" } },
              bottom: { style: "thin", color: { rgb: "2E75B6" } },
              left: { style: "thin", color: { rgb: "2E75B6" } },
              right: { style: "thin", color: { rgb: "2E75B6" } },
            },
          };
        }
        if (sheet["C1"]) {
          sheet["C1"].s = {
            font: { bold: true, size: 16, color: { rgb: "2E75B6" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "D9E1F2" } },
            border: {
              top: { style: "thin", color: { rgb: "2E75B6" } },
              bottom: { style: "thin", color: { rgb: "2E75B6" } },
              left: { style: "thin", color: { rgb: "2E75B6" } },
              right: { style: "thin", color: { rgb: "2E75B6" } },
            },
          };
        }

        // Ustun sarlavhalari uchun stillar
        if (sheet["A3"]) {
          sheet["A3"].s = {
            font: { bold: true, size: 12, color: { rgb: "1F4E79" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E7E6E6" } },
            border: {
              top: { style: "thin", color: { rgb: "1F4E79" } },
              bottom: { style: "thin", color: { rgb: "1F4E79" } },
              left: { style: "thin", color: { rgb: "1F4E79" } },
              right: { style: "thin", color: { rgb: "1F4E79" } },
            },
          };
        }
        if (sheet["B3"]) {
          sheet["B3"].s = {
            font: { bold: true, size: 12, color: { rgb: "1F4E79" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E7E6E6" } },
            border: {
              top: { style: "thin", color: { rgb: "1F4E79" } },
              bottom: { style: "thin", color: { rgb: "1F4E79" } },
              left: { style: "thin", color: { rgb: "1F4E79" } },
              right: { style: "thin", color: { rgb: "1F4E79" } },
            },
          };
        }
        if (sheet["C3"]) {
          sheet["C3"].s = {
            font: { bold: true, size: 12, color: { rgb: "1F4E79" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "E7E6E6" } },
            border: {
              top: { style: "thin", color: { rgb: "1F4E79" } },
              top: { style: "thin", color: { rgb: "1F4E79" } },
              left: { style: "thin", color: { rgb: "1F4E79" } },
              right: { style: "thin", color: { rgb: "1F4E79" } },
            },
          };
        }

        // Ma'lumotlar qatorlari uchun stillar
        for (let i = 4; i <= 8; i++) {
          if (sheet[`A${i}`]) {
            sheet[`A${i}`].s = {
              font: { size: 11 },
              alignment: { horizontal: "left", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            };
          }
          if (sheet[`B${i}`]) {
            sheet[`B${i}`].s = {
              font: { size: 11 },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            };
          }
          if (sheet[`C${i}`]) {
            sheet[`C${i}`].s = {
              font: { size: 11 },
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin", color: { rgb: "CCCCCC" } },
                bottom: { style: "thin", color: { rgb: "CCCCCC" } },
                left: { style: "thin", color: { rgb: "CCCCCC" } },
                right: { style: "thin", color: { rgb: "CCCCCC" } },
              },
            };
          }
        }

        // Jami qatorlari uchun stillar (A10:C10)
        if (sheet["A10"]) {
          sheet["A10"].s = {
            font: { bold: true, size: 14, color: { rgb: "C5504B" } },
            alignment: { horizontal: "left", vertical: "center" },
            fill: { fgColor: { rgb: "FCE4D6" } },
            border: {
              top: { style: "medium", color: { rgb: "C5504B" } },
              bottom: { style: "medium", color: { rgb: "C5504B" } },
              left: { style: "thin", color: { rgb: "C5504B" } },
              right: { style: "thin", color: { rgb: "C5504B" } },
            },
          };
        }
        if (sheet["B10"]) {
          sheet["B10"].s = {
            font: { bold: true, size: 14, color: { rgb: "C5504B" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "FCE4D6" } },
            border: {
              top: { style: "medium", color: { rgb: "C5504B" } },
              bottom: { style: "medium", color: { rgb: "C5504B" } },
              left: { style: "thin", color: { rgb: "C5504B" } },
              right: { style: "thin", color: { rgb: "C5504B" } },
            },
          };
        }
        if (sheet["C10"]) {
          sheet["C10"].s = {
            font: { bold: true, size: 14, color: { rgb: "C5504B" } },
            alignment: { horizontal: "center", vertical: "center" },
            fill: { fgColor: { rgb: "FCE4D6" } },
            border: {
              top: { style: "medium", color: { rgb: "C5504B" } },
              bottom: { style: "medium", color: { rgb: "C5504B" } },
              left: { style: "thin", color: { rgb: "C5504B" } },
              right: { style: "thin", color: { rgb: "C5504B" } },
            },
          };
        }
      });

      // Qo'shimcha chiroyli elementlar
      try {
        // Har bir sheet uchun merged cells
        sheets.forEach((sheet, index) => {
          // Sarlavha uchun merged cells (A1:C1)
          if (!sheet["!merges"]) sheet["!merges"] = [];
          sheet["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });

          // Jami qator uchun merged cells (A10:C10)
          sheet["!merges"].push({ s: { r: 9, c: 0 }, e: { r: 9, c: 2 } });
        });
      } catch (error) {
        console.log("Merged cells qo'shishda xato:", error.message);
      }
    } catch (error) {
      console.log("Excel stillarini qo'shishda xato:", error.message);
    }

    return { filePath, fileName };
  } catch (error) {
    throw error;
  }
};

// Simulyatsiya qilingan ma'lumotlar (default holatda 0)
let simulatedData = {
  profit: {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  },
  orders: {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  },
  users: {
    today: 0,
    yesterday: 0,
    thisWeek: 0,
    thisMonth: 0,
    thisYear: 0,
  },
};

export const getSimulatedData = () => {
  return simulatedData;
};

// Ma'lumotlarni tozalash funksiyasi
export const clearStatisticsData = () => {
  simulatedData = {
    profit: {
      today: 0,
      yesterday: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
    },
    orders: {
      today: 0,
      yesterday: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
    },
    users: {
      today: 0,
      yesterday: 0,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0,
    },
  };
  return simulatedData;
};

// Statistika yangilash funksiyalari
export const updateOrderStatistics = (
  orderAmount,
  orderPrice,
  action = "create"
) => {
  const today = new Date();
  const isToday = (date) => {
    const orderDate = new Date(date);
    return orderDate.toDateString() === today.toDateString();
  };
  const isThisWeek = (date) => {
    const orderDate = new Date(date);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    return orderDate >= weekStart;
  };
  const isThisMonth = (date) => {
    const orderDate = new Date(date);
    return (
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };
  const isThisYear = (date) => {
    const orderDate = new Date(date);
    return orderDate.getFullYear() === today.getFullYear();
  };

  // Buyurtma statistikasini yangilash
  simulatedData.orders.today += orderAmount;
  simulatedData.orders.thisWeek += orderAmount;
  simulatedData.orders.thisMonth += orderAmount;
  simulatedData.orders.thisYear += orderAmount;

  // Foyda statistikasini yangilash (action bo'yicha)
  if (action === "create") {
    // Yangi buyurtma yaratilganda - foyda qo'shilmaydi (hali to'lanmagan)
    // simulatedData.profit.today += 0;
  } else if (action === "admin_approve") {
    // Admin tasdiqlaganda - foyda qo'shiladi (buyurtma tasdiqlandi)
    simulatedData.profit.today += orderPrice;
    simulatedData.profit.thisWeek += orderPrice;
    simulatedData.profit.thisMonth += orderPrice;
    simulatedData.profit.thisYear += orderPrice;
  }

  return simulatedData;
};

export const updateUserStatistics = () => {
  simulatedData.users.today += 1;
  simulatedData.users.thisWeek += 1;
  simulatedData.users.thisMonth += 1;
  simulatedData.users.thisYear += 1;
  return simulatedData;
};

export const updateDeliveryStatistics = (orderPrice) => {
  // Dastavchi yetkazib berganida foyda statistikasini yangilash
  simulatedData.profit.today += orderPrice * 0.1; // 10% komissiya
  simulatedData.profit.thisWeek += orderPrice * 0.1;
  simulatedData.profit.thisMonth += orderPrice * 0.1;
  simulatedData.profit.thisYear += orderPrice * 0.1;
  return simulatedData;
};

// Mahsulot statistikasi
export const updateProductStatistics = (productId, action = "add") => {
  if (!simulatedData.products) {
    simulatedData.products = {
      total: 0,
      active: 0,
      inactive: 0,
      categories: {},
    };
  }

  if (action === "add") {
    simulatedData.products.total += 1;
    simulatedData.products.active += 1;
  } else if (action === "remove") {
    simulatedData.products.total -= 1;
    simulatedData.products.active -= 1;
  }

  return simulatedData.products;
};

// Kategoriya statistikasi
export const updateCategoryStatistics = (categoryId, action = "add") => {
  if (!simulatedData.categories) {
    simulatedData.categories = {
      total: 0,
      active: 0,
      inactive: 0,
    };
  }

  if (action === "add") {
    simulatedData.categories.total += 1;
    simulatedData.categories.active += 1;
  } else if (action === "remove") {
    simulatedData.categories.total -= 1;
    simulatedData.categories.active -= 1;
  }

  return simulatedData.categories;
};

// Buyurtma raqamini yaratish (001, 002 ko'rinishda)
export const generateOrderNumber = () => {
  if (!simulatedData.orderCounter) {
    simulatedData.orderCounter = 1;
  } else {
    simulatedData.orderCounter += 1;
  }

  // 3 xonali raqam (001, 002, 003...)
  return simulatedData.orderCounter.toString().padStart(3, "0");
};

// Bugungi buyurtma raqamini olish
export const getTodayOrderNumber = () => {
  const today = new Date().toDateString();

  if (!simulatedData.dailyOrderCounter) {
    simulatedData.dailyOrderCounter = {};
  }

  if (!simulatedData.dailyOrderCounter[today]) {
    simulatedData.dailyOrderCounter[today] = 1;
  } else {
    simulatedData.dailyOrderCounter[today] += 1;
  }

  // 3 xonali raqam (001, 002, 003...)
  return simulatedData.dailyOrderCounter[today].toString().padStart(3, "0");
};
