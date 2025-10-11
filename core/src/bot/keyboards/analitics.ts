// - [📈 Заявки за период]
// - [👥 Эффективность менеджеров]
// - [🔍 Статусы заявок]

import { Markup } from "telegraf";

export const analiticsMurkup = {
  first: {
    ...Markup.keyboard([
      ["📈 Заявки за период", "👥 Эффективность менеджеров"],
      ["🔍 Статусы заявок"],
      ["🏠 Главное меню"],
    ]).resize(true),
  },
  period: {
    ...Markup.inlineKeyboard([
      [
        { text: "📅 Сегодня", callback_data: "analitict_today" },
        { text: "📅 Неделя", callback_data: "analitict_week" },
      ],
      [
        { text: "📅 Месяц", callback_data: "analitict_month" },
        { text: "📅 Выбрать даты", callback_data: "analitict_custom" },
      ],
    ]),
  },
};
