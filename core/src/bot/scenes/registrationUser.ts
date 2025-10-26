import { Markup, Scenes, Context } from "telegraf";
import { createUser } from "../../database/request/User";
import { Role } from "../../types/UserSchema";


interface RegistrationState {
  surname?: string;
  name?: string;
  code?: string;
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

const registrationManagerWizard = new Scenes.WizardScene<MyContext>(
  "registration_user",

  // Шаг 1: Ввод ФИО
  async (ctx: any) => {
    await cancelMiddleware(ctx);
    const code = ctx.scene.state.code;
    if (!code) {
      await ctx.reply("⚠️ Ошибка: код приглашения отсутствует.");
      return ctx.scene.leave();
    }
    await ctx.reply(
      `📝 *Регистрация сотрудника*\n\nВведите ваши *фамилию* и *имя*. Пример: _Иван Иванов_`,
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([["❌ Прекратить регистрацию"]]).resize(),
      }
    );

    return ctx.wizard.next();
  },

  // Шаг 2: Сохранение ФИО и регистрация
  async (ctx: any) => {
    await cancelMiddleware(ctx);

    const text = ctx.message?.text?.trim();
    if (!text || !text.includes(" ")) {
      await ctx.reply(
        "⚠️ Некорректный формат. Введите фамилию и имя через пробел, например: _Иван Иванов_",
        { parse_mode: "Markdown" }
      );
      return; // остаёмся на этом шаге
    }

    const [surname, ...nameParts] = text.split(" ");
    const name = nameParts.join(" ");

    ctx.wizard.state.surname = surname;
    ctx.wizard.state.name = name;

    const code = ctx.scene.state.code;
    if (!code) {
      await ctx.reply("⚠️ Ошибка: код приглашения отсутствует.");
      return ctx.scene.leave();
    }

    const result = await createUser({
      surname,
      name,
      role: Role.manager,
      chat_id: ctx.chat!.id,
      code,
      user_tag: ctx.from?.username || `id${ctx.from?.id}` || "unknown",
    });

    if (result.success) {
      await ctx.reply(result.message, {
        parse_mode: "Markdown",
      });
    } else {
      await ctx.reply(
        `⚠️ Регистрация не удалась: ${result.message}`,
        Markup.removeKeyboard()
      );
    }

    return ctx.scene.leave();
  }
);

export default registrationManagerWizard;
