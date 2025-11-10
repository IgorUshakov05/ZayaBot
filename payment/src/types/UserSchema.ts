import { Document, Types } from "mongoose";

export enum Role {
  manager = "manager",
  director = "director",
}
export enum PaymentType {
  PER_REQUEST = "PerRequest", 
  SUBSCRIPTION = "Subscription", 
}
export enum PaymentPlan {
  FREE = "FREE",
  START = "START",
  PRO = "PRO",
  ENTERPRISE = "ENTERPRISE",
}
export const PricePlan: Record<PaymentPlan, number> = {
  [PaymentPlan.FREE]: 0,
  [PaymentPlan.START]: 199,
  [PaymentPlan.PRO]: 499,
  [PaymentPlan.ENTERPRISE]: 1499,
};
export default interface IUser extends Document {
  surname?: string;
  name: string;
  role: Role;
  user_tag: string;
  balance: number;
  mute: boolean;
  chat_id: number;
  payment_type: PaymentType;
  payment_plan: PaymentPlan;
  mail?: null | string;
  payment_method?: Types.ObjectId;
  company: Types.ObjectId;
  payments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
