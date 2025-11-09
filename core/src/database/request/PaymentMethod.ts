import { Types } from "mongoose";
import IPaymentMethod, {
  PaymentMethodType,
} from "../../types/PaymentMethodSchema";
import { PaymentMethod } from "../schema/PaymentMethodSchema";
import { User } from "../schema/UserSchema";

interface CreatePaymentMethodParams {
  chat_id: number;
  payment_method_id: string;
  saved: boolean;
  type: PaymentMethodType;
  card: any;
}

export const create_or_updata_payment_method = async ({
  chat_id,
  saved,
  payment_method_id,
  type,
  card,
}: CreatePaymentMethodParams) => {
  try {
    // Находим пользователя и подгружаем его платёжный метод
    const user = await User.findOne({ chat_id }).populate<IPaymentMethod>(
      "payment_method"
    );

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    let payment_method = user.payment_method as IPaymentMethod | any;

    // Если пользователь уже имеет платёжный метод - обновляем его
    if (payment_method) {
      // Обновляем существующий платёжный метод
      const updated_payment_method = await PaymentMethod.findByIdAndUpdate(
        payment_method._id,
        {
          payment_method_id,
          saved,
          type,
          card,
          updated_at: new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Платёжный метод успешно обновлён",
        payment_method: updated_payment_method,
        action: "updated",
      };
    }

    const new_payment_method = await PaymentMethod.create({
      payment_method_id,
      saved,
      type,
      card,
    });

    user.payment_method = new_payment_method._id;
    await user.save();

    return {
      success: true,
      message: "Платёжный метод успешно создан",
      payment_method: new_payment_method,
      action: "created",
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message:
        error.message || "Ошибка при создании или обновлении платёжного метода",
    };
  }
};

export const user_is_auto_pay = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<boolean> => {
  try {
    const user = await User.findOne({ chat_id })
      .select("payment_method")
      .populate<IPaymentMethod>("payment_method");

    if (!user) {
      return false;
    }

    if (!user.payment_method) {
      return false;
    }

    const payment_method = user.payment_method as unknown as IPaymentMethod;
    return payment_method.saved;
  } catch (error: any) {
    console.error(error);
    return false;
  }
};

export const get_payment_method_info = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<IPaymentMethod | null> => {
  try {
    const user = await User.findOne({ chat_id })
      .select("payment_method")
      .populate<IPaymentMethod>("payment_method");

    if (!user || !user.payment_method) {
      return null;
    }

    const payment_method = user.payment_method as unknown as IPaymentMethod;
    return payment_method;
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const disable_auto_pay = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<{ success: true } | { success: false; message: string }> => {
  try {
    const user = await User.findOne({ chat_id }).populate<IPaymentMethod>(
      "payment_method"
    );

    if (!user || !user.payment_method) {
      return {
        success: false,
        message: "Платёжный метод не найден",
      };
    }

    const payment_method = user.payment_method as unknown as IPaymentMethod;

    await PaymentMethod.findByIdAndUpdate(
      payment_method._id,
      {
        saved: false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: "Ошибка при отключении автоплатежа",
    };
  }
};
