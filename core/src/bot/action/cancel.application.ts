import { Context } from "telegraf";
import { cancel_application } from "../../database/request/Application";
import { applicationManageMurkap } from "../keyboards/application";
import { buildManagerMessage } from "../global/buildManagerMessage";
import { Role } from "../../types/UserSchema";

const cancelApplicationAction = async (
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

    const cancel = await cancel_application({
      chat_id: chat_id_manager,
      message_id,
    });

    if (!cancel.success) {
      await ctx.reply(cancel.message, { parse_mode: "HTML" });
      return;
    }

    let new_message = buildManagerMessage(cancel.application);

    for (const { chat_id, message_id, role } of cancel.application.chats) {
      try {
        if (role === Role.manager) {
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            new_message,
            {
              parse_mode: "HTML",
              ...applicationManageMurkap(message_id).newApplicationManager,
            }
          );
        } else {
          message_id + "\nЗаявка из возврата";
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            new_message,
            {
              parse_mode: "HTML",
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
      `✅ Заявка #${cancel.application.count} взята в работу!`
    );
  } catch (error: any) {
    if (
      error?.response?.error_code === 400 &&
      error?.response?.description?.includes("query is too old")
    ) {
      console.log("⚠️ Игнорируем устаревший callback query");
      return;
    }

    console.error("❌ Критическая ошибка в inWork:", error);

    try {
      await ctx.answerCbQuery("❌ Произошла ошибка при обработке", {
        show_alert: true,
      });
    } catch (e) {
      console.log(e)
    }
  }
};

export default cancelApplicationAction;
