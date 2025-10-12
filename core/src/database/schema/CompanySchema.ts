import { model, Schema } from "mongoose";
import { ICompanySchema } from "../../types/CompanySchema";
import { v4 as uuid } from "uuid";
const CompanySchema = new Schema<ICompanySchema>(
  {
    title: { type: String, required: true },
    domain: { type: String, unique: true },
    users: [{ type: Schema.Types.ObjectId, ref: "User" }], // ссылки на пользователей
    applications: [{ type: Schema.Types.ObjectId, ref: "Applications" }],
    paid: { type: Boolean, default: false },
  
    api_key: { type: String, required: true, default: () => uuid() },
    test: { type: Boolean, default: false },
  },
  { timestamps: true } // создаёт createdAt и updatedAt автоматически
);

export const Company = model<ICompanySchema>("Company", CompanySchema);
