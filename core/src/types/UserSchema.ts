import { Document, Types } from "mongoose";

export enum Role {
  manager = "manager",
  director = "director",
}
export enum PaymentType {
  PER_REQUEST = "PerRequest", // Короче это если за заявку
  SUBSCRIPTION = "Subscription", // Это тариф который ниже
  FREE = "Free", // Ну а это дефолтик друзья
}
export enum PaymentPlan {
  START = "Start",
  PRO = "Pro",
  ENTERPRISE = "Enterprise",
}

export default interface IUser extends Document {
  surname?: string;
  name: string;
  role: Role;
  user_tag: string;
  balance: number;
  mute: boolean;
  chat_id: number;
  payment_type: "PerRequest" | "Subscription" | "Free";
  payment_plan?: PaymentPlan;
  mail?: null | string;
  payment_method?: Types.ObjectId;
  company: Types.ObjectId;
  payments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
