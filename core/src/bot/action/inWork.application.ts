import { Context } from "telegraf";
import { in_work } from "../../database/request/Application";
import { applicationManageMurkap } from "../keyboards/application";

const inWork = async (ctx: Context & { match: RegExpMatchArray }) => {
  try {
    // Сразу отвечаем на callback query
    await ctx.answerCbQuery("🔄 Обрабатываю запрос...");

    // Правильно получаем параметры из match
    const message_id = parseInt(ctx.match[1]);
    const chat_id_manager = ctx.from?.id; // ID пользователя, а не чата

    if (!chat_id_manager) {
      console.error("No user id available for inWork", { ctx });
      await ctx.answerCbQuery("❌ Ошибка доступа");
      return;
    }

    const run = await in_work({ chat_id: chat_id_manager, message_id });

    if (!run.success) {
      await ctx.answerCbQuery(run.message, { show_alert: true });
      return;
    }

    // Формируем сообщение для менеджера
    let message_for_manager: string[] = [
      `🔔 <b>Заявка #${run.application.count}:</b>`,
    ];

    message_for_manager.push(
      `⏰ Время взятия: ${new Date().toLocaleString()}\n`
    ); // исправлена строка

    if (run.application.name)
      message_for_manager.push(`👤 Имя: ${run.application.name}`);
    if (run.application.user_phone)
      message_for_manager.push(`📞 Телефон: ${run.application.user_phone}`);
    if (run.application.user_post)
      message_for_manager.push(`📧 Почта: ${run.application.user_post}`);
    if (run.application.user_address)
      message_for_manager.push(`🏢 Адрес: ${run.application.user_address}`);
    if (run.application.user_company)
      message_for_manager.push(`💼 Компания: ${run.application.user_company}`); // исправлен текст
    if (run.application.message)
      message_for_manager.push(`💬 Сообщение: ${run.application.message}`);
    if (run.application.file)
      message_for_manager.push(`📎 Файл: В тестовом отсуствует`);

    message_for_manager.push(
      "\n<i>Ответьте на сообщение чтобы оставить комментарий</i>"
    );

    const message = message_for_manager.join("\n");

    // Обновляем сообщения в чатах
    for (const { chat_id, message_id } of run.application.chats) {
      try {
        if (chat_id_manager === chat_id) {
          // Сообщение для менеджера, который взял заявку
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            message,
            {
              parse_mode: "HTML",
              ...applicationManageMurkap(message_id).inWorkForManager, // исправлено название
            }
          );
        } else {
          // Сообщение для остальных участников
          await ctx.telegram.editMessageText(
            chat_id,
            message_id,
            undefined,
            `🔄 <b>Заявка #${run.application.count}</b>\n` + 
              `👨‍💼 Взял в работу менеджер <b><a href="https://t.me/${run.tag}">${run.fullname}</a></b>\n`,
            {
              parse_mode: "HTML",
              link_preview_options: { is_disabled: true },
            }
          );
        }

        // Небольшая задержка между запросами
        await new Promise((resolve) => setTimeout(resolve, 250));
      } catch (error) {
        console.error(
          `❌ Ошибка при обновлении сообщения в чате ${chat_id}:`,
          error
        );
      }
    }

    // Успешное завершение
    await ctx.answerCbQuery(
      `✅ Заявка #${run.application.count} взята в работу!`
    );
  } catch (error: any) {
    // Обработка ошибок устаревших callback'ов
    if (
      error?.response?.error_code === 400 &&
      error?.response?.description?.includes("query is too old")
    ) {
      console.log("⚠️ Игнорируем устаревший callback query");
      return;
    }

    console.error("❌ Критическая ошибка в inWork:", error);

    // Пытаемся уведомить пользователя об ошибке
    try {
      await ctx.answerCbQuery("❌ Произошла ошибка при обработке", {
        show_alert: true,
      });
    } catch (e) {
      // Игнорируем ошибки ответа
    }
  }
};

export default inWork;
