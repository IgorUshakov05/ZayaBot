import { PaymentType } from "./UserSchema";

export interface YooKassaWebhookBody {
  type: "notification";
  event:
    | "payment.waiting_for_capture"
    | "payment.succeeded"
    | "payment.canceled"
    | "refund.succeeded";
  object: {
    id: string;
    status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
    amount: {
      value: number;
      currency: "RUB" | "USD" | "EUR";
    };
    income_amount?: {
      value: number;
      currency: "RUB" | "USD" | "EUR";
    };
    description?: string;
    recipient: {
      account_id: string;
      gateway_id: string;
    };
    payment_method?: {
      type:
        | "bank_card"
        | "yoo_money"
        | "sbp"
        | "sberbank"
        | "tinkoff_bank"
        | "qiwi"
        | "mobile_balance"
        | string;
      id: string;
      saved?: boolean;
      status?: string;
      title?: string;
      account_number?: string;

      /** Для банковских карт */
      card?: {
        first6?: string;
        last4?: string;
        expiry_month?: string;
        expiry_year?: string;
        card_type?: string;
        issuer_country?: string;
        issuer_name?: string;
      };
    };
    captured_at?: string;
    created_at: string;
    test: boolean;
    refunded_amount?: {
      value: string;
      currency: "RUB" | "USD" | "EUR";
    };
    paid: boolean;
    refundable: boolean;

    /** Данные, которые ты передаёшь при создании платежа */
    metadata: {
      chat_id: number;
      paymentType: PaymentType;
      [key: string]: any;
    };

    /** Детали авторизации для банковских карт */
    authorization_details?: {
      rrn?: string;
      auth_code?: string;
      three_d_secure?: {
        applied: boolean;
      };
    };
  };
}
