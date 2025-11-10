import { Role } from "./UserSchema";

export interface ICreateManager {
  surname: string;
  name: string;
  chat_id: number;
  user_tag: string;
  role: Role;
  code: string;
}
