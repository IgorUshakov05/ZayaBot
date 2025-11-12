import { PaymentPlan } from "../../types/UserSchema";
import { User } from "../schema/UserSchema";

export const set_user_tariff = async (chatIds: number[]): Promise<{ success: boolean; updatedCount?: number }> => {
  try {
    if (chatIds.length === 0) {
      return { success: true, updatedCount: 0 };
    }

    const result = await User.updateMany(
      { chat_id: { $in: chatIds } },
      { $set: { payment_plan: PaymentPlan.FREE } }
    );

    console.log(`Тариф сброшен на FREE для ${result.modifiedCount} пользователей`);
    return { success: true, updatedCount: result.modifiedCount };
    
  } catch (error) {
    console.error("Ошибка при сбросе тарифов:", error);
    return { success: false };
  }
};