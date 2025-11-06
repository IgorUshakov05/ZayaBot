// utils/exportExcel.ts
import ExcelJS from "exceljs";
import IApplication, { Status } from "../../types/ApplicationSchema";
import { toTitleCase } from "../global/toTitleCase";

export async function exportApplicationsToExcel(
  applications: IApplication[]
): Promise<any> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Заявки");

  const headers = [
    "ID",
    "Статус",
    "Имя",
    "Телефон",
    "Комментарий",
    "Компания",
    "Email",
    "Сообщение",
    "Адрес",
    "Менеджер",
    "Создано",
    "Обновлено",
  ];

  const headerRow = sheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };

  // Защита от undefined
  if (!applications || !Array.isArray(applications)) {
    applications = [];
  }

  applications.forEach((app: any) => {
    const managerName =
      app.status === Status.complete && !app.manager
        ? "Удаленный менеджер"
        : app.manager
        ? `${toTitleCase(app.manager.name) || ""} ${
            toTitleCase(app.manager.surname) || ""
          }`.trim() || "—"
        : "—";

    const status =
      app.status === Status.complete
        ? "Завершена"
        : app.status === Status.inWork
        ? "В работе"
        : "Ожидает";

    sheet.addRow([
      app.count,
      status,
      app.name || "-",
      app.user_phone || "-",
      app.comment || "-",
      app.user_company || "-",
      app.user_post || "-",
      app.message || "-",
      app.user_address || "-",
      managerName,
      new Date(app.createdAt).toLocaleString("ru-RU"),
      new Date(app.updatedAt).toLocaleString("ru-RU"),
    ]);
  });

  // // Автоширина
  // sheet.columns.forEach((col, i) => {
  //   const max = Math.max(
  //     ...(col.values?.map((v) => v?.toString().length || 0) || []),
  //     headers[i].length
  //   );
  //   col.width = Math.min(50, max + 2);
  // });

  sheet.autoFilter = `A1:${String.fromCharCode(65 + headers.length - 1)}${
    applications.length + 1
  }`;

  return await workbook.xlsx.writeBuffer();
}
