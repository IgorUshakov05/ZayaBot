import { Context } from "telegraf";
import { managerInlineKeyBoard } from "../keyboards/managers";
import { get_statistic_manager } from "../../database/request/Application";

// Функция для создания прогресс-бара
const createProgressBar = (current: number, previous: number): string => {
  if (previous === 0) return '🟢 Новый месяц!';
  
  const percentage = Math.round((current / previous) * 100);
  const progress = Math.min(Math.max(percentage / 10, 0), 10);
  
  const filled = '█'.repeat(Math.floor(progress));
  const empty = '░'.repeat(10 - Math.floor(progress));
  
  return `${filled}${empty} ${percentage}%`;
};

// Функция для получения иконки тренда
const getTrendIcon = (current: number, previous: number): string => {
  if (previous === 0) return '🆕';
  if (current > previous) return '📈';
  if (current < previous) return '📉';
  return '➡️';
};

// Функция для получения текста прогресса
const getProgressText = (current: number, previous: number): string => {
  if (previous === 0) return 'Первый месяц работы!';
  
  const difference = current - previous;
  const percentage = Math.round((difference / previous) * 100);
  
  if (difference > 0) {
    return `+${difference} (+${percentage}%) к прошлому месяцу`;
  } else if (difference < 0) {
    return `${difference} (${percentage}%) к прошлому месяцу`;
  } else {
    return 'Стабильные результаты';
  }
};

export default async function getStatistiacManager(
  ctx: Context & { chat: { id: number } }
) {
  try {
    let chat_id = ctx.chat?.id;
    let stats = await get_statistic_manager({ chat_id });
    
    if (!stats.success) {
      return ctx.reply(stats.message, managerInlineKeyBoard.errorAddManager);
    }

    // Получаем данные за предыдущий месяц (нужно добавить в функцию get_statistic_manager)
    // Пока используем mock данные для примера
    const previousMonthApplications = 0; // Здесь должен быть реальный запрос к БД

    const trendIcon = getTrendIcon(stats.monthCompliteApplications, previousMonthApplications);
    const progressBar = createProgressBar(stats.monthCompliteApplications, previousMonthApplications);
    const progressText = getProgressText(stats.monthCompliteApplications, previousMonthApplications);

    await ctx.reply(
      `📊 <b>Статистика менеджера</b>
━━━━━━━━━━━━━━━━━━━━

🎯 <b>Текущий месяц</b>
┣ ${trendIcon} Завершённых заявок: <b>${stats.monthCompliteApplications}</b>
┗ 📊 Прогресс: ${progressText}

${progressBar}

🏆 <b>Общие достижения</b>
┗ Всего выполнено: <b>${stats.allCompliteApplications}</b> заявок

💫 Продолжайте в том же духе!`,
      {
        parse_mode: "HTML",
        reply_markup: managerInlineKeyBoard.errorAddManager.reply_markup,
      }
    );
  } catch (error) {
    console.error(error);
    return ctx.reply("Ошибка сервера!", managerInlineKeyBoard.errorAddManager);
  }
}