// - [📋 Тариф]
// - [💸 Плата за заявку]
import { Markup } from "telegraf";

export const subscribeMurkap = {
  first: {
    ...Markup.keyboard([
      ["📋 Тариф", "💸 Плата за заявку"],
      ["🏠 Главное меню"],
    ]).resize(true),
  },
  firstWithAutoPayment: {
    ...Markup.keyboard([
      ["📋 Тариф", "💸 Плата за заявку"],
      ["🏦 Отключить автопополнение"],
      ["🏠 Главное меню"],
    ]).resize(true),
  },
  disableAutoPay: {
    ...Markup.inlineKeyboard([
      [
        {
          text: "✅ Да, отключить",
          callback_data: "disable_auto_pay_confirm",
        },
        { text: "❌ Отмена", callback_data: "disable_auto_pay_cancel" },
      ],
    ]),
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
      [{ text: "Да! Хочу пополнить!", callback_data: "topup_balance" }],
    ]),
  },
};
