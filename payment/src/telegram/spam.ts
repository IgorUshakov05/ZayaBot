import { Types } from "mongoose";
import { PricePlan } from "../types/UserSchema";
import {
  NotWillBeAutoPay,
  willBeAutoPay,
} from "./messages/subscriptionMessageSender";
import subscriptionMessageSender from "./api/api";
import { IPaymentMethod } from "../types/PaymentMethodSchema";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function sendMessageUsersWithRateLimit(
  payments: IPaymentMethod[],
  toDay: 1 | 2,
  delayMs: number = 200 
) {
  if (payments.length === 0) {
    console.log("Нет пользователей для отправки сообщений");
    return [];
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  console.log(`Начало отправки сообщений для ${payments.length} пользователей`);

  for (let i = 0; i < payments.length; i++) {
    const payment = payments[i];
    
    // Проверяем, что пользователь загружен (без throw)
    if (payment.user instanceof Types.ObjectId) {
      console.error(`Пользователь не загружен для индекса ${i}`);
      results.push({ 
        success: false, 
        chat_id: null, 
        error: "User not populated" 
      });
      failCount++;
      continue;
    }

    try {
      let message: string;
      if (payment.saved) {
        const amount = PricePlan[payment.user.payment_plan];
        message = await willBeAutoPay(toDay, amount);
      } else {
        message = await NotWillBeAutoPay(toDay);
      }

      const result = await subscriptionMessageSender({
        chat_id: payment.user.chat_id,
        text: message,
        parse_mode: "HTML",
      });

      if (result.success) {
        results.push({ 
          success: true, 
          chat_id: payment.user.chat_id, 
          result 
        });
        successCount++;
      } else {
        results.push({ 
          success: false, 
          chat_id: payment.user.chat_id, 
          error: result.error 
        });
        failCount++;
      }

      if (i < payments.length - 1 && delayMs > 0) {
        await delay(delayMs);
      }

    } catch (error) {
      console.error(
        `Критическая ошибка отправки пользователю ${payment.user.chat_id}:`,
        error
      );
      results.push({ 
        success: false, 
        chat_id: payment.user.chat_id, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      failCount++;
    }
  }

  console.log(`\n=== ИТОГИ ОТПРАВКИ ===`);
  console.log(`Всего пользователей: ${payments.length}`);
  console.log(`Успешно отправлено: ${successCount}`);
  console.log(`Не удалось отправить: ${failCount}`);
  console.log(`Процент успеха: ${((successCount / payments.length) * 100).toFixed(1)}%`);

  return results;
}