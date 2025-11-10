import mongoose from "mongoose";
import conf from "../config/config";

export const connectDB = async () => {
  try {
    await mongoose.connect(conf.DATABASE_URI);
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};
