import { set_user_tariff } from './../database/request/User';
import { Types } from "mongoose";
import { create_auto_pay } from "./payments.methods";
import { IPaymentMethod } from "../types/PaymentMethodSchema";
import { AutoPayNotAllowed } from "../telegram/messages/subscriptionMessageSender";
import subscriptionMessageSender from "../telegram/api/api";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default async function payUsers(
  payments: IPaymentMethod[]
): Promise<{ success: boolean; message: string; processed: number; failed: number }> {
  try {
    if (payments.length === 0) {
      return { success: true, message: "Нет платежей для обработки", processed: 0, failed: 0 };
    }

    const usersWithoutSavedPay: number[] = [];
    let processedCount = 0;
    let failedCount = 0;

    console.log(`Начало обработки ${payments.length} платежей`);

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      
      // Задержка между обработкой платежей
      if (i > 0) {
        await delay(150); // Увеличиваем задержку для надежности
      }

      if (payment.user instanceof Types.ObjectId) {
        console.error("User not populated for payment:", payment._id);
        failedCount++;
        continue;
      }

      try {
        if (payment.saved) {
          console.log(`Обработка автоплатежа для пользователя ${payment.user.chat_id}`);
          
          const paymentResult = await create_auto_pay(
            payment.user.chat_id,
            payment.payment_method_id,
            payment.user.payment_plan
          );
          
          if (paymentResult.success) {
            processedCount++;
            console.log(`✓ Автоплатеж успешен для пользователя ${payment.user.chat_id}`);
          } else {
            failedCount++;
            usersWithoutSavedPay.push(payment.user.chat_id);
            console.log(`✗ Автоплатеж не удался для пользователя ${payment.user.chat_id}`);
          }
        } else {
          // Для пользователей без сохраненного платежа
          console.log(`Отправка уведомления пользователю ${payment.user.chat_id}`);
          
          const messageResult = await subscriptionMessageSender({
            chat_id: payment.user.chat_id,
            text: AutoPayNotAllowed(),
            parse_mode: "HTML",
          });
          
          if (messageResult.success) {
            console.log(`✓ Уведомление отправлено пользователю ${payment.user.chat_id}`);
          } else {
            console.log(`✗ Не удалось отправить уведомление пользователю ${payment.user.chat_id}`);
          }
          
          failedCount++;
          usersWithoutSavedPay.push(payment.user.chat_id);
        }
      } catch (error) {
        console.error(`Ошибка обработки пользователя ${payment.user.chat_id}:`, error);
        failedCount++;
        usersWithoutSavedPay.push(payment.user.chat_id);
      }
    }

    // Сбрасываем тариф для пользователей с неудачными платежами
    if (usersWithoutSavedPay.length > 0) {
      console.log(`Сброс тарифа для ${usersWithoutSavedPay.length} пользователей...`);
      const resetResult = await set_user_tariff(usersWithoutSavedPay);
      
      if (resetResult.success) {
        console.log(`✓ Тарифы сброшены для ${resetResult.updatedCount} пользователей`);
      } else {
        console.log(`✗ Ошибка при сбросе тарифов`);
      }
    }

    const successMessage = `Обработка завершена. Успешно: ${processedCount}, Неудачно: ${failedCount}`;
    console.log(successMessage);

    return { 
      success: true, 
      message: successMessage,
      processed: processedCount,
      failed: failedCount
    };

  } catch (error) {
    console.error("Критическая ошибка при проведении платежей:", error);
    return {
      success: false,
      message: "Ошибка сервера при проведении платежей",
      processed: 0,
      failed: payments.length
    };
  }
}