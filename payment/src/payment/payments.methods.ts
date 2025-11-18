import axios from "axios";
import { v4 as uuidv4, v4 } from "uuid";
import conf from "../config/config";
import { PaymentPlan, PaymentType, PricePlan } from "../types/UserSchema";
export interface PaymentData {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  amount: {
    value: string;
    currency: "RUB" | "USD" | "EUR";
  };
  description: string;
  recipient: {
    account_id: string;
    gateway_id: string;
  };
  created_at: string;
  confirmation: {
    type: "redirect";
    confirmation_url: string;
  };
  test: boolean;
  paid: boolean;
  refundable: boolean;
  metadata: {
    chat_id: number;
    paymentType: PaymentType;
    isAutoPay: boolean;
    paymentPlan: PaymentPlan;
    [key: string]: any;
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

export const create_auto_pay = async (
  chat_id: number,
  payment_method_id: string,
  paymentPlan: PaymentPlan,
  email: string
): Promise<CreatePayResult> => {
  try {
    let IdempotenceKey = v4();
    let amount = PricePlan[paymentPlan];
    const receipt = {
      customer: { email },
      items: [
        {
          description: `Автоплатеж подписки «${paymentPlan}`,
          quantity: 1,
          amount: { value: amount.toFixed(2), currency: "RUB" },
          vat_code: 1,
          payment_mode: "full_payment",
          payment_subject: "income",
        },
      ],
      tax_system_code: 6,
    };
    const response = await axios.post(
      "https://api.yookassa.ru/v3/payments",
      {
        amount: {
          value: amount.toFixed(2),
          currency: "RUB",
        },
        payment_method_id,
        capture: true,
        description: `Автоплатеж на ${amount} руб.`,
        receipt,
        metadata: {
          chat_id,
          paymentType: PaymentType.SUBSCRIPTION,
          paymentPlan,
          isAutoPay: true,
        },
      },
      {
        auth: {
          username: conf.SHOP_ID,
          password: conf.YOOUKASSA_SECKRET_KEY,
        },
        headers: {
          "Idempotence-Key": IdempotenceKey,
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
