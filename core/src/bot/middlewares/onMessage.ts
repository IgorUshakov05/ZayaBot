import conf from "../../config/config";
import { getTariff } from "../../database/request/User";
import { PaymentPlan, PaymentType } from "../../types/UserSchema";
import { userTariffAction } from "../action/user.tariff";
import command_start from "../command/start";
import { analiticsMurkup } from "../keyboards/analitics";
import { applicationMurkup } from "../keyboards/application";
import { edit } from "../keyboards/edit";
import { managerInlineKeyBoard } from "../keyboards/managers";
import { subscribeMurkap } from "../keyboards/subscribe";
import newManager from "./addManager";
import notificationMessageEvent from "./notification";
import { replyMessag } from "./onReply";
import removeManager from "./removeManager";

// Обработчик сообщений
const messageHandle = async (ctx: any) => {
  const text = ctx.message.text;
  const reply_message = ctx.message?.reply_to_message;
  if (!!reply_message) {
    return await replyMessag(ctx);
  }
  if (!text) return;

  switch (text) {
    case "Регистрация в 3 этапа":
      ctx.scene.enter("registration");
      break;

    case "🏠 Главное меню":
      command_start(ctx);
      break;

    case "✏️ Изменить данные":
      ctx.reply("Какие данные вы хотите изменить?", edit.metadata);
      break;

    case "✏️ Изменить Фамилию и Имя":
      ctx.scene.enter("edit_user_fullname");
      break;

    case "➖ Удалить менеджера":
      removeManager(ctx);
      break;

    case "💰 Подписка":
      let user_tariff = await getTariff({ chat_id: ctx.chat.id });
      if (!user_tariff.success) return ctx.reply(user_tariff.message);
      let user_pay = userTariffAction({
        payment_plan: user_tariff.payment_plan,
        payment_type: user_tariff.payment_type,
      });

      await ctx.reply(
        `💰 <b>Текущий тариф: ${user_pay.title}</b>
📅 Действует до: 10.10.2025
📊 Лимит: ${
          user_tariff.payment_type === PaymentType.PER_REQUEST
            ? `Заявка / ${conf.PRICE_PER_REQUEST}₽`
            : `${user_pay.limit} заявок/месяц`
        }

🎯 <b>Доступные поля:</b>
${user_pay.allowedFields.map((item) => `✓ ${item}`).join("\n")}
👥 ${user_pay.managers} менеджер(ов) в системе

📦 <b>Доступные тарифы:</b>

1️⃣ <b>Free</b> - 0₽/мес
• 10 заявок в месяц
• Имя, Телефон
• 1 менеджер

2️⃣ <b>Start</b> - 199₽/мес
• 50 заявок в месяц
• <b>Free +</b> Почта, Адрес, Комментарий, Компания
• До 5 менеджеров

3️⃣ <b>Pro</b> - 499₽/мес
• 100 заявок в месяц  
• <b>Start +</b> Загрузка файлов
• До 10 менеджеров

4️⃣ <b>Enterprise</b> - 1499₽/мес
• Безлимитные заявки
• Все функции Pro
• Приоритетная поддержка
• Неограниченно менеджеров

💸 <b>Альтернатива:</b> Оплата за заявку
• ${conf.PRICE_PER_REQUEST} руб. / заявка
• Без фиксированных лимитов и подписок
• Только за поступившие заявки
• 1 менеджер
• Функции Pro

✨ <b>Попробуйте сейчас:</b> Пополните счёт на 100 руб. и получите 10 заявок.
Мы заранее уведомим, когда баланс будет подходить к концу.`,
        { parse_mode: "HTML", ...subscribeMurkap.first }
      );
      break;

    case "📋 Тариф":
      ctx.reply(
        `
📦 <b>Доступные тарифы:</b>

1️⃣ <b>Free</b> - 0₽
• Имя, Телефон
• 10 заявок/мес
• 1 менеджер

2️⃣ <b>Start</b> - 199₽
• <b>Free +</b> Почта, Адрес, Комментарий, Компания  
• 50 заявок/мес
• До 5 менеджеров

3️⃣ <b>Pro</b> - 499₽
• <b>Start +</b> Загрузка файлов
• 100 заявок/мес
• До 10 менеджеров

4️⃣ <b>Enterprise</b> - 1499₽
• Все поля и функции
• Безлимитные заявки
• Неограниченно менеджеров
• Приоритетная поддержка`,
        { parse_mode: "HTML", ...subscribeMurkap.subscribe }
      );
      break;
    case "➕ Добавить менеджера":
      newManager(ctx);
      break;

    case "💸 Плата за заявку":
      ctx.reply(
        `💸 *Плата за заявку*

📈 *Стоимость:* ${conf.PRICE_PER_REQUEST} руб. / заявка  
Вы оплачиваете *только поступившие заявки* — без фиксированных лимитов и подписок.  
• 1 менеджер
• Функции Pro

✨ *Попробуйте сейчас:* пополните счёт на *100 руб.* и получите *10 заявок*.  
Мы заранее уведомим, когда баланс будет подходить к концу.`,
        { parse_mode: "Markdown", ...subscribeMurkap.topup }
      );
      break;

    case "👥 Менеджеры":
      ctx.reply("👥 Управление менеджерами!\nЧто делаем?", managerInlineKeyBoard.first);
      break;

    case "📊 Аналитика":
      ctx.reply(
        "👥 Управление аналитикой!\nЧто делаем?",
        analiticsMurkup.first
      );
      break;

    case "📈 Заявки за период":
      ctx.reply(
        "📊 Выберите период, за который необходимо отобразить статистику заявок:",
        analiticsMurkup.period
      );
      break;

    case "📋 Заявки":
      ctx.reply(
        "📋 Управление заявками!\nЧто делаем?",
        applicationMurkup.first
      );
      break;

    case "🔔 Настроить уведомления":
      notificationMessageEvent(ctx);
      break;

    default:
      await ctx.telegram.deleteMessage(ctx.chat.id, ctx.message.message_id);
      break;
  }
};

export default messageHandle;
