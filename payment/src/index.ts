import { connectDB } from "./database";
import { get_user_payment_methods } from "./database/request/PaymentMethod";
import { sendMessageUsersWithRateLimit } from "./telegram/spam";
import payUsers from "./payment/payUsers";
import cron from "node-cron";

const start = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(error);
  }
};

async function processPayments() {
  console.log(`🕒 Запуск ежедневной обработки: ${new Date().toISOString()}`);

  try {
    // За 2 дня до оплаты
    console.log("🔔 Уведомление за 2 дня до оплаты");
    let twoDays = await get_user_payment_methods(2);
    if (twoDays.success && twoDays.payments.length > 0) {
      await sendMessageUsersWithRateLimit(twoDays.payments, 2);
    }

    // За 1 день до оплаты
    console.log("🔔 Уведомление за 1 день до оплаты");
    let oneDay = await get_user_payment_methods(1);
    if (oneDay.success && oneDay.payments.length > 0) {
      await sendMessageUsersWithRateLimit(oneDay.payments, 1);
    }

    // В день оплаты
    console.log("💳 Обработка платежей в день оплаты");
    let today = await get_user_payment_methods(0);
    if (today.success && today.payments.length > 0) {
      await payUsers(today.payments);
    }

    console.log("✅ Ежедневная обработка завершена");
  } catch (error) {
    console.error("❌ Ошибка при ежедневной обработке:", error);
  }
}

cron.schedule("0 9 * * *", () => {
  console.log("⏰ Запуск по расписанию...");
  processPayments();
});
start();

setTimeout(() => {
  processPayments();
}, 1000);

console.log(
  "🚀 Планировщик запущен. Обработка будет выполняться ежедневно в 09:00"
);
