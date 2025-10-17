import { Types } from "mongoose";

export interface ICompanySchema {
  _id: Types.ObjectId;
  title: string;
  domain: string;
  users: Types.ObjectId[];
  applications: Types.ObjectId[];
  api_key: string;
  test: boolean;
  createdAt: Date;
  updatedAt: Date;
}
