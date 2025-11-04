import { Context } from "telegraf";
import { get_status_application } from "../../database/request/Application";

export default async function statusApplication(
  ctx: Context & { chat: { id: number } }
) {
  try {
    const result = await get_status_application({
      chat_id: ctx.chat.id,
    });

    if (!result.success) {
      return ctx.reply(`Ошибка ${result.message}`);
    }

    const { pending, inWork, complete } = result.status;

    const total = pending + inWork + complete;
    const progressPercent = total > 0 ? Math.round((complete / total) * 100) : 0;
    const filledBlocks = Math.round(progressPercent / 10);
    const progressBar = "█".repeat(filledBlocks) + "░".repeat(10 - filledBlocks);

    let message = `<b>🗽 Текущий статус заявок</b>\n\n`;

    message += `🔴 Новые: <b>${pending}</b>\n`;
    message += `🟡 В работе: <b>${inWork}</b>\n`;
    message += `🟢 Завершено: <b>${complete}</b>\n\n`;

    message += `<b>Прогресс:</b> ${progressBar} <b>${progressPercent}%</b>\n\n`;

    if (progressPercent === 100) {
      message += `Всё закрыто! Команда — чемпионы!`;
    } else if (progressPercent >= 80) {
      message += `Блестяще! Осталось чуть-чуть!`;
    } else if (progressPercent >= 50) {
      message += `Хороший темп! Продолжаем!`;
    } else {
      message += `Время ускориться!`;
    }

    await ctx.reply(message, { parse_mode: "HTML" });

  } catch (error) {
    console.error("statusApplication", error);
    ctx.reply("Ошибка при обработке");
  }
}