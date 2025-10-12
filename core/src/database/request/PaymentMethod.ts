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

export const create_payment_method = async ({
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
    let payment_method = user?.payment_method as IPaymentMethod | any;
    if (!user) {
      throw new Error("Пользователь не найден");
    }

    // Если пользователь уже имеет платёжный метод и метод сохранён, ничего не делаем
    if (payment_method && payment_method.saved) {
      return {
        success: false,
        message: "Платёжный метод уже существует",
        payment_method: user.payment_method,
      };
    }

    // Создаём новый платёжный метод
    const new_payment_method = await PaymentMethod.create({
      payment_method_id,
      saved,
      type,
      card,
    });

    // Привязываем к пользователю
    user.payment_method = new_payment_method._id;
    await user.save();

    return {
      success: true,
      payment_method: new_payment_method,
    };
  } catch (error: any) {
    console.error(error);
    return {
      success: false,
      message: error.message || "Ошибка при создании платёжной системы",
    };
  }
};
