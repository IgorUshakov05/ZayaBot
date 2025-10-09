// - [➕ Добавить менеджера]
// - [➖ Удалить менеджера]
// - [✏️ Редактировать менеджера]

import { Markup } from "telegraf";

export const managerMurkup = {
  first: {
    ...Markup.keyboard([
      ["➕ Добавить менеджера", "➖ Удалить менеджера"],
      ["✏️ Редактировать менеджера"],
    ]).resize(true),
  },
};
