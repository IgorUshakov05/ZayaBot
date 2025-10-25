import conf from "../../config/config";
import { PaymentPlan, PaymentType } from "../../types/UserSchema";

export const TARIFF_CONFIG = {
  [PaymentType.PER_REQUEST]: {
    limit: 1,
    allowedFields: [
      "Имя",
      "Телефон",
      "Почта",
      "Адрес",
      "Сообщение",
      "Компания",
      "Файл",
    ],
    managers: 1,
  },
  [PaymentPlan.FREE]: {
    limit: 10,
    allowedFields: ["Имя", "Телефон"],
    managers: 1,
  },
  [PaymentPlan.START]: {
    limit: 50,
    allowedFields: [
      "Имя",
      "Телефон",
      "Почта",
      "Адрес",
      "Сообщение",
      "Компания",
    ],
    managers: 5,
  },
  [PaymentPlan.PRO]: {
    limit: 100,
    allowedFields: [
      "Имя",
      "Телефон",
      "Почта",
      "Адрес",
      "Сообщение",
      "Компания",
      "Файл",
    ],
    managers: 10,
  },
  [PaymentPlan.ENTERPRISE]: {
    limit: "Неограничено",
    allowedFields: [
      "Имя",
      "Телефон",
      "Почта",
      "Адрес",
      "Сообщение",
      "Компания",
      "Файл",
    ],
    managers: "Неограничено",
  },
} as const;
type TariffInfo = {
  title: string;
  limit: string | number;
  allowedFields: readonly string[];
  managers: string | number;
};

export const userTariff = ({
  payment_plan,
  payment_type,
}: {
  payment_plan: PaymentPlan;
  payment_type: PaymentType;
}): TariffInfo => {
  if (payment_type === PaymentType.PER_REQUEST) {
    return {
      title: 'Плата за заявку',
      managers: TARIFF_CONFIG[payment_type].managers,
      allowedFields: TARIFF_CONFIG[payment_type].allowedFields,
      limit: TARIFF_CONFIG[payment_type].limit,
    };
  }
  return {
    title: payment_plan,
    managers: TARIFF_CONFIG[payment_plan].managers,
    allowedFields: TARIFF_CONFIG[payment_plan].allowedFields,
    limit: TARIFF_CONFIG[payment_plan].limit,
  };
};
