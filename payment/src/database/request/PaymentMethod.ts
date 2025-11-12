import { IPaymentMethod } from "../../types/PaymentMethodSchema";
import { PaymentMethod } from "../schema/PaymentMethodSchema";
import { addDays, endOfDay, startOfDay, subDays, subMonths } from "date-fns";
import { User } from "../schema/UserSchema";
import { PaymentPlan, PaymentType } from "../../types/UserSchema";
/**
 * Получает дату для поиска подписок на продление
 * @param daysFromNow - через сколько дней продление (0=сегодня, 1=завтра, -1=вчера)
 */
const get_renewal_date_filter = (
  daysFromNow: number = 1
): { $gte: Date; $lte: Date } => {
  const today = new Date();

  // 1. Берем дату месяц назад от сегодня
  const oneMonthAgo = subMonths(today, 1);

  // 2. Применяем смещение дней (положительное = вперед, отрицательное = назад)
  const targetDate = addDays(oneMonthAgo, daysFromNow);

  const startDate = startOfDay(targetDate);
  const endDate = endOfDay(targetDate);

  console.log(
    `Поиск подписок на продление через ${daysFromNow} дня(дней):`,
    `(обновленные ${startDate.toISOString().split("T")[0]})`,
    startDate.toISOString(),
    "-",
    endDate.toISOString()
  );

  return { $gte: startDate, $lte: endDate };
};
/**
 * Получает платежные методы пользователя, обновленные ровно месяц назад
 * @async
 * @function get_user_payment_methods
 * @returns Promise<{success: true;payments: IPaymentMethod[];}|{ success: false; message: string }> Массив объектов платежных методов
 * @throws { success: false; message: string } Если произошла ошибка при запросе к базе данных
 * @example
 * // Возвращает все платежные методы с updatedAt 10 октября 2024 (если сегодня 10 ноября 2024)
 * {
  success: true,
  payments: [
    {
      card: [Object],
      _id: new ObjectId('id'),
      user: IUser,
      payment_method_id: 'id',
      type: 'bank_card',
      saved: true,
      id: 'id',
      createdAt: 2025-10-10T03:52:09.400Z,
      updatedAt: 2025-10-10T03:52:09.400Z,
      __v: 0
    }
  ]
 */
export const get_user_payment_methods = async (
  daysUntilRenewal: number = 1
): Promise<
  | { success: true; payments: IPaymentMethod[] }
  | { success: false; message: string }
> => {
  try {
    const dateFilter = get_renewal_date_filter(daysUntilRenewal);
    const payments = await PaymentMethod.aggregate([
      {
        $match: {
          updatedAt: dateFilter,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $match: {
          "user.payment_type": PaymentType.SUBSCRIPTION,
          "user.payment_plan": { $ne: PaymentPlan.FREE },
        },
      },
    ]);
    console.log(`Найдено ${payments.length} методов оплаты для продления`);

    return { success: true, payments };
  } catch (error) {
    console.error("Ошибка получения методов оплаты:", error);
    return { success: false, message: "Ошибка получения" };
  }
};
