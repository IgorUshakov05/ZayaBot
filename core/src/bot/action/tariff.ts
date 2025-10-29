import { PaymentPlan } from "../../types/UserSchema";

const tariffBalanceAction = async (ctx: any) => {
  const plan: PaymentPlan = ctx.match[1];
  ctx.answerCbQuery()
  await ctx.scene.enter("enter_tariff", { plan: plan.toUpperCase() });
};
export default tariffBalanceAction;
