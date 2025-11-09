// Тарифный план Лимит заявок (мес)    Менеджеры     Поля и функции
// Free             до 10                 1           Имя + Телефон
// Start            до 50                 5    Free + Почта + Адрес + Коментарий + Компания
// Pro              до 100                10          Pro(Start + Файл)
// Enterprise       безлимит              ♾️               Pro

import conf from "../../config/config";
import { ApplicationData } from "../../types/Application";
import { PaymentPlan, PaymentType } from "./../../types/UserSchema";
import { tariffMessages } from "./messageTariffError";

// Конфигурация тарифных планов
export const TARIFF_CONFIG = {
  [PaymentPlan.FREE]: {
    limit: 10,
    allowedFields: ["name", "user_phone"] as (keyof ApplicationData)[],
  },
  [PaymentPlan.START]: {
    limit: 50,
    allowedFields: [
      "name",
      "user_phone",
      "user_post",
      "user_address",
      "message",
      "user_company",
    ] as (keyof ApplicationData)[],
  },
  [PaymentPlan.PRO]: {
    limit: 100,
    allowedFields: [
      "name",
      "user_phone",
      "user_post",
      "user_address",
      "message",
      "user_company",
      "file",
    ] as (keyof ApplicationData)[],
  },
  [PaymentPlan.ENTERPRISE]: {
    limit: Infinity,
    allowedFields: [
      "name",
      "user_phone",
      "user_post",
      "user_address",
      "message",
      "user_company",
      "file",
    ] as (keyof ApplicationData)[],
  },
} as const;

// Функция для получения количества дней до сброса счетчика (1 число следующего месяца)
export const getDaysUntilReset = (): number => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const diffTime = nextMonth.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const checkTariff = ({
  payment_type,
  payment_plan,
  application,
  countApplicationInMounth,
  balance,
}: {
  payment_type: PaymentType;
  payment_plan: PaymentPlan;
  application: ApplicationData;
  countApplicationInMounth: number;
  balance: number;
}):
  | { success: true; filtredApplication: ApplicationData }
  | { success: false; message: string } => {
  try {
      // Обработка оплаты по запросу
    if (payment_type === PaymentType.PER_REQUEST) {
      if (balance < conf.PRICE_PER_REQUEST) {
        return {
          success: false,
          message: tariffMessages.per_request(balance),
        };
      }

      return { success: true, filtredApplication: application };
    }
    if (payment_type === PaymentType.SUBSCRIPTION) {
      const config = TARIFF_CONFIG[payment_plan];

      if (countApplicationInMounth >= config.limit) {
        const daysUntilReset = getDaysUntilReset();
        let errorMessage = "";
        
        switch (payment_plan) {
          case PaymentPlan.FREE:
            errorMessage = tariffMessages.free(countApplicationInMounth, daysUntilReset);
            break;
          case PaymentPlan.START:
            errorMessage = tariffMessages.start(countApplicationInMounth, daysUntilReset);
            break;
          case PaymentPlan.PRO:
            errorMessage = tariffMessages.pro(countApplicationInMounth, daysUntilReset);
            break;
          default:
            errorMessage = `Превышен лимит заявок для тарифа ${payment_plan}. Лимит: ${config.limit} заявок в месяц`;
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }

      // Фильтрация полей в зависимости от тарифа
      const filtredApplication: ApplicationData = {};
      config.allowedFields.forEach((field) => {
        if (application[field] !== undefined) {
          filtredApplication[field] = application[field];
        }
      });
      return { success: true, filtredApplication };
    }

      // Если тип оплаты не распознан
    return {
      success: false,
      message: "Неизвестный тип оплаты",
    };
  } catch (error) {
    console.error("checkTariff error:", error);
    return { success: false, message: "Ошибка при проверке тарифа" };
  }
};