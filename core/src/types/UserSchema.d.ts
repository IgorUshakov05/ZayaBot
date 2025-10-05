import { Document, Types } from "mongoose";

export enum Role {
  manager = "manager",
  director = "director",
}
export default interface IUser extends Document {
  surname?: string;
  name: string;
  role: Role;
  user_tag:string;
  chat_id: number;
  mail?: null | string;
  payment_method?: Types.ObjectId;
  company: Types.ObjectId;
  payments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}
