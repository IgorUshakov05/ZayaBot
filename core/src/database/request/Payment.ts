import { Payment } from "../schema/PaymentSchema";
import { IPayment } from "../../types/PaymentShcema";
import { User } from "../schema/UserSchema";
import { v4 as uuidv4 } from "uuid";

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
      id: uuidv4(), // уникальный идентификатор
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
