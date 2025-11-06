import { Markup, Scenes, Context } from "telegraf";
import {
  getManagers,
  editUser,
  editManager,
} from "../../database/request/User";
import { start } from "../keyboards/start";

interface EditSession extends Scenes.WizardSessionData {
  managerId?: number;
  tempSurname?: string;
  tempName?: string;
}

type MyWizardContext = Scenes.WizardContext<EditSession>;

const editManagerFullnameWizard = new Scenes.WizardScene<MyWizardContext>(
  "edit_manager_fullname",

  async (ctx: any) => {
    const result = await getManagers(ctx.chat!.id);
    if (!result.success) {
      await ctx.reply(`Ошибка: ${result.message}`);
      return ctx.scene.leave();
    }

    const managers = result.managers;
    if (managers.length === 0) {
      await ctx.reply("Менеджеров нет.");
      return ctx.scene.leave();
    }

    const keyboard = Markup.inlineKeyboard(
      managers.map((m) =>
        Markup.button.callback(
          `${m.surname || ""} ${m.name}`.trim(),
          `select_${m._id}`
        )
      ),
      { columns: 1 }
    );

    let message = await ctx.reply(
      "Выберите менеджера чтобы изменить <b>фамилию и имя</b>:",
      {
        parse_mode: "HTML",
        ...keyboard,
      }
    );
    ctx.wizard.state.messageId = await message.message_id;
    return ctx.wizard.next();
  },

  async (ctx: any) => {
    const query = ctx.callbackQuery;
    if (query?.data?.startsWith("select_")) {
      let lastMessageId = ctx.wizard.state.messageId;
      await ctx.telegram.deleteMessage(ctx.chat.id, lastMessageId);

      await ctx.answerCbQuery();
      const managerId = query.data.split("_")[1];
      ctx.wizard.state.managerId = managerId;
      let message = await ctx.reply(
        "Введите новые Фамилию и Имя:",
        Markup.keyboard(["Отмена"]).resize()
      );
      ctx.wizard.state.messageId = await message.message_id;
      return ctx.wizard.next();
    }
    return ctx.wizard.next();
  },
  async (ctx: any) => {
    const text = ctx.message?.text?.trim();
    if (!text || !text.includes(" ")) {
      await ctx.reply(
        "⚠️ Некорректный формат. Введите фамилию и имя через пробел, например: _Иван Иванов_",
        { parse_mode: "Markdown" }
      );
      return;
    }
    const managerId = ctx.wizard.state.managerId;

    const [surname, ...nameParts] = text.split(" ");
    const name = nameParts.join(" ");

    ctx.wizard.state.surname = surname;
    ctx.wizard.state.name = name;
    let updateManager = await editManager({
      user_id: managerId,
      surname,
      name,
    });
    if (!updateManager.success) return ctx.reply(updateManager.message);
    let lastMessageId = ctx.wizard.state.messageId;
    await ctx.telegram.deleteMessage(ctx.chat.id, lastMessageId);

    // Красивое сообщение об изменении менеджера
    const oldFullName = `${updateManager.surname || ''} ${updateManager.name || ''}`.trim();
    const newFullName = `${surname} ${name}`.trim();
    
    const successMessage = `
✅ <b>Данные менеджера успешно обновлены!</b>

📋 <b>Было:</b> <code>${oldFullName}</code>
🔄 <b>Стало:</b> <code>${newFullName}</code>

📝 <b>Изменения:</b>
• Фамилия: <code>${updateManager.surname || 'не указана'}</code> → <code>${surname}</code>
• Имя: <code>${updateManager.name || 'не указано'}</code> → <code>${name}</code>

💫 Данные успешно сохранены в системе.
    `.trim();

    await ctx.reply(successMessage, {
      parse_mode: "HTML",
      ...start.auth.director
    });
    return ctx.scene.leave();
  }
);

// Универсальная отмена
editManagerFullnameWizard.use(async (ctx, next) => {
  const text = (ctx.message as any)?.text;
  if (text === "Отмена" || text === "/cancel") {
    await ctx.reply("Действие отменено.", start.auth.director);
    return ctx.scene.leave();
  }
  return next();
});

export default editManagerFullnameWizard;