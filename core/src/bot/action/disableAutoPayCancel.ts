import { Context } from "telegraf";

export default async function disabledAutoPayCancel(ctx: Context) {
  await ctx.answerCbQuery("🔄 Обрабатываю запрос...");

  await ctx.deleteMessage();
  ctx.reply(
    `❌ <b>Отмена отключения</b>

Автоплатеж не был отключен. Подписка будет продлеваться автоматически как обычно.`,
    { parse_mode: "HTML" }
  );
}
