import { Context } from "telegraf";
import { exportApplicationsToExcel } from "../service/exportExel";
import fs from "fs";
import path from "path";
import conf from "../../config/config";
import { get_all_application } from "../../database/request/Application";
import { exportApplicationsToCSV } from "../service/exportCSV";

enum ExportFormat {
  pdf = "pdf",
  excel = "excel",
  csv = "csv",
}

const exportDocument = async (ctx: any) => {
  try {
    const format: ExportFormat = ctx.match[1];

    // === 1. Получаем заявки ===
    const applications = await get_all_application({ chat_id: ctx.chat.id });
    if (!applications.success) {
      return await ctx.reply(applications.message);
    }

    // === 2. Формируем имя файла ===
    const dateStr = new Date().toISOString().split("T")[0]; // 2025-11-02
    const ext =
      format === ExportFormat.excel
        ? "xlsx"
        : format === ExportFormat.csv
        ? "csv"
        : null;

    if (!ext) {
      return await ctx.reply("Формат не поддерживается.");
    }

    const fileName = `заявки_${ctx.chat.id}_${dateStr}.${ext}`;
    const filePath = path.join(
      __dirname,
      "..",
      "..",
      conf.STORE_FOLDER,
      fileName
    );

    // === 3. Создаём папку ===
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Создана папка: ${dir}`);
    }

    // === 4. Генерируем Excel (только для excel) ===
    if (format === ExportFormat.excel) {
      const buffer = await exportApplicationsToExcel(applications.applications);
      fs.writeFileSync(filePath, buffer);
      console.log(`Файл сохранён: ${filePath}`);

      await ctx.replyWithDocument(
        { source: filePath, filename: fileName },
        { caption: "Ваш экспорт в Excel готов!" }
      );
    }
    // === CSV (пример) ===
    else if (format === ExportFormat.csv) {
      const csv = await exportApplicationsToCSV(
        applications.applications as any
      );
      fs.writeFileSync(filePath, csv);
      await ctx.replyWithDocument(
        { source: filePath, filename: fileName },
        { caption: "Ваш экспорт в CSV готов!" }
      );
    } else if (format === ExportFormat.pdf) {
      // const csv = await exportApplicationsToCSV(
      //   applications.applications as any
      // );
      // fs.writeFileSync(filePath, csv);
      // await ctx.replyWithDocument(
      //   { source: filePath, filename: fileName },
      //   { caption: "Ваш экспорт в CSV готов!" }
      // );
    }

    await ctx.deleteMessage();
    await ctx.answerCbQuery();
  } catch (err: any) {
    console.error("Ошибка экспорта:", err);
    await ctx.reply("Произошла ошибка при экспорте. Попробуйте позже.");
  }
};

export default exportDocument;
