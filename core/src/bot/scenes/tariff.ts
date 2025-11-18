import { Markup, Scenes } from "telegraf";
import { create_pay } from "../../payment/payments.methods";
import { PaymentPlan, PaymentType, PricePlan } from "../../types/UserSchema";
import { getEmail, updateEmail } from "../../database/request/User";
import { start } from "../keyboards/start";

interface TopupState {
  sum?: number;
}

type MyContext = Scenes.WizardContext & {
  wizard: Scenes.WizardContextWizard<MyContext> & {
    state: TopupState;
  };
  message?: { text?: string };
};

const cancelMiddleware = async (ctx: MyContext): Promise<boolean> => {
  const text = ctx.message?.text;
  if (text === "❌ Отменить") {
    await ctx.reply(
      "❌ Действие отменено. Если захотите попробовать снова - просто начните заново!",
      Markup.removeKeyboard()
    );
    await ctx.scene.leave();
    return true;
  }
  return false;
};

const toggleTariffWizard = new Scenes.WizardScene<MyContext>(
  "enter_tariff",

  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;

    let plan: PaymentPlan = ctx.scene.state.plan;

    if (plan === "FREE") {
      await ctx.reply("🎉 Отлично! Вы выбрали бесплатный тариф.");
      return ctx.scene.leave();
    }

    let post = await getEmail(ctx.chat.id);
    if (post.success && post.email) {
      // Если email уже есть, сразу переходим к созданию платежа
      ctx.scene.state.email = post.email.trim();

      const waitMessage = await ctx.reply("⏳ Создаем ссылку для оплаты...");
      await processPayment(ctx, waitMessage);
    } else {
      // Если email нет, запрашиваем его
      await ctx.reply(
        `📧 Для оформления подписки "${plan}" нам нужна ваша электронная почта\n\n` +
          `Пожалуйста, введите ваш email:`,
        Markup.keyboard([["❌ Отменить"]])
          .oneTime()
          .resize()
      );
      return ctx.wizard.next();
    }
  },

  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;

    let text = ctx.message.text.trim();

    if (
      !new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(text)
    ) {
      return ctx.reply(
        "📧 Это не похоже на email...\n\n" +
          "Пожалуйста, введите корректный email адрес:",
        Markup.keyboard([["❌ Отменить"]])
          .oneTime()
          .resize()
      );
    }

    await updateEmail(ctx.chat.id, text);
    ctx.scene.state.email = text;

    const waitMessage = await ctx.reply("✅ Email сохранен! Создаем платеж...");

    await processPayment(ctx, waitMessage);
  }
);

async function processPayment(ctx: any, waitMessage?: any) {
  let email = ctx.scene.state.email;
  let plan: PaymentPlan = ctx.scene.state.plan;

  if (plan === "FREE") {
    await ctx.reply("🎉 Вы успешно перешли на бесплатный тариф!");
    if (waitMessage) {
      try {
        await ctx.telegram.deleteMessage(ctx.chat.id, waitMessage.message_id);
      } catch (e) {}
    }
    return ctx.scene.leave();
  }

  const { success, payment, message } = await create_pay(
    PricePlan[plan],
    ctx.chat.id,
    PaymentType.SUBSCRIPTION,
    email,
    plan
  );

  if (waitMessage) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, waitMessage.message_id);
    } catch (e) {}
  }

  if (!success) {
    await ctx.reply(
      "😕 Не удалось создать платеж\n\n" +
        `Причина: ${message}\n\n` +
        "Попробуйте позже или обратитесь в поддержку.",
      Markup.removeKeyboard()
    );
    return ctx.scene.leave();
  }

  const price = PricePlan[plan];

  await ctx.reply(
    `✨ Готово! Ваш тариф: "${plan}"\n` +
      `💳 Сумма к оплате: ${price} ₽\n\n` +
      `Нажмите на кнопку ниже для перехода к безопасной оплате:`,
    Markup.inlineKeyboard([
      [
        Markup.button.url(
          `💳 Оплатить ${price} ₽`,
          payment?.confirmation.confirmation_url
        ),
      ],
    ])
  );

  await ctx.reply(
    "📝 После успешной оплаты подписка *активируется автоматически*.\n\n" +
      "Если возникнут проблемы - обращайтесь в поддержку!\n" +
      "Спасибо, что выбираете нас! ❤️",
    {
      parse_mode: "Markdown",
      ...start.auth.director,
    }
  );

  return ctx.scene.leave();
}

export default toggleTariffWizard;
