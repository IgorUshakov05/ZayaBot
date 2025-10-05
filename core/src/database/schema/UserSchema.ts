import { Schema, model } from "mongoose";
import IUser from "../../types/UserSchema";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: false,
    },
    user_tag: {
      type: String,
    },
    role: {
      type: String,
      enum: ["manager", "director"],
    },
    payments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Payment",
      },
    ],
    payment_method: { type: Schema.Types.ObjectId, ref: "PaymentMethod" },
    chat_id: {
      type: Number,
      required: true,
      unique: true,
    },
    mail: {
      type: String,
      required: false,
      default: null,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", UserSchema);
