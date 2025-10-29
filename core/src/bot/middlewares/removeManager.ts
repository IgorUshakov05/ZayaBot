import { Context, Markup } from "telegraf";
import { managerInline, managerInlineKeyBoard } from "../keyboards/managers";
import { getManagers } from "../../database/request/User";
import { keyboard } from "telegraf/markup";

// Экранирование HTML
const escapeHTML = (str: string) =>
  str.replace(
    /[&<>"']/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[tag]!)
  );

export default async function removeManager(
  ctx: Context & { chat: { id: number }; message?: { message_id: number } }
) {
  try {
    const chat_id = ctx.chat.id;

    if (ctx.message?.message_id) {
      await ctx.deleteMessage(ctx.message.message_id).catch(() => {});
    }

    const result = await getManagers(chat_id);

    if (!result.success) {
      return ctx.reply(result.message, {
        reply_markup: managerInlineKeyBoard.errorAddManager.reply_markup,
      });
    }

    if (result.managers.length === 0) {
      return ctx.reply("Нет менеджеров для удаления.", {
        reply_markup: managerInlineKeyBoard.errorAddManager.reply_markup,
      });
    }

    for (const manager of result.managers) {
      const fullName =
        [manager.surname, manager.name].filter(Boolean).join(" ") ||
        "Без имени";

      const tagLink = manager.user_tag
        ? `<a href="https://t.me/${escapeHTML(manager.user_tag)}">@${escapeHTML(
            manager.user_tag
          )}</a>`
        : "<i>без тега</i>";

      const messageText = `<b>${escapeHTML(fullName)}</b>\n${tagLink}`;
      const callbackData = managerInline(manager._id as any).removeManager;
      await ctx.reply(messageText, {
        parse_mode: "HTML",
        ...callbackData,
        link_preview_options: { is_disabled: true },
      });
    }
  } catch (error) {
    console.error("Ошибка в removeManager:", error);
    await ctx
      .reply("Ошибка сервера!", {
        reply_markup: managerInlineKeyBoard.errorAddManager.reply_markup,
      })
      .catch(() => {});
  }
}
