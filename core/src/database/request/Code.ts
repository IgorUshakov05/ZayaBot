import { PaymentPlan, PaymentType, Role } from "./../../types/UserSchema";
import { ICompanySchema } from "../../types/CompanySchema";
import { Code } from "../schema/CodeSchema";
import { User } from "../schema/UserSchema";

export const createCode = async ({
  chat_id,
  role,
}: {
  chat_id: number;
  role: Role;
}): Promise<{ success: boolean; message: string; code?: string }> => {
  try {
    const user = await User.findOne({ chat_id, role: Role.director }).populate<{
      company: ICompanySchema;
    }>("company");

    if (!user) {
      return {
        success: false,
        message: "⚠️ Вы не являетесь директором компании.",
      };
    }

    if (!user.company) {
      return {
        success: false,
        message:
          "⚠️ У вас нет привязанной компании. Сначала добавьте или выберите компанию в настройках.",
      };
    }

    if (user.company.test) {
      return {
        success: false,
        message: `🚫 Создание кода невозможно, так как компания *${user.company.title}* является тестовой. 
Для генерации кода используйте рабочую компанию.`,
      };
    }

    if (
      user.payment_type === PaymentType.SUBSCRIPTION &&
      user.payment_plan === PaymentPlan.FREE &&
      user.company.users.length >= 2
    ) {
      return {
        success: false,
        message: `⚠️ По вашему тарифному плану нельзя добавить более одного менеджера. 
Для подключения дополнительных сотрудников обновите тарифный план.`,
      };
    }
    const newCode = new Code({
      role,
      company: user.company._id,
    });

    await newCode.save();

    return {
      success: true,
      message: `✅ Код успешно создан для компании *${user.company.title}*!
Роль: *${role}*
Передайте этот код сотруднику для подключения.`,
      code: newCode.code,
    };
  } catch (error) {
    console.error("Ошибка при создании кода:", error);
    return {
      success: false,
      message:
        "⚠️ Произошла непредвиденная ошибка при создании кода. Попробуйте позже или обратитесь в поддержку.",
    };
  }
};
