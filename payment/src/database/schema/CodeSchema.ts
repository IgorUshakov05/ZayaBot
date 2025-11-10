import { Schema, model, Types } from "mongoose";
import ICode from "../../types/CodeSchema";
import { Role } from "../../types/UserSchema";
import { v4 } from "uuid";

const CodeSchema = new Schema<ICode>(
  {
    role: { type: String, enum: Object.values(Role), required: true },
    code: { type: String, default: () => v4() },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  },
  {
    timestamps: true,
  }
);

export const Code = model<ICode>("Code", CodeSchema);
