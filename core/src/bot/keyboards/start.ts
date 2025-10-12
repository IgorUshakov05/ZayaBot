import { Markup } from "telegraf";
// - [✏️ Изменить данные]
// - [🔔 Настроить уведомления]
// - [📊 Статистика]
export const start = {
  auth: {
    director: {
      ...Markup.keyboard([
        ["👥 Менеджеры", "📋 Заявки"],
        ["💰 Подписка", "📊 Аналитика"],
      ]).resize(),
    },
    manager: {
      ...Markup.keyboard([
        ["✏️ Изменить данные", "📊 Статистика"],
        ["🔔 Настроить уведомления"],
      ]).resize(),
    },
    test_company: {
      ...Markup.inlineKeyboard([
        { text: "Удалить компанию", callback_data: "remove_test_company" },
      ]),
    },
  },
  notAuth: {
    ...Markup.keyboard([["Регистрация в 3 этапа"]])
      .resize()
      .oneTime(false),
  },
};
