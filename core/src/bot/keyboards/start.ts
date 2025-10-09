import { Markup } from "telegraf";

export const start = {
  auth: {
    director: {
      ...Markup.keyboard([
        ["👥 Менеджеры", "📋 Заявки"],
        ["💰 Подписка", "📊 Аналитика"],
      ]).resize(),
    },
    manager: {},
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
