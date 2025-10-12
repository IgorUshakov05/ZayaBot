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
    payment_type: {
      type: String,
      enum: ["PerRequest", "Subscription", "Free"],
      default: "Free",
    },
    balance: {
      type: Number,
      default: 0,
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
    mute: {
      type: Boolean,
      default: false,
    },
    payment_method: { type: Schema.Types.ObjectId, ref: "PaymentMethod" },
    chat_id: {
      type: Number,
      required: true,
      unique: true,
    },
    payment_plan: {
      type: String,
      enum: ["START", "PRO", "ENTERPRISE"],
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
