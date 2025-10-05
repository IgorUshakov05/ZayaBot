import { Document, Types } from "mongoose";

export enum Status {
  pending = "pending",
  inWork = "inWork",
  complete = "complete",
}

export default interface IApplication extends Document {
  name: string;
  phone: string;
  status: Status;
  file?: string;
  company?: Types.ObjectId;
  post?: string;
  message?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}