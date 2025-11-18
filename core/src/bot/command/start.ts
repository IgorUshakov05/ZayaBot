import { Context, Markup } from "telegraf";
import { start } from "../keyboards/start";
import { checkUserRole } from "../../database/request/User";
import { Role } from "../../types/UserSchema";
import path from "path";

const command_start = async (
  ctx: Context & { chat: { id: number } } & { startPayload: string } & {
    scene: any;
  }
) => {
  const user_check = await checkUserRole({ chat_id: ctx.chat.id });

  if (!user_check.success) {
    return ctx.reply(user_check.message);
  }
  let code = ctx.startPayload;
  if (code) {
    ctx.scene.state.code = code;
    console.log(ctx.scene.state.code);
    await ctx.scene.enter("registration_user", { code });
    return;
  }
  if (user_check.newUser) {
    const message = `
👋 <b>Добро пожаловать в CRM-бот — ZayaBot!</b>  

Мы — ваш <i>помощник для автоматизации работы с заявками с сайта!</i> 🚀  
Наш бот помогает бизнесу легко собирать, обрабатывать и анализировать заявки, чтобы вы могли сосредоточиться на клиентах, а не на рутине.  

🔑 <b>Что мы умеем:</b>
📬 <b>Собираем заявки:</b> Подключите ваш сайт и получайте заявки прямо в Telegram. Тестовая заявка — бесплатно!  
👥 <b>Управляем менеджерами:</b> Назначайте роли, права и отслеживайте эффективность команды.  
💸 <b>Гибкие тарифы:</b> Бесплатный тариф (10 заявок/месяц) или оплата за заявку (10 руб./заявка). Выбирайте, что удобнее!  
📊 <b>Аналитика:</b> Следите за статистикой заявок и работой менеджеров в реальном времени.  
⚙️ <b>Простая интеграция:</b> Добавьте нашу библиотеку на сайт и начните за минуту.
`;

    return await ctx.reply(message, {
      parse_mode: "HTML",
      ...start.notAuth,
    });
  }

  switch (user_check.role) {
    case Role.director:
      if (user_check.test_company) {
        await ctx.reply(user_check.message);
        await ctx.reply(
          `📌 *Инструкция для внедрения!*  
Ваш API-ключ: \`${user_check.api_key}\`  

После внедрения отправьте тестовую заявку на сайте, чтобы подтвердить домен и проверить корректность работы. Тестовая заявка — за наш счёт! ✅  

Также, если при регистрации компании вы допустили ошибку в названии или домене, вы можете удалить компанию и создать её заново. ⚙️`,
          {
            parse_mode: "Markdown",
            ...start.auth.test_company,
          }
        );

        return await ctx.replyWithDocument({
          source: path.join(__dirname, '..', '..', 'media', 'Documentation.pdf'),
          filename: "Документация.pdf",
        });
      }
      // Директор с полноценной компанией — показать меню директора
      return ctx.reply(user_check.message, {
        parse_mode: "Markdown",
        ...start.auth.director,
      });

    case Role.manager:
      return ctx.reply(user_check.message, {
        ...start.auth.manager,
        parse_mode: "Markdown",
      });

    default:
      // Любая другая роль
      return ctx.reply(
        "⚠️ Ваша роль не определена. Обратитесь к администратору."
      );
  }
};

export default command_start;
