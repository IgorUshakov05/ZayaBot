import IApplication, { Status } from "../../types/ApplicationSchema";

export function buildApplicationMessage(application: IApplication): string {
  const fields: string[] = [
    `<blockquote>🔔 <b>Заявка #${application.count}:</b> ${
      application.status === Status.complete
        ? "Завершена"
        : application.status === Status.inWork
        ? "В работе"
        : "Ожидает"
    }`,
  ];

  const map = [
    { key: "name", label: "👤 Имя" },
    { key: "user_phone", label: "📞 Телефон" },
    { key: "user_post", label: "📧 Почта" },
    { key: "user_address", label: "🏢 Адрес" },
    { key: "user_company", label: "💼 Компания" },
    { key: "message", label: "💬 Сообщение" },
  ] as const;

  for (const { key, label } of map) {
    if (application[key]) fields.push(`${label}: ${application[key]}`);
  }
  fields.push("</blockquote>");

  return fields.join("\n");
}
