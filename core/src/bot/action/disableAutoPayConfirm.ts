import { Context } from "telegraf";
import { get_disable_auto_pay_success_message } from "../global/autoPayMessages";
import {
  disable_auto_pay,
  get_payment_method_info,
} from "../../database/request/PaymentMethod";
import { start } from "../keyboards/start";

export default async function disabledAutoPayConfirm(
  ctx: Context & { chat: { id: number } }
) {
  let chat_id = ctx.chat.id;
  await ctx.deleteMessage();
  let paymentMethod = await get_payment_method_info({ chat_id });
  if (!paymentMethod) return ctx.reply("Ошибка при получении автоплатежа");
  let startDisabled = await disable_auto_pay({ chat_id });
  if (!startDisabled.success) return ctx.reply(startDisabled.message);
  let message = get_disable_auto_pay_success_message(paymentMethod);
  ctx.reply(message, { parse_mode: "HTML", ...start.auth.director });
}
