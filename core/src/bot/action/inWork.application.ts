import { Context } from "telegraf";
import {  in_work_application } from "../../database/request/Application";
import { applicationManageMurkap } from "../keyboards/application";
import { buildManagerMessage } from "../global/buildManagerMessage";

const inWorkAction = async (ctx: Context & { match: RegExpMatchArray }) => {
  try {
    // Сразу отвечаем на callback query
    await ctx.answerCbQuery("🔄 Обрабатываю запрос...");

    const message_id = parseInt(ctx.match[1]);
    const chat_id_manager = ctx.from?.id;

    if (!chat_id_manager) {
      console.error("No user id available for inWork", { ctx });
      await ctx.answerCbQuery("❌ Ошибка доступа");
      return;
    }

    const run = await in_work_application({ chat_id: chat_id_manager, message_id });

    if (!run.success) {
      await ctx.reply(run.message, { parse_mode: "HTML" });
      return;
    }

    let new_message = buildManagerMessage(run.application);
    new_message += "\n<i>Ответьте на сообщение чтобы оставить комментарий</i>";
    for (const { chat_id, message_id } of run.application.chats) {
      try {
        if (chat_id_manager === chat_id) {
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            new_message,
            {
              parse_mode: "HTML",
              ...applicationManageMurkap(message_id).inWorkForManager,
            }
          );
        } else {
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            `🔄 <b>Заявка #${run.application.count}</b>\n\n` +
              `👨‍💼 Взял в работу менеджер <b><a href="https://t.me/${run.tag}">${run.fullname}</a></b>\n`,
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
      `✅ Заявка #${run.application.count} взята в работу!`
    );
  } catch (error: any) {
    if (
      error?.response?.error_code === 400 &&
      error?.response?.description?.includes("query is too old")
    ) {
      console.error("⚠️ Игнорируем устаревший callback query");
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

export default inWorkAction;
