import { Markup, Scenes } from "telegraf";
import { create_pay } from "../../payment/payments.methods";
import { PaymentType } from "../../types/UserSchema";
import { getEmail, updateEmail } from "../../database/request/User";
import { start } from "../keyboards/start";

interface TopupState {
  sum?: number;
  email?: string;
}

const isValidEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

type MyContext = Scenes.WizardContext & {
  wizard: Scenes.WizardContextWizard<MyContext> & {
    state: TopupState;
  };
  message?: { text?: string };
};

// --- Middleware для отмены пополнения ---
const cancelMiddleware = async (ctx: MyContext): Promise<boolean> => {
  const text = ctx.message?.text;
  if (text === "❌ Отменить") {
    await ctx.reply(
      "❌ Пополнение отменено. Вы можете начать заново в любое время!",
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

  // Шаг 1 - Проверка email
  async (ctx: MyContext) => {
    if (await cancelMiddleware(ctx)) return;

    const chat_id = ctx.chat!.id;
    const emailFromBase = await getEmail(chat_id);

    if (emailFromBase.success && emailFromBase.email) {
      // Если email есть - сохраняем и переходим к запросу суммы
      ctx.wizard.state.email = emailFromBase.email;
      await ctx.reply(
        `👋 Нашли ваш email: ${emailFromBase.email}\n\n` +
          "Теперь давайте пополним баланс! 💰"
      );
      await ctx.reply(
        "💰 *Введите сумму для пополнения:*\n\n" +
          "💡 *Минимальная сумма:* 100 руб.\n" +
          "📈 *Максимальная сумма:* 150 000 руб.\n\n" +
          "Просто напишите число:",
        {
          parse_mode: "Markdown",
          ...Markup.keyboard([["❌ Отменить"]]).resize(),
        }
      );
      // Переходим к шагу запроса суммы (пропускаем шаг ввода email)
      return ctx.wizard.selectStep(2);
    }

    // Если email нет — запрашиваем
    await ctx.reply(
      "👋 Добро пожаловать в пополнение баланса! 💳\n\n" +
        "📧 Для начала укажите ваш email:\n" +
        "_(он нужен для отправки чеков и уведомлений)_",
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([["❌ Отменить"]])
          .oneTime()
          .resize(),
      }
    );
    return ctx.wizard.next();
  },

  // Шаг 2 - Ввод email (только если email не был найден)
  async (ctx: MyContext) => {
    if (await cancelMiddleware(ctx)) return;

    const text = ctx.message?.text?.trim();
    if (!text) {
      await ctx.reply("📧 Пожалуйста, введите ваш email:");
      return;
    }

    if (!isValidEmail(text)) {
      await ctx.reply(
        "❌ Это не похоже на email...\n\n" +
          "📧 Пожалуйста, введите корректный email:\n" +
          "_(например: ivan@mail.ru)_",
        {
          parse_mode: "Markdown",
          ...Markup.keyboard([["❌ Отменить"]])
            .oneTime()
            .resize(),
        }
      );
      return;
    }

    const chat_id = ctx.chat!.id;
    await updateEmail(chat_id, text);
    ctx.wizard.state.email = text;

    await ctx.reply(
      "✅ Отлично! Email сохранен!\n\n" + "Теперь давайте пополним баланс! 💰"
    );
    await ctx.reply(
      "💰 *Введите сумму для пополнения:*\n\n" +
        "💡 *Минимальная сумма:* 100 руб.\n" +
        "📈 *Максимальная сумма:* 150 000 руб.\n\n" +
        "Просто напишите число:",
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([["❌ Отменить"]]).resize(),
      }
    );
    // Переходим к шагу запроса суммы (пропускаем шаг ввода email)
    return ctx.wizard.selectStep(2);

    return ctx.wizard.next();
  },

  // Шаг 4 - Обработка суммы и создание платежа
  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;

    const email = ctx.wizard.state.email;
    if (!email) {
      await ctx.reply(
        "😕 Что-то пошло не так... Давайте начнем сначала!",
        Markup.removeKeyboard()
      );
      return ctx.wizard.selectStep(0);
    }

    const input = ctx.message?.text?.trim() ?? "";
    const sum = Number(input);

    // Проверка валидности числа
    if (!input || !Number.isFinite(sum) || sum <= 0) {
      await ctx.reply(
        "❌ Пожалуйста, введите корректное число\n\n" +
          "Например: *100*, *500*, *1000*",
        {
          parse_mode: "Markdown",
          ...Markup.keyboard([["❌ Отменить"]]).resize(),
        }
      );
      return;
    }

    if (sum < 100) {
      await ctx.reply(
        "❌ Слишком маленькая сумма\n\n" +
          "💡 Минимальная сумма пополнения — *100 руб.*\n" +
          "Попробуйте еще раз:",
        {
          parse_mode: "Markdown",
          ...Markup.keyboard([["❌ Отменить"]]).resize(),
        }
      );
      return;
    }

    if (sum > 150000) {
      await ctx.reply(
        "❌ Слишком большая сумма\n\n" +
          "💡 Максимальная сумма пополнения — *150 000 руб.*\n" +
          "Попробуйте еще раз:",
        {
          parse_mode: "Markdown",
          ...Markup.keyboard([["❌ Отменить"]]).resize(),
        }
      );
      return;
    }

    ctx.wizard.state.sum = sum;

    const waitMessage = await ctx.reply(
      `✅ Выбрана сумма: *${sum} руб.*\n\n` +
        "⏳ Создаем безопасную ссылку для оплаты...",
      { parse_mode: "Markdown" }
    );

    // Создание платежа
    const { success, payment, message } = await create_pay(
      sum,
      ctx.chat.id,
      PaymentType.PER_REQUEST,
      email
    );

    // Удаляем сообщение о ожидании
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, waitMessage.message_id);
    } catch (e) {
      // Игнорируем ошибки удаления
    }

    if (!success || !payment) {
      await ctx.reply(
        "😕 Не удалось создать платеж\n\n" +
          `Причина: *${message}*\n\n` +
          "Попробуйте позже или обратитесь в поддержку.",
        {
          parse_mode: "Markdown",
          ...Markup.removeKeyboard(),
        }
      );
      return ctx.scene.leave();
    }

    await ctx.reply(
      `✨ *Готово!* \n\n` +
        `📧 Ваш email: ${email}\n` +
        `💰 Сумма: *${sum} руб.*\n\n` +
        `Нажмите на кнопку ниже для перехода к безопасной оплате:`,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [
            Markup.button.url(
              `💳 Оплатить ${sum} ₽`,
              payment.confirmation.confirmation_url
            ),
          ],
        ]),
      }
    );

    await ctx.reply(
      "💡 *После успешной оплаты:*\n" +
        "• Баланс пополнится автоматически\n" +
        "• Чек придет на указанный email\n" +
        "• Если возникнут проблемы - обращайтесь в поддержку\n\n" +
        "Спасибо, что выбираете нас! ❤️",
      {
        parse_mode: "Markdown",
        ...start.auth.director,
      }
    );

    return ctx.scene.leave();
  }
);

export default topupBalanceWizard;
