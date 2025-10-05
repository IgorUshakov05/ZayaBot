import { model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import IPaymentMethod, {
  PaymentMethodType,
} from "../../types/PaymentMethodSchema";

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    id: {
      type: String,
      required: true,
      default: () => uuidv4(),
    },

    payment_method_id: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: Object.values(PaymentMethodType),
      required: true,
    },

    saved: {
      type: Boolean,
      required: true,
      default: false,
    },

    card: {
      first6: { type: String },
      last4: { type: String },
      card_type: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const PaymentMethod = model<IPaymentMethod>(
  "PaymentMethod",
  PaymentMethodSchema
);
