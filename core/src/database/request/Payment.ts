import { Payment } from "../schema/PaymentSchema";
import { IPayment } from "../../types/PaymentShcema";
import { User } from "../schema/UserSchema";

export const create_payment = async ({
  chat_id,
  amount,
  paid,
  payment_method_id,
  isAuto,
  status,
}: { chat_id: number } & Omit<IPayment, "id" | "userId" | "createdAt">) => {
  try {
    const user = await User.findOne({ chat_id });
    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    // Создаём корректную структуру данных
    const new_payment = await Payment.create({
      userId: user._id,
      payment_method_id,
      status,
      paid,
      isAuto,
      createdAt: new Date(),
      amount,
    });

    // Добавляем платёж пользователю
    user.payments.push(new_payment._id);
    await user.save();

    return {
      success: true,
      message: "Платёж успешно создан",
      payment: new_payment,
    };
  } catch (error: any) {
    console.error("Ошибка при создании платежа:", error);
    return {
      success: false,
      message: error.message || "Ошибка при создании платежа",
    };
  }
};

export const get_last_payment = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<
  { success: true; payment: IPayment } | { success: false; message: string }
> => {
  try {
    const director = await User.findOne({ chat_id })
      .populate<{
        payments: IPayment[];
      }>({
        path: "payments",
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .lean()
      .exec();

    if (!director) {
      return { success: false, message: "Director not found" };
    }

    const lastPayment = director.payments[0];

    return {
      success: true,
      payment: lastPayment,
    };
  } catch (error) {
    console.error("Error in get_last_payment:", error);
    return { success: false, message: "Server error" };
  }
};
