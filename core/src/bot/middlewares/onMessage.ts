// Обработчик сообщений
const messageHandle = async (ctx: any) => {
  const text = ctx.message.text;

  if (!text) return;

  switch (text) {
    case "Регистрация в 3 этапа":
      ctx.scene.enter("registration"); 
      break;

    default:
      await ctx.reply("Пожалуйста, используйте кнопки.");
      break;
  }
};

export default messageHandle;
