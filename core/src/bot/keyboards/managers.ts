import { Types } from "mongoose";
import { Markup } from "telegraf";

export const managerInlineKeyBoard = {
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

export const managerInline = (manager_id: string) => {
  return {
    removeManager: {
      ...Markup.inlineKeyboard([
        { text: "Удалить", callback_data: `removemanager_${manager_id}` },
      ]),
      keyboard: managerInlineKeyBoard.errorAddManager.reply_markup,
    },
  };
};
