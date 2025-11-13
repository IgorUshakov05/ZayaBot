// service/exportCsv.ts
import conf from "../../config/config";
import IApplication, { Status } from "../../types/ApplicationSchema";
import IUser from "../../types/UserSchema";

type Application = IApplication & { manager: IUser };

export async function exportApplicationsToCSV(
  applications: Application[]
): Promise<string> {
  const headers = [
    "Кол-во",
    "Статус (текст)",
    "Имя",
    "Телефон",
    "Комментарий",
    "Компания",
    "Email",
    "Сообщение",
    "Адрес",
    "Файл",
    "Менеджер",
    "Создано",
    "Обновлено",
  ];

  const escape = (value: any): string => {
    const str = String(value ?? "—");
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = applications.map((app) => {
    const statusText =
      app.status === Status.complete
        ? "Завершена"
        : app.status === Status.inWork
        ? "В работе"
        : "Ожидает";

    const managerName = app.manager
      ? `${app.manager.name || ""} ${app.manager.surname || ""}`.trim() || "—"
      : "—";
    let file = app.file
      ? `${conf.BASE_URL}/api/v1/download?file=${app.file}`
      : null;
    return [
      app.count ?? 0,
      statusText,
      escape(app.name),
      escape(app.user_phone),
      escape(app.comment),
      escape(app.user_company),
      escape(app.user_post),
      escape(app.message),
      escape(app.user_address),
      escape(file),
      escape(managerName),
      app.createdAt ? new Date(app.createdAt).toLocaleString("ru-RU") : "—",
      app.updatedAt ? new Date(app.updatedAt).toLocaleString("ru-RU") : "—",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
