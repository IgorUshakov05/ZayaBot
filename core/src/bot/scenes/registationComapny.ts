import path from "path";
import { join } from "./../../../node_modules/telegraf/src/core/helpers/formatting";
import { Markup, Scenes, Context } from "telegraf";
import { createCompanyAndUser } from "../../database/request/Company";

interface RegistrationState {
  title?: string;
  domain?: string;
}

type MyContext = Context &
  Scenes.WizardContext & {
    wizard: Scenes.WizardContextWizard<MyContext> & {
      state: RegistrationState;
    };
    message?: { text?: string };
  };

// --- Middleware для отмены регистрации ---
const cancelMiddleware = async (ctx: MyContext) => {
  const text = ctx.message?.text;
  if (text === "❌ Прекратить регистрацию") {
    await ctx.reply(
      "🚫 Регистрация отменена. Вы можете начать заново в любое время.",
      Markup.removeKeyboard()
    );
    return ctx.scene.leave();
  }
  return false;
};

// --- Сцена регистрации ---
const registrationWizard = new Scenes.WizardScene<MyContext>(
  "registration",

  // --- Шаг 1: Приветствие и ввод названия компании ---
  async (ctx) => {
    await ctx.reply(
      "🧾 Добро пожаловать в процесс регистрации вашей компании!\n\n" +
        "Регистрация состоит из 3 простых шагов:\n\n" +
        "1️⃣ Введите *название вашей компании*:",
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([["❌ Прекратить регистрацию"]]).resize(true),
      }
    );
    return ctx.wizard.next();
  },

  // --- Шаг 2: Проверка и сохранение названия ---
  async (ctx) => {
    if (await cancelMiddleware(ctx)) return;

    const title = ctx.message?.text?.trim();
    if (!title || title.length < 2) {
      await ctx.reply(
        "⚠️ Название компании слишком короткое. Пожалуйста, введите корректное название:"
      );
      return;
    }

    ctx.wizard.state.title = title;
    await ctx.reply(
      `Отлично! "*${title}*" — прекрасное название. 🎉\n\n` +
        "Теперь укажите домен вашего сайта (например: example.com):",
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([["❌ Прекратить регистрацию"]]).resize(true),
      }
    );

    return ctx.wizard.next();
  },

  // --- Шаг 3: Проверка и сохранение домена ---
  async (ctx) => {
    if (await cancelMiddleware(ctx)) return;

    const domain = ctx.message?.text?.trim();
    if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
      await ctx.reply(
        "⚠️ Пожалуйста, введите корректный домен (например: example.com)."
      );
      return;
    }

    ctx.wizard.state.domain = domain;
    await ctx.reply(
      `Домен *${domain}* успешно принят! ✅\n\n` +
        "Следующий шаг — получение документации для интеграции:\n" +
        "Вы можете скачать инструкцию и пример документации для вашего сайта.",
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["📄 Скачать документацию PDF"],
          ["❌ Прекратить регистрацию"],
        ]).resize(true),
      }
    );

    return ctx.wizard.next();
  },

  // --- Шаг 4: Завершение регистрации ---
  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;
    const text = ctx.message?.text?.trim();

    if (text === "📄 Скачать документацию PDF") {
      let createCompany = await createCompanyAndUser({
        user: {
          user_tag: ctx.from?.username as string,
          name: ctx.from?.first_name as string,
          chat_id: ctx.from.id,
        },
        company: {
          domain: ctx.wizard.state.domain,
          title: ctx.wizard.state.title,
        },
      });
      if (!createCompany.success) {
        await ctx.reply(createCompany.message);
        return ctx.scene.leave();
      }
      console.log(createCompany);
      await ctx.reply(
        "📌 Инструкция отправлена! После скачивания, пожалуйста, " +
          "отправьте тестовую заявку на вашем сайте, чтобы подтвердить домен " +
          "и проверить корректность работы. Тестовая заявка за наш счёт! ✅",
        {
          parse_mode: "Markdown",
          ...Markup.removeKeyboard(),
        }
      );
      await ctx.replyWithDocument({
        source: path.join(__filename),
        filename: "Документация.pdf",
      });

      return ctx.scene.leave();
    }

    await ctx.reply("Нажмите «✅ Заявка отправлена».");
  }
);

export default registrationWizard;
