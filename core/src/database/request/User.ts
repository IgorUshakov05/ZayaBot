import { ICompanySchema } from "../../types/CompanySchema";
import { Role } from "../../types/UserSchema";
import { User } from "../schema/UserSchema";

export const checkUserRole = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<{
  success: boolean;
  newUser: boolean;
  role?: Role;
  test_company: boolean;
  message: string;
}> => {
  try {
    const findUser = await User.findOne({ chat_id })
      .populate<{ company?: ICompanySchema }>("company")
      .lean();

    // 1. Пользователь не найден
    if (!findUser) {
      return {
        success: true,
        newUser: true,
        test_company: false,
        message:
          "❌ Вас нет в системе. Пожалуйста, пройдите регистрацию, чтобы продолжить.",
      };
    }

    // 2. Директор и компания в тестовом режиме
    if (findUser.role === Role.director && findUser.company?.test) {
      return {
        success: true,
        newUser: false,
        test_company: true,
        role: findUser.role,
        message:
          "⚠️ Вы директор, но компания пока в тестовом режиме. Некоторые функции могут быть ограничены.",
      };
    }

    // 3. Директор с рабочей компанией
    if (findUser.role === Role.director) {
      return {
        success: true,
        newUser: false,
        test_company: false,
        role: findUser.role,
        message: `✅ Вы успешно вошли! Ваша роль: ${findUser.role}${
          findUser.company ? `\nКомпания: ${findUser.company.title}` : ""
        }`,
      };
    }

    // 4. Менеджер
    if (findUser.role === Role.manager) {
      return {
        success: true,
        newUser: false,
        test_company: false,
        role: findUser.role,
        message: `✅ Вы успешно вошли! Ваша роль: ${findUser.role}${
          findUser.company ? `\nКомпания: ${findUser.company.title}` : ""
        }`,
      };
    }

    // 5. Любая другая роль (например, клиент)
    return {
      success: true,
      newUser: false,
      test_company: false,
      role: findUser.role,
      message: `✅ Вы успешно вошли! Ваша роль: ${findUser.role}`,
    };
  } catch (error) {
    console.error("Ошибка при проверке пользователя:", error);
    return {
      success: false,
      newUser: false,
      test_company: false,
      message: "❌ Произошла ошибка при проверке данных. Попробуйте позже.",
    };
  }
};
