import { Context } from "telegraf";
import { delete_company } from "../../database/request/Company";

const removeTextCompany = async (ctx: Context & { from: { id: number } }) => {
  try {
    await ctx.answerCbQuery();
    let delete_request = await delete_company({
      chat_id: ctx.from.id,
      test: true,
    });
    return ctx.reply(delete_request.message, { parse_mode: "Markdown" });
  } catch (err) {
    console.error(err);
    await ctx.reply(
      "⚠️ Произошла ошибка при удалении компании. Попробуйте позже."
    );
  }
};
export default removeTextCompany;
