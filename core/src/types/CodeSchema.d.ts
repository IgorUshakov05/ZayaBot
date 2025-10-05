import { Types } from "mongoose";
import { Role } from "./UserSchema";

export default interface ICode {
  id: string;
  role: Role;
  company: Types.ObjectId;
  createdAt: Date; 
}
