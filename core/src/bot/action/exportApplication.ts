import { Context } from "telegraf";
import { applicationMurkup } from "../keyboards/application";

const exportApplication = async (ctx: Context) => {
  try {
    ctx.deleteMessage();
    await ctx.answerCbQuery();
    ctx.reply("Выберите формат экспорта:", applicationMurkup.formatExport);
  } catch (err) {
    console.error(err);
    await ctx.reply("⚠️ Произошла ошибка. Попробуйте позже.");
  }
};
export default exportApplication;
