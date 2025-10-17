import { Document, Types } from "mongoose";

export enum Status {
  pending = "pending",
  inWork = "inWork",
  complete = "complete",
}

export default interface IApplication extends Document {
  name?: string;
  phone?: string;
  status: Status;
  user_work: Types.ObjectId;
  comment: string | null;
  file?: string;
  chats: { chat_id: number; message_id: number }[];
  company?: Types.ObjectId;
  post?: string;
  message?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
