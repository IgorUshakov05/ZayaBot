import { Types } from "mongoose";

export interface IPayment {
  id: string;
  userId: Types.ObjectId;
  payment_method_id: string;
  status: "succeeded" | "pending" | "canceled";
  paid: boolean;
  amount: {
    value: number;
    currency: "RUB" | "USD" | "EUR";
  };
  createdAt: Date;
  isAuto?: boolean;
}
