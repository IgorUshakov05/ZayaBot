import IApplication from "./ApplicationSchema";
export interface IApplicationRequest
  extends Omit<IApplication, "createdAt" | "updatedAt" | "status"> {}
