import { Types } from "mongoose";
import IUser from "./UserSchema";

export enum PaymentMethodType {
  bank_card = "bank_card",
  yoo_money = "yoo_money",
  sberbank = "sberbank",
  tinkoff_bank = "tinkoff_bank",
  qiwi = "qiwi",

  sbp = "sbp",
}

export interface IPaymentMethod {
  _id: Types.ObjectId;
  id: string;
  payment_method_id: string;
  type: PaymentMethodType; 
  saved: boolean; 
  user: Types.ObjectId | IUser;
  card?: {
    first6?: string;
    last4?: string;
    card_type?: string; // Mir
  };

  createdAt: Date;
  updatedAt: Date;
}
