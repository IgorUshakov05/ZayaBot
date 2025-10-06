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
  },
  notAuth: {
    ...Markup.keyboard([["Регистрация в 3 этапа"]])
      .resize()
      .oneTime(false),
  },
};
