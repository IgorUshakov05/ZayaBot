import { Schema, model } from "mongoose";
import IApplication, { Status } from "../../types/ApplicationSchema";

const ApplicationSchema = new Schema<IApplication>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.pending,
      required: true,
    },
    file: { type: String },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    post: { type: String },
    message: { type: String },
    address: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Application = model<IApplication>(
  "Application",
  ApplicationSchema
);
