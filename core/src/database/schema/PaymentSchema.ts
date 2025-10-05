import { model, Schema } from "mongoose";
import { IPayment } from "../../types/PaymentShcema";

const PaymentSchema = new Schema<IPayment>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payment_method_id: { type: String, required: true, ref: "PaymentMethod" },
    status: {
      type: String,
      enum: ["succeeded", "pending", "canceled"],
      required: true,
    },
    paid: { type: Boolean, required: true },
    amount: {
      value: { type: String, required: true },
      currency: { type: String, required: true, default: "RUB" },
    },
    createdAt: { type: Date, required: true },
    isAuto: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
