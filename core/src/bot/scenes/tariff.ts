import { Markup, Scenes } from "telegraf";
import { create_pay } from "../../payment/payments.methods";
import { PaymentPlan, PaymentType, PricePlan } from "../../types/UserSchema";

interface TopupState {
  sum?: number;
}

type MyContext = Scenes.WizardContext & {
  wizard: Scenes.WizardContextWizard<MyContext> & {
    state: TopupState;
  };
  message?: { text?: string };
};

// --- Middleware для отмены пополнения ---
const cancelMiddleware = async (ctx: MyContext): Promise<boolean> => {
  const text = ctx.message?.text;
  if (text === "❌ Отменить действие") {
    await ctx.reply(
      "🚫 Оплата отменена. Вы можете начать заново в любое время.",
      Markup.removeKeyboard()
    );
    await ctx.scene.leave();
    return true;
  }
  return false;
};

// --- Основная сцена пополнения баланса ---
const toggleTariffWizard = new Scenes.WizardScene<MyContext>(
  "enter_tariff",

  // Шаг 2 — проверка суммы и переход к оплате
  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;

    let plan: PaymentPlan = ctx.scene.state.plan;
    if (plan === "START") {
      return ctx.scene.leave();
    }
    const { success, payment, message } = await create_pay(
      PricePlan[plan],
      ctx.chat.id,
      PaymentType.SUBSCRIPTION,
      plan
    );

    if (!success) {
      await ctx.reply(message, Markup.removeKeyboard());
      return ctx.scene.leave();
    }
    await ctx.reply(
      `💳 Перейдите для оплаты:`,
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            `Оплатить ${PricePlan[plan]} ₽`,
            payment?.confirmation.confirmation_url
          ),
        ],
      ])
    );

    return ctx.scene.leave();
  }
);

export default toggleTariffWizard;
