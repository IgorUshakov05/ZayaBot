import { Context, Markup } from "telegraf";
import { get_all_application } from "../../database/request/Application";
import { buildApplicationMessage } from "../global/buildApplicationMessage";
import { applicationMurkup } from "../keyboards/application";

/**
 * Разбивает массив `arr` на чанки по `size` элементов.
 * @param arr    входной массив
 * @param size   размер чанка (по умолчанию 5)
 * @returns      массив чанков
 */
function chunk<T>(arr: T[], size: number = 10): T[][] {
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }

  return result;
}

export default async function getAllApplication(
  ctx: Context & { chat: { id: number } }
) {
  try {
    let applications = await get_all_application({ chat_id: ctx.chat.id });
    if (!applications.success) return ctx.reply(applications.message);
    let chanks = await chunk(applications.applications);

    chanks.forEach((chunk, index) => {
      setTimeout(() => {
        let message = chunk
          .map((application) => buildApplicationMessage(application))
          .join("");

        ctx.reply(message, {
          parse_mode: "HTML",
          reply_markup:
            index === chanks.length - 1
              ? applicationMurkup.export.reply_markup
              : undefined,
        });
      }, index * 100);
    });
  } catch (error) {
    console.error("getAllApplication", error);
    ctx.reply("Ошибка при обработке");
  }
}
