import { Context } from "telegraf";
import { createCode } from "../../database/request/Code";
import { Role } from "../../types/UserSchema";
import { managerMurkup } from "../keyboards/managers";

export default async function newManager(
  ctx: Context & { chat: { id: number } }
) {
  try {
    let chat_id = ctx.chat?.id;
    let newCode = await createCode({ chat_id, role: Role.manager });
    if (!newCode.success) {
      return ctx.reply(newCode.message, managerMurkup.errorAddManager);
    }
    await ctx.reply(
      `🔗 *Ссылка для регистрации менеджера создана!*

Отправьте её сотруднику, чтобы он смог присоединиться к вашей компании:

[Открыть ссылку для регистрации](https://t.me/zaya_crm_bot?start=${newCode.code})

После перехода по ссылке сотрудник автоматически пройдёт регистрацию и получит роль *менеджера*.`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    return ctx.reply("Ошибка сервера!", managerMurkup.errorAddManager);
  }
}
