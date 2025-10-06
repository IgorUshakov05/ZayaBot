import { model, Schema, Types } from "mongoose";

export interface IPayment {
  id: string; // payment.id из ЮKassa
  userId: Types.ObjectId; // Привязка к пользователю
  payment_method_id: string; // Ссылка на PaymentMethod
  status: "succeeded" | "pending" | "canceled";
  paid: boolean;
  amount: {
    value: number;
    currency: string;
  };
  createdAt: Date; // дата платежа
  isAuto?: boolean; // автоплатёж или ручной
}
