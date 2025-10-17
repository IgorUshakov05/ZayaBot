import { Context } from "telegraf";
import { checkUserNotification } from "../../database/request/User";
import { Role } from "../../types/UserSchema";
import { settingNotification } from "../keyboards/notification";

export default async function notificationMessageEvent(
  ctx: Context & { chat: { id: number } }
) {
  const chat_id = ctx.chat.id;
  const userState = await checkUserNotification({ chat_id });

  if (!userState.success) {
    return ctx.reply(userState.message);
  }

  // Используем userState.mute для определения состояния уведомлений
  const keyboard = settingNotification(!userState.mute, userState.role);
  if (userState.role === Role.director || userState.role === Role.manager) {
    return ctx.reply(
      userState.mute
        ? "Отображение заявок включено. Вы будете получать уведомления о новых заявках."
        : "Уведомления о заявках отключены.",
      { reply_markup: keyboard } // поддержка типа InlineKeyboardMarkup
    );
  }
}
