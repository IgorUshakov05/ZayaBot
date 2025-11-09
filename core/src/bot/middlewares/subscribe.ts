import conf from "../../config/config";
import { get_last_payment } from "../../database/request/Payment";
import { user_is_auto_pay } from "../../database/request/PaymentMethod";
import { getTariff } from "../../database/request/User";
import { CURRENT_MESSAGE } from "../global/currentTariffMessage";
import { subscribeMurkap } from "../keyboards/subscribe";

export async function subscribe(ctx: any) {
  try {
    let user_tariff = await getTariff({ chat_id: ctx.chat.id });
    let next_pay = await get_last_payment({ chat_id: ctx.chat.id });
    let user_is_auto_paid = await user_is_auto_pay({ chat_id: ctx.chat.id });
    if (!next_pay.success) return ctx.reply(next_pay.message);

    if (!user_tariff.success) return ctx.reply(user_tariff.message);
    await ctx.reply(
      CURRENT_MESSAGE({
        Plan: user_tariff.payment_plan,
        Type: user_tariff.payment_type,
        LastPayment: next_pay.payment,
      }),
      { parse_mode: "HTML" }
    );
    await ctx.reply(
      `📦 <b>Доступные тарифы:</b>

1️⃣ <b>Free</b> - 0₽/мес
• 10 заявок в месяц
• Имя, Телефон
• 1 менеджер

2️⃣ <b>Start</b> - 199₽/мес
• 50 заявок в месяц
• <b>Free +</b> Почта, Адрес, Сообщение, Компания
• До 5 менеджеров

3️⃣ <b>Pro</b> - 499₽/мес
• 100 заявок в месяц  
• <b>Start +</b> Загрузка файлов
• До 10 менеджеров

4️⃣ <b>Enterprise</b> - 1499₽/мес
• Безлимитные заявки
• Все функции Pro
• Приоритетная поддержка
• Неограниченно менеджеров

💸 <b>Альтернатива:</b> Оплата за заявку
• ${conf.PRICE_PER_REQUEST} руб. / заявка
• Без фиксированных лимитов и подписок
• Только за поступившие заявки
• 1 менеджер
• Функции Pro

✨ <b>Попробуйте сейчас:</b> Пополните счёт на 100 руб. и получите 10 заявок.
Мы заранее уведомим, когда баланс будет подходить к концу.`,
      {
        parse_mode: "HTML",
        ...(user_is_auto_paid
          ? subscribeMurkap.firstWithAutoPayment
          : subscribeMurkap.first),
      }
    );
  } catch (error) {
    console.error(error);
    ctx.reply("Ошибка");
  }
}
