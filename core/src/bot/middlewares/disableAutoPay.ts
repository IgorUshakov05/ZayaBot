import { get_payment_method_info } from "../../database/request/PaymentMethod";
import { get_disable_auto_pay_message } from "../global/autoPayMessages";
import { subscribeMurkap } from "../keyboards/subscribe";

export async function disableAutoPay(ctx: any) {
  const chat_id = ctx.chat.id;
  const payment_method = await get_payment_method_info({ chat_id });

  if (!payment_method) {
    await ctx.reply(chat_id, "❌ Платёжный метод не найден");
    return;
  }

  const message = get_disable_auto_pay_message(payment_method);

  await ctx.reply(message, {
    parse_mode: "HTML",
    ...subscribeMurkap.disableAutoPay,
  });
}
