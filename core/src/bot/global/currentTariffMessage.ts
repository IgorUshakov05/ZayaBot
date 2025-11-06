import conf from "../../config/config";
import { PaymentType, PaymentPlan } from "../../types/UserSchema";

type CURRENT_MESSAGE_RETURN = {
  [PaymentType.SUBSCRIPTION]: {
    [PaymentPlan.FREE]: string;
    [PaymentPlan.START]: string;
    [PaymentPlan.PRO]: string;
    [PaymentPlan.ENTERPRISE]: string;
  };
  [PaymentType.PER_REQUEST]: string;
};
const CURRENT_MESSAGE = ({
  Type,
  Plan,
  Start
}: {
  Type: PaymentType;
  Plan: PaymentPlan;
  Start: Date
}): string => {
  const messages = {
    [PaymentType.SUBSCRIPTION]: {
      [PaymentPlan.FREE]: `💰 Ваш текущий тариф: FREE  

📅 Действует до: 10.10.2025  
📊 Лимит: 10 заявок/месяц  

🎯 Доступные поля:  
🔹 Имя  
🔹 Телефон  
👥 В системе: 1 менеджер`,
      [PaymentPlan.START]: "Стартовый тариф: расширенные возможности",
      [PaymentPlan.PRO]: "Профессиональный тариф: полный функционал",
      [PaymentPlan.ENTERPRISE]: "Корпоративный тариф: премиум решения",
    },
    [PaymentType.PER_REQUEST]: `💰 Текущий тариф: Плата за заявку
📅 Действует до: 10.10.2025
📊 Лимит: Заявка / ${conf.PRICE_PER_REQUEST}₽

🎯 Доступные поля:
🔹 Имя
🔹 Телефон
🔹 Почта
🔹 Адрес
🔹 Сообщение
🔹 Компания
🔹 Файл
👥 1 менеджер(ов) в системе
`,
  } as CURRENT_MESSAGE_RETURN;

  if (Type === PaymentType.SUBSCRIPTION) {
    return messages[PaymentType.SUBSCRIPTION][Plan];
  }

  return messages[PaymentType.PER_REQUEST];
};

