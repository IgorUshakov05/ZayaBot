import { Types } from "mongoose";
import { Role } from "./UserSchema";

export default interface ICode {
  id: string;
  role: Role;
  code: string;
  company: Types.ObjectId;
  createdAt: Date;
}
