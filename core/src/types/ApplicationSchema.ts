import { Document, Types } from "mongoose";

export enum Status {
  pending = "pending",
  inWork = "inWork",
  complete = "complete",
}

export default interface IApplication extends Document {
  name?: string;
  user_phone?: string;
  status: Status;
  user_company?: string;
  manager: Types.ObjectId;
  comment: string | null;
  complite: boolean;
  file?: string;
  count: number;
  chats: { chat_id: number; message_id: number }[];
  company: Types.ObjectId;
  user_post?: string;
  message?: string;
  user_address?: string;
  createdAt: Date;
  updatedAt: Date;
}
