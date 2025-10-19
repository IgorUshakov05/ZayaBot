import { Schema, model } from "mongoose";
import IApplication, { Status } from "../../types/ApplicationSchema";

const ApplicationSchema = new Schema<IApplication>(
  {
    name: { type: String },
    user_phone: { type: String },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.pending,
      required: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
      default: null,
    },
    complite: {
      type: Boolean,
      default: false,
    },
    chats: [
      {
        chat_id: { type: Number, required: true },
        message_id: { type: Number, required: true },
      },
    ],
    file: { type: String },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    user_company: { type: String },
    count: { type: Number },
    user_post: { type: String },
    message: { type: String },
    user_address: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Application = model<IApplication>(
  "Application",
  ApplicationSchema
);
