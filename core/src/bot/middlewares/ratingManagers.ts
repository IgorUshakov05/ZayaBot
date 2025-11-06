import { Context, Markup } from "telegraf";
import { get_all_application_and_month_rating } from "../../database/request/Application";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function getRatingManager(
  ctx: Context & { chat: { id: number } }
) {
  try {
    const result = await get_all_application_and_month_rating({
      chat_id: ctx.chat.id,
    });

    if (!result.success) {
      return ctx.reply(result.message);
    }

    const { monthCountApplication, rating } = result;
    const currentMonth = format(new Date(), "LLLL yyyy", { locale: ru });

    let message = `<b>Рейтинг менеджеров за ${currentMonth}</b>\n\n`;
    message += `Всего заявок в этом месяце: <b>${monthCountApplication}</b>\n\n`;

    if (rating.length === 0) {
      message += "Пока никто не закрыл ни одной заявки";
      return ctx.reply(message, { parse_mode: "HTML" });
    }

    rating.forEach((item, index) => {
      const percent =
        monthCountApplication > 0
          ? Math.round((item.count / monthCountApplication) * 100)
          : 0;

      const medal =
        index === 0
          ? "🥇"
          : index === 1
          ? "🥈"
          : index === 2
          ? "🥉"
          : `${index + 1}.`;

      message += `${medal} <b>${item.name}</b> ${
        item.user_tag ? item.user_tag : ""
      } — <b>${item.count}</b> (${percent}%)\n`;
    });

    let closet = rating.reduce((sum, item) => sum + item.count, 0);
    let closetPrecent =
      monthCountApplication > 0
        ? Math.round((closet / monthCountApplication) * 100)
        : 0;
    message += `\nЗакрыто: <b>${closet} (${closetPrecent}%)</b>\n`;

    await ctx.reply(message, {
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("getRatingManager", error);
    ctx.reply("Ошибка при обработке");
  }
}
