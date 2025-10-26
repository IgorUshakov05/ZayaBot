import { Markup } from "telegraf";
// - [📊 Статистика]
export const edit = {
  metadata: {
    ...Markup.keyboard([["✏️ Изменить Фамилию и Имя"], ["🏠 Главное меню"]])
      .resize()
      .oneTime(false),
  },
};
