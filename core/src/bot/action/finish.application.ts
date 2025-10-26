import { Context } from "telegraf";
import { finish_application } from "../../database/request/Application";
import { Role } from "../../types/UserSchema";

const finishApplication = async (
  ctx: Context & { match: RegExpMatchArray }
) => {
  try {
    await ctx.answerCbQuery("🔄 Обрабатываю запрос...");

    const message_id = parseInt(ctx.match[1]);
    const chat_id_manager = ctx.from?.id;

    if (!chat_id_manager) {
      console.error("No user id available for inWork", { ctx });
      await ctx.answerCbQuery("❌ Ошибка доступа");
      return;
    }

    const finish = await finish_application({
      chat_id: chat_id_manager,
      message_id,
    });

    if (!finish.success) {
      await ctx.reply(finish.message, { parse_mode: "HTML" });
      return;
    }

    for (const { chat_id, message_id, role } of finish.application.chats) {
      console.log({ chat_id, message_id, role });
      try {
        if (role === Role.manager) {
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            finish.message,
            {
              parse_mode: "HTML",
            }
          );
        } else {
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            finish.message +
              `\nМенеджер <a href="https://t.me/${finish.tag}">${finish.fullname}</a>`,
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true },
            }
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        console.error(
          `❌ Ошибка при обновлении сообщения в чате ${chat_id}:`,
          error
        );
      }
    }

    await ctx.answerCbQuery(
      `✅ Заявка #${finish.application.count} выполнена!`
    );
  } catch (error: any) {
    if (
      error?.response?.error_code === 400 &&
      error?.response?.description?.includes("query is too old")
    ) {
      console.log("⚠️ Игнорируем устаревший callback query");
      return;
    }

    console.error("❌ Критическая ошибка в finish.application.ts:", error);

    try {
      await ctx.answerCbQuery("❌ Произошла ошибка при обработке", {
        show_alert: true,
      });
    } catch (e) {
      console.log(e);
    }
  }
};

export default finishApplication;
