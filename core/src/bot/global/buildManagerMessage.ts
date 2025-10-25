import IApplication from "../../types/ApplicationSchema";

export function buildManagerMessage(application: IApplication): string {
  const fields: string[] = [`🔔 <b>Заявка #${application.count}:</b>\n`];

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

  if (application.file) fields.push(`📎 Файл: В тестовом отсутствует`);
  if (application.comment) fields.push(`\nКомментарий: ${application.comment}`);

  return fields.join("\n");
}
