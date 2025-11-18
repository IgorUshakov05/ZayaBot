import path from "path";
import { Markup, Scenes, Context } from "telegraf";
import {
  createCompanyAndUser,
  delete_company,
} from "../../database/request/Company";
import { registrationCompany } from "../keyboards/registrationCompany";

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

// --- Middleware для отмены регистра ции ---
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
    if (await cancelMiddleware(ctx)) return;
    await ctx.reply(
      "🧾 Добро пожаловать в процесс регистрации вашей компании!\n\n" +
        "Регистрация состоит из 3 простых шагов:\n\n" +
        "1️⃣ Введите *название вашей компании*:",
      {
        parse_mode: "Markdown",
        ...registrationCompany.cancel,
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

    ctx.wizard.state.title = await title;
    await ctx.reply(
      `Отлично! "*${title}*" — прекрасное название. 🎉\n\n` +
        "Теперь укажите домен вашего сайта (например: example.com):",
      {
        parse_mode: "Markdown",
        ...registrationCompany.cancel,
      }
    );

    return ctx.wizard.next();
  },

  // --- Шаг 3: Проверка и сохранение домена ---
  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;

    const domain = ctx.message?.text?.trim();
    if (
      !domain ||
      !/^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9\u00A1-\uFFFF](?:[a-zA-Z0-9\u00A1-\uFFFF-]{0,61}[a-zA-Z0-9\u00A1-\uFFFF])?\.)+[a-zA-Z\u00A1-\uFFFF]{2,}$/u.test(
        domain
      )
    ) {
      await ctx.reply(
        "⚠️ Похоже, домен введён некорректно. Пожалуйста, укажите домен в формате example.com"
      );
      return;
    }

    ctx.wizard.state.domain = domain;
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
    ctx.wizard.state.api_key = await createCompany.company?.api_key;
    console.log(createCompany);
    await ctx.reply(
      `Домен *${domain}* успешно принят! ✅\n\n` +
        "Следующий шаг — получение документации для интеграции:\n" +
        "Вы можете скачать инструкцию и пример документации для вашего сайта.",
      {
        parse_mode: "Markdown",
        ...registrationCompany.finally,
      }
    );

    return ctx.wizard.next();
  },

  // --- Шаг 4: Завершение регистрации ---
  async (ctx: any) => {
    if (await cancelMiddleware(ctx)) return;
    const text = ctx.message?.text?.trim();
    console.log(ctx.wizard.state.api_key, " - апи ключ");
    if (text === "📄 Скачать документацию PDF") {
      await ctx.reply(
        `📌 *Инструкция отправлена!*
Ваш API-ключ: \`${ctx.wizard.state.api_key}\`
После внедрения, отправьте тестовую заявку на сайте, чтобы подтвердить домен и проверить корректность работы. Тестовая заявка за наш счёт! ✅`,
        {
          parse_mode: "Markdown",
          ...Markup.removeKeyboard(),
        }
      );
      await ctx.replyWithDocument({
        source: path.join(__dirname, "..", "..", "media", "Documentation.pdf"),

        filename: "Документация.pdf",
      });

      return ctx.scene.leave();
    }
    if (text === "❌ Удалить компанию") {
      let delete_request = await delete_company({
        chat_id: ctx.from.id,
        test: true,
      });
      await ctx.reply(delete_request.message, {
        parse_mode: "Markdown",
        ...Markup.removeKeyboard(),
      });
      return ctx.scene.leave();
    }
  }
);

export default registrationWizard;
