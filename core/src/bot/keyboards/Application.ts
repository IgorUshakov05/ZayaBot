// - [📊 Показать все]
// - [📥 Экспортировать]
// - [🔔 Включить отображение заявок] (или [🔔 Настроить уведомления], если уже включено)

import { Markup } from "telegraf";

export const applicationMurkup = {
  first: {
    ...Markup.keyboard([
      ["📊 Показать все", "📥 Экспортировать"],
      ["🔔 Настроить уведомления"],
      ["🏠 Главное меню"],
    ]).resize(true),
  },
  newApplicationManager: {
    ...Markup.inlineKeyboard([
      { text: "✅ Взять в работу", callback_data: "" },
    ]),
  },
};
