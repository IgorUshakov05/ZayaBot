import { Types } from "mongoose";

export enum Tariff {
  FREE = "free",
  START = "start",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export interface ICompanySchema {
  _id: Types.ObjectId;
  title: string;
  domain: string;
  users: Types.ObjectId[];
  applications?: Types.ObjectId[];
  //   tariff: Tariff;
  api_key: string;
  test: boolean;
  createdAt: Date;
  updatedAt: Date;
}
