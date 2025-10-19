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
};

export const applicationManageMurkap = (message_id: number) => {
  return {
    newApplicationManager: {
      ...Markup.inlineKeyboard([
        {
          text: "🔄 Взять в работу",
          callback_data: `inwork_${message_id}`,
        },
      ]),
    },
    inWorkForManager: {
      ...Markup.inlineKeyboard([
        [
          {
            text: "✅ Завершить заявку",
            callback_data: `finish_${message_id}`,
          },
        ],
        [
          {
            text: "🚫 Отказаться от заявки",
            callback_data: `cancel_${message_id}`,
          },
        ],
      ]),
    },
  };
};
