// - [📋 Подписка]
// - [💸 Плата за заявку]
import { Markup } from "telegraf";

export const subscribeMurkap = {
  first: {
    ...Markup.keyboard([
      ["📋 Подписка", "💸 Плата за заявку"],
      ["🏠 Главное меню"],
    ]).resize(true),
  },
  subscribe: {
    ...Markup.inlineKeyboard([
      [
        { text: "💳 Выбрать Start", callback_data: "tariff_start" },
        { text: "💳 Выбрать Pro", callback_data: "tariff_pro" },
      ],
      [{ text: "💳 Выбрать Enterprise", callback_data: "tariff_enterprise" }],
    ]), 
  },
  topup: {
    ...Markup.inlineKeyboard([
      [{ text: "💳 Пополнить счёт", callback_data: "topup_balance" }],
    ]),
  },
};
