import { Markup, Scenes } from "telegraf";
import { create_pay } from "../../payment/payments.methods";
import { PaymentType } from "../../types/UserSchema";

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
      "🚫 Пополнение отменено. Вы можете начать заново в любое время.",
      Markup.removeKeyboard()
    );
    await ctx.scene.leave();
    return true;
  }
  return false;
};

// --- Основная сцена пополнения баланса ---
const topupBalanceWizard = new Scenes.WizardScene<MyContext>(
  "topup_balance",

  // Шаг 1 — запрос суммы
  async (ctx) => {
    await ctx.reply("💰 *Введите сумму, на которую хотите пополнить баланс:*", {
      parse_mode: "Markdown",
      ...Markup.keyboard([["❌ Отменить действие"]]).resize(),
    });
    return ctx.wizard.next();
  },

  // Шаг 2 — проверка суммы и переход к оплате
  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;

    const input = ctx.message?.text?.trim() ?? "";
    const sum = Number(input);

    // Проверка валидности числа
    if (!Number.isFinite(sum) || sum <= 0) {
      await ctx.reply("⚠️ Введите корректное число (например, 100).");
      return;
    }

    if (sum < 100) {
      await ctx.reply("⚠️ Минимальная сумма пополнения — 100 руб.");
      return;
    }
    if (sum > 150000) {
      await ctx.reply("⚠️ Максимальная сумма пополнения — 150 000 руб.");
      return;
    }

    ctx.wizard.state.sum = sum;

    await ctx.reply(
      `✅ Вы указали сумму *${sum} руб.*  
Теперь создаётся ссылка на оплату...`,
      {
        parse_mode: "Markdown",
        ...Markup.removeKeyboard(),
      }
    );

    // Здесь можно вставить логику генерации ссылки через YooKassa API:
    const { success, payment, message } = await create_pay(
      sum,
      ctx.chat.id,
      PaymentType.PER_REQUEST
    );
    console.log(payment);
    if (!success) {
      await ctx.reply(message, Markup.removeKeyboard());
      return ctx.scene.leave();
    }
    await ctx.reply(
      `💳 Перейдите для оплаты:`,
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            `Оплатить ${sum} ₽`,
            payment?.confirmation.confirmation_url
          ),
        ],
      ])
    );

    return ctx.scene.leave();
  }
);

export default topupBalanceWizard;
