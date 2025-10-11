// - [➕ Добавить менеджера]
// - [➖ Удалить менеджера]
// - [✏️ Редактировать менеджера]

import { Markup } from "telegraf";
import { markAsUncloneable } from "worker_threads";

export const managerMurkup = {
  first: {
    ...Markup.keyboard([
      ["➕ Добавить менеджера", "➖ Удалить менеджера"],
      ["✏️ Редактировать менеджера"],
      ["🏠 Главное меню"],
    ]).resize(true),
  },
  errorAddManager: {
    ...Markup.keyboard([["🏠 Главное меню"]]).resize(true),
  },
};
