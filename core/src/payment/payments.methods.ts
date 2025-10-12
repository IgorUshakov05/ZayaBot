import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import conf from "../config/config";
import { PaymentPlan, PaymentType } from "../types/UserSchema";
export interface PaymentData {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  amount: {
    value: string; // значение суммы в строке, т.к. API возвращает строку
    currency: "RUB" | "USD" | "EUR";
  };
  description: string;
  recipient: {
    account_id: string;
    gateway_id: string;
  };
  created_at: string; // ISO-строка даты
  confirmation: {
    type: "redirect";
    confirmation_url: string;
  };
  test: boolean;
  paid: boolean;
  refundable: boolean;
  metadata?: {
    chat_id?: string | number;
    [key: string]: any; // если в будущем будут другие кастомные поля
  };
}

export type CreatePayResult =
  | {
      success: true;
      message: string;
      payment: PaymentData;
    }
  | {
      success: false;
      message: string;
      payment: null;
    };

export const create_pay = async (
  amount: number,
  chat_id: string,
  paymentType: PaymentType,
  paymentPlan?: PaymentPlan
): Promise<CreatePayResult> => {
  try {
    const idempotenceKey = uuidv4();

    const response = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: amount.toFixed(2),
          currency: "RUB",
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: "https://t.me/zaya_crm_bot",
        },
        description: `Пополнение баланса на ${amount} руб.`,
        metadata: { chat_id, paymentType },
      },
      {
        auth: {
          username: conf.SHOP_ID,
          password: conf.YOOUKASSA_SECKRET_KEY,
        },
        headers: {
          "Idempotence-Key": idempotenceKey,
          "Content-Type": "application/json",
        },
      }
    );

    const payment = response.data;

    return {
      success: true,
      payment,
      message: "Платёж успешно создан.",
    };
  } catch (error: any) {
    console.error(
      "❌ Ошибка при создании платежа:",
      error.response?.data || error.message
    );

    return {
      success: false,
      payment: null,
      message:
        error.response?.data?.description ||
        "Ошибка при создании платежа. Попробуйте позже.",
    };
  }
};
