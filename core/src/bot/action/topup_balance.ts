const topupBalance = async (ctx: any) => {
  try {
    await ctx.answerCbQuery();
    return ctx.scene.enter("topup_balance");
  } catch (err) {
    console.error(err);
    await ctx.reply("⚠️ Произошла ошибка. Попробуйте позже.");
  }
};
export default topupBalance;
