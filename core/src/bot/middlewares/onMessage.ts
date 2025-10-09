import { managerMurkup } from "../keyboards/managers";

// Обработчик сообщений
const messageHandle = async (ctx: any) => {
  const text = ctx.message.text;

  if (!text) return;

  switch (text) {
    case "Регистрация в 3 этапа":
      ctx.scene.enter("registration");
      break;

    case "👥 Менеджеры":
      ctx.reply("awd", managerMurkup.first);
      break;
    default:
      await ctx.reply("Пожалуйста, используйте кнопки.");
      break;
  }
};

export default messageHandle;
