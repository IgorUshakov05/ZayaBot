import conf from "../../config/config";
import command_start from "../command/start";
import { analiticsMurkup } from "../keyboards/analitics";
import { applicationMurkup } from "../keyboards/application";
import { edit } from "../keyboards/edit";
import { managerInlineKeyBoard } from "../keyboards/managers";
import { subscribeMurkap } from "../keyboards/subscribe";
import newManager from "./addManager";
import { disableAutoPay } from "./disableAutoPay";
import getStatistiacManager from "./getTariffManager";
import notificationMessageEvent from "./notification";
import { replyMessag } from "./onReply";
import getRatingManager from "./ratingManagers";
import removeManager from "./removeManager";
import getAllApplication from "./showAllApplication";
import statusApplication from "./statusApplication";
import { subscribe } from "./subscribe";

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

    case "📊 Показать все":
      getAllApplication(ctx);
      break;

    case "👥 Эффективность менеджеров":
      getRatingManager(ctx);
      break;

    case "📥 Экспортировать":
      ctx.reply("Выберите формат экспорта:", applicationMurkup.formatExport);
      break;

    case "🔍 Статусы заявок":
      statusApplication(ctx);
      break;

    case "✏️ Изменить Фамилию и Имя":
      ctx.scene.enter("edit_user_fullname");
      break;

    case "➖ Удалить менеджера":
      removeManager(ctx);
      break;

    case "🏦 Отключить автопополнение":
      disableAutoPay(ctx);
      break;

    case "💰 Подписка":
      subscribe(ctx);
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
• <b>Free +</b> Почта, Адрес, Сообщение, Компания  
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
      ctx.reply(
        "👥 Управление менеджерами!\nЧто делаем?",
        managerInlineKeyBoard.first
      );
      break;

    case "📊 Аналитика":
      ctx.reply(
        "👥 Управление аналитикой!\nЧто делаем?",
        analiticsMurkup.first
      );
      break;

    case "📊 Статистика":
      getStatistiacManager(ctx);
      break;

    case "📋 Заявки":
      ctx.reply(
        "📋 Управление заявками!\nЧто делаем?",
        applicationMurkup.first
      );
      break;

    case "✏️ Редактировать менеджера":
      ctx.scene.enter("edit_manager_fullname");
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
