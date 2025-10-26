import { Markup, Scenes, Context } from "telegraf";
import { createUser, editUser } from "../../database/request/User";
import { Role } from "../../types/UserSchema";
import { keyboard } from "telegraf/markup";
import { start } from "../keyboards/start";

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
  if (text === "❌ Прекратить редактирование") {
    await ctx.reply(
      "🚫 Редактирование отменено. Вы можете начать заново в любое время.",
      Markup.removeKeyboard()
    );
    return ctx.scene.leave();
  }
  return false;
};

const editUserWizard = new Scenes.WizardScene<MyContext>(
  "edit_user_fullname",

  // Шаг 1: Ввод ФИО
  async (ctx: any) => {
    await cancelMiddleware(ctx);
    await ctx.reply(
      `📝 *Редактирование сотрудника*\n\nВведите ваши *фамилию* и *имя*. Пример: _Иван Иванов_`,
      {
        parse_mode: "Markdown",
        ...Markup.keyboard([["❌ Прекратить редактирование"]]).resize(),
      }
    );

    return ctx.wizard.next();
  },

  // Шаг 2: Сохранение ФИО
  async (ctx: any) => {
    await cancelMiddleware(ctx);

    const text = ctx.message?.text?.trim();
    if (!text || !text.includes(" ")) {
      await ctx.reply(
        "⚠️ Некорректный формат. Введите фамилию и имя через пробел, например: _Иван Иванов_",
        { parse_mode: "Markdown" }
      );
      return;
    }

    const [surname, ...nameParts] = text.split(" ");
    const name = nameParts.join(" ");

    ctx.wizard.state.surname = surname;
    ctx.wizard.state.name = name;

    const result = await editUser({
      surname,
      name,
      chat_id: ctx.chat!.id,
    });

    await ctx.reply(
      result.message,
      result.success ? start.auth.manager : start.notAuth,
      {
        parse_mode: "HTML",
      }
    );

    return ctx.scene.leave();
  }
);

export default editUserWizard;
