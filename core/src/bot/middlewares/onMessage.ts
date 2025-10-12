import command_start from "../command/start";
import { analiticsMurkup } from "../keyboards/analitics";
import { applicationMurkup } from "../keyboards/Application";
import { managerMurkup } from "../keyboards/managers";
import { subscribeMurkap } from "../keyboards/subscribe";
import newManager from "./addManager";

// Обработчик сообщений
const messageHandle = async (ctx: any) => {
  const text = ctx.message.text;

  if (!text) return;

  switch (text) {
    case "Регистрация в 3 этапа":
      ctx.scene.enter("registration");
      break;

    case "🏠 Главное меню":
      command_start(ctx);
      break;

    case "💰 Подписка":
      ctx.reply(
        `💰 Текущий тариф: Бесплатный  
(10 заявок/месяц, до 10.10.2025)

📦 Доступные тарифы:

1️⃣ Start — включает: Имя, Телефон  
2️⃣ Pro — включает: +Компания, Почта, Файл  
3️⃣ Enterprise — включает: +Адрес, Комментарий, Расширенная аналитика

💸 Плата за заявку: 10 руб. / заявка  
Вы оплачиваете только поступившие заявки — без фиксированных лимитов и подписок.

✨ Попробуйте сейчас: пополните счёт на 100 руб. и получите 10 заявок.
Мы заранее уведомим, когда баланс будет подходить к концу.
`,
        subscribeMurkap.first
      );
      break;

    case "📋 Тариф":
      ctx.reply(
        `💰 *Текущий тариф:* Бесплатный  
(10 заявок/месяц, до 10.10.2025)

📦 *Доступные тарифы:*
1️⃣ *Start — 0₽* — включает: Имя, Телефон  
2️⃣ *Pro — 499₽* — включает: +Компания, Почта, Файл  
3️⃣ *Enterprise — 1499₽* — включает: +Адрес, Комментарий, Расширенная аналитика
`,
        { parse_mode: "Markdown", ...subscribeMurkap.subscribe }
      );
      break;

    case "➕ Добавить менеджера":
      newManager(ctx);
      break;
    case "💸 Плата за заявку":
      ctx.reply(
        `💸 *Плата за заявку*

📈 *Стоимость:* 10 руб. / заявка  
Вы оплачиваете *только поступившие заявки* — без фиксированных лимитов и подписок.  

✨ *Попробуйте сейчас:* пополните счёт на *100 руб.* и получите *10 заявок*.  
Мы заранее уведомим, когда баланс будет подходить к концу.`,
        { parse_mode: "Markdown", ...subscribeMurkap.topup }
      );
      break;

    case "👥 Менеджеры":
      ctx.reply("👥 Управление менеджерами!\nЧто делаем?", managerMurkup.first);
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

    default:
      await ctx.reply("Пожалуйста, используйте кнопки.");
      break;
  }
};

export default messageHandle;
