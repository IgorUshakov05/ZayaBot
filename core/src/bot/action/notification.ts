import { setUserNotification } from "../../database/request/User";
import { Role } from "../../types/UserSchema";
import { start } from "../keyboards/start";

const notificationAction = async (ctx: any) => {
  const state: "on" | "off" = ctx.match[1];
  const newState: boolean = state === "on";
  let message = newState
    ? "✅ Теперь вы будете получать уведомления о новых заявках."
    : "❌ Вы больше не будете получать уведомления о новых заявках.";

  ctx.answerCbQuery(
    newState ? "Уведомления включены" : "Уведомления отключены"
  );

  let notiInfo = await setUserNotification({
    chat_id: ctx.chat.id,
    state: !newState,
  });

  if (!notiInfo.success) return ctx.reply(notiInfo.message);

  return ctx.reply(
    message,
    notiInfo.role === Role.director ? start.auth.director : start.auth.manager
  );
};
export default notificationAction;
