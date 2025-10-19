import conf from "../../config/config";
import { PaymentPlan } from "../../types/UserSchema";

export const tariffMessages = {
  free: (
    currentCount: number,
    daysUntilReset: number
  ) => `🚫 <b>Превышен лимит тарифа Free</b>

📊 <b>Текущий тариф:</b> Free
📈 <b>Использовано заявок:</b> ${currentCount}/10
📉 <b>Статус:</b> Лимит исчерпан

⚠️ <b>Ограничения тарифа Free:</b>
• До 10 заявок в месяц
• Только поля: Имя и Телефон
• 1 менеджер в системе

💡 <b>Рекомендации:</b>
• Удалите неактуальные заявки
• Перейдите на тариф Start (50 заявок)
• Или дождитесь сброса 1 числа

🔄 <b>Сброс счетчика:</b> через ${daysUntilReset} дней

📞 <b>Контакты:</b> @support`,

  start: (
    currentCount: number,
    daysUntilReset: number
  ) => `🚫 <b>Превышен лимит тарифа Start</b>

📊 <b>Текущий тариф:</b> Start
📈 <b>Использовано заявок:</b> ${currentCount}/50
📉 <b>Статус:</b> Лимит исчерпан

🎯 <b>Возможности тарифа Start:</b>
• До 50 заявок в месяц
• Все основные поля данных
• До 5 менеджеров

💡 <b>Варианты решения:</b>
• Удалите старые заявки
• Перейдите на тариф Pro (100 заявок)
• Активьте безлимитный Enterprise

🔄 <b>Сброс счетчика:</b> через ${daysUntilReset} дней

📞 <b>Помощь:</b> @support`,

  pro: (
    currentCount: number,
    daysUntilReset: number
  ) => `🚫 <b>Превышен лимит тарифа Pro</b>

📊 <b>Текущий тариф:</b> Pro
📈 <b>Использовано заявок:</b> ${currentCount}/100
📉 <b>Статус:</b> Лимит исчерпан

⚡ <b>Преимущества тарифа Pro:</b>
• До 100 заявок в месяц
• Все поля + загрузка файлов
• До 10 менеджеров

💡 <b>Что делать:</b>
• Очистите архив заявок
• Перейдите на Enterprise (безлимит)
• Оптимизируйте workflow

🏆 <b>Enterprise включает:</b>
• Безлимитные заявки
• Все функции системы
• Приоритетная поддержка

🔄 <b>Сброс счетчика:</b> через ${daysUntilReset} дней

📞 <b>Консультация:</b> @sales_manager`,

  per_request: (balance: number) => `💰 <b>Недостаточно средств</b>

📊 <b>Тип оплаты:</b> За каждую заявку
💳 <b>Текущий баланс:</b> ${balance} ₽
🎯 <b>Требуется:</b> ${conf.PRICE_PER_REQUEST} ₽ за заявку

💡 <b>Как пополнить:</b>
1. Перейдите в раздел "Баланс"
2. Выберите сумму пополнения
3. Оплатите удобным способом

⚡ <b>Альтернатива:</b>
• Перейдите на подписку
• Выберите подходящий тариф
• Получите фиксированную стоимость

📊 <b>Тарифы:</b>
• Free - 10 заявок бесплатно
• Start - 50 заявок за 500 ₽/мес
• Pro - 100 заявок за 900 ₽/мес

📞 <b>Помощь с оплатой:</b> @billing_support`,

  low_balance: (
    payment_plan: PaymentPlan,
    currentCount: number,
    limit: number,
    daysUntilReset: number
  ) => `⚠️ <b>Внимание! Скоро исчерпан лимит</b>

📊 <b>Тариф:</b> ${payment_plan}
📈 <b>Использовано:</b> ${currentCount}/${limit} заявок
🎯 <b>Осталось:</b> ${limit - currentCount} заявок

💡 <b>Рекомендуем:</b>
• Контролируйте количество заявок
• Рассмотрите переход на следующий тариф
• Или дождитесь сброса 1 числа

🔄 <b>Сброс через:</b> ${daysUntilReset} дней

⚡ <b>Следующий тариф:</b>
• ${getNextTariffInfo(payment_plan)}

📞 <b>Консультация:</b> @manager`,
};
const getNextTariffInfo = (currentPlan: PaymentPlan): string => {
  switch (currentPlan) {
    case PaymentPlan.FREE:
      return "Start - 50 заявок, все основные поля, до 5 менеджеров";
    case PaymentPlan.START:
      return "Pro - 100 заявок, все поля + файлы, до 10 менеджеров";
    case PaymentPlan.PRO:
      return "Enterprise - безлимитные заявки, все функции, приоритетная поддержка";
    default:
      return "Индивидуальные условия";
  }
};
