import { Markup } from "telegraf";
import { Role } from "../../types/UserSchema";
import { InlineKeyboardMarkup } from "telegraf/types";

type NotificationSettings = {
  [key in Role]: InlineKeyboardMarkup;
};

export const settingNotification = (
  state: boolean,
  role: Role
): InlineKeyboardMarkup => {
  const ofState: NotificationSettings = {
    [Role.director]: Markup.inlineKeyboard([
      state
        ? { text: "🔕 Отключить уведомления о заявках", callback_data: "notification_off" }
        : { text: "🔔 Включить уведомления о заявках", callback_data: "notification_on" },
    ]).reply_markup,
    [Role.manager]: Markup.inlineKeyboard([
      state
        ? { text: "🔕 Отключить уведомления о заявках", callback_data: "notification_off" }
        : { text: "🔔 Включить уведомления о заявках", callback_data: "notification_on" },
    ]).reply_markup,
  };

  return ofState[role];
};
