import conf from "../../config/config";
import { IPayment } from "../../types/PaymentShcema";
import { PaymentType, PaymentPlan } from "../../types/UserSchema";
import { userTariffAction } from "../action/user.tariff";
import { addMonths, parseISO } from "date-fns";
import { formatHuman } from "./formatHuman";

type CURRENT_MESSAGE_RETURN = {
  [PaymentType.SUBSCRIPTION]: {
    [PaymentPlan.FREE]: string;
    [PaymentPlan.START]: string;
    [PaymentPlan.PRO]: string;
    [PaymentPlan.ENTERPRISE]: string;
  };
  [PaymentType.PER_REQUEST]: string;
};
export const CURRENT_MESSAGE = ({
  Type,
  Plan,
  LastPayment,
}: {
  Type: PaymentType;
  Plan: PaymentPlan;
  LastPayment: IPayment | undefined;
}): string => {
  let user_pay = userTariffAction({
    payment_plan: Plan,
    payment_type: Type,
  });
  let expirationDate;
  let humanDate;
  if (!!LastPayment) {
    expirationDate = addMonths(new Date(LastPayment.createdAt), 1);
    humanDate = formatHuman(new Date(expirationDate));
  }
  const messages = {
    [PaymentType.SUBSCRIPTION]: {
      [PaymentPlan.FREE]: `💰 Ваш текущий тариф: FREE  

📊 Лимит: ${user_pay.limit} заявок/месяц

🎯 Доступные поля:
${user_pay.allowedFields.map((item) => `🔹 ${item}`).join("\n")}
👥 ${user_pay.managers} менеджер(ов) в системе`,

      [PaymentPlan.START]: `<b>START: расширенные возможности</b>

📊 Лимит: ${user_pay.limit} заявок/месяц
💸 Следующий платеж: <b>${humanDate}</b>

<b>🎯 Доступные поля:</b>
${user_pay.allowedFields.map((item) => `🔹 ${item}`).join("\n")}
👥 ${user_pay.managers} менеджер(ов) в системе
`,
      [PaymentPlan.PRO]: `<b>PRO: полный функционал</b>

📊 Лимит: ${user_pay.limit} заявок/месяц
💸 Следующий платеж: <b>${humanDate}</b>

<b>🎯 Доступные поля:</b>
${user_pay.allowedFields.map((item) => `🔹 ${item}`).join("\n")}
👥 ${user_pay.managers} менеджер(ов) в системе
`,
      [PaymentPlan.ENTERPRISE]: `<b>ENTERPRISE: премиум решения</b>

📊 Лимит: ${user_pay.limit} заявок/месяц
💸 Следующий платеж: <b>${humanDate}</b>

<b>🎯 Доступные поля:</b>
${user_pay.allowedFields.map((item) => `🔹 ${item}`).join("\n")}
👥 ${user_pay.managers} менеджер(ов) в системе`,
    },
    [PaymentType.PER_REQUEST]: `<b>💰 Текущий тариф: Плата за заявку</b>

📊 Лимит: Заявка / ${conf.PRICE_PER_REQUEST}₽

<b>🎯 Доступные поля:</b>
${user_pay.allowedFields.map((item) => `🔹 ${item}`).join("\n")}
👥 ${user_pay.managers} менеджер(ов) в системе
`,
  } as CURRENT_MESSAGE_RETURN;

  if (Type === PaymentType.SUBSCRIPTION) {
    return messages[PaymentType.SUBSCRIPTION][Plan];
  }

  return messages[PaymentType.PER_REQUEST];
};
