import { Schema, model, Types } from "mongoose";
import ICode from "../../types/CodeSchema";
import { Role } from ".";

const CodeSchema = new Schema<ICode>(
  {
    role: { type: String, enum: Object.values(Role), required: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  {
    timestamps: true,
  }
);

export const Code = model<ICode>("Code", CodeSchema);
