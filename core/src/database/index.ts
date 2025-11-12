import mongoose from "mongoose";
import conf from "../config/config";

export const connectDB = async () => {
  try {
    let connectionString =
      conf.MODE === "DEV" ? conf.DATABASE_URI_DEV : conf.DATABASE_URI_PROD;
    await mongoose.connect(connectionString);
  } catch (err) {
    throw Error("Ошибка при подключении к бд");
  }
};
