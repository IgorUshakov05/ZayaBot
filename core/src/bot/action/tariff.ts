import { PaymentPlan } from "../../types/UserSchema";

const tariffBalance = async (ctx: any) => {
  const plan: PaymentPlan = ctx.match[1];

  await ctx.scene.enter("enter_tariff", { plan: plan.toUpperCase() });
};
export default tariffBalance;
