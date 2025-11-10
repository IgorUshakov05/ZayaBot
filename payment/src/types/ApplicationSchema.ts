import { Document, Types } from "mongoose";
import { Role } from "./UserSchema";

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
  file?: string;
  count: number;
  chats: { chat_id: number; message_id: number; role: Role }[];
  company: Types.ObjectId;
  user_post?: string;
  message?: string;
  user_address?: string;
  createdAt: Date;
  updatedAt: Date;
}
