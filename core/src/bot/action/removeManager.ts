import { Context, Markup } from "telegraf";
import { remove_manager_from_company } from "../../database/request/Company";

const removeManagerAction = async (
  ctx: Context & { match: any } & { chat: { id: number } }
) => {
  try {
    await ctx.answerCbQuery();
    console.log(ctx.match);
    let manager_id = ctx.match.input.split("_")[1];
    console.log(manager_id);
    if (!manager_id) return;
    let removeUser = await remove_manager_from_company({
      director_chat_id: ctx.chat.id,
      manager__id: manager_id,
    });
    return ctx.editMessageText(removeUser.message);
  } catch (error) {
    console.error("Ошибка в removeManagerAction", error);
    ctx.reply("Ошибка сервера!");
  }
};

export default removeManagerAction;
