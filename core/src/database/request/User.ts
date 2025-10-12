import { Types } from "mongoose";
import { ICompanySchema } from "../../types/CompanySchema";
import { ICreateManager } from "../../types/PropsFuntion";
import { Role } from "../../types/UserSchema";
import { Code } from "../schema/CodeSchema";
import { User } from "../schema/UserSchema";
import { Company } from "../schema/CompanySchema";

export const createUser = async ({
  surname,
  name,
  role,
  chat_id,
  user_tag,
  code,
}: ICreateManager): Promise<{ success: boolean; message: string }> => {
  try {
    // 1️⃣ Проверяем наличие кода
    const searchCode = await Code.findOne({ code }).populate<ICompanySchema>(
      "company"
    );
    if (!searchCode) {
      return {
        success: false,
        message: "❌ Код приглашения не найден или уже использован.",
      };
    }

    // 2️⃣ Проверяем, не зарегистрирован ли уже пользователь
    const existingUser = await User.findOne({ chat_id });
    if (existingUser) {
      return {
        success: false,
        message:
          "⚠️ Вы уже зарегистрированы в системе. Повторная регистрация невозможна.",
      };
    }

    // 3️⃣ Проверяем наличие компании у кода
    if (!searchCode.company) {
      return {
        success: false,
        message: "🏢 Компания, связанная с кодом, не найдена.",
      };
    }

    // 4️⃣ Создаём нового пользователя
    const newUser = new User({
      surname,
      user_tag,
      name,
      role,
      chat_id,
      company: searchCode.company._id,
      createdAt: new Date(),
    });

    // 5️⃣ Добавляем пользователя в компанию через $push
    const updatedCompany = await Company.findOneAndUpdate(
      { _id: searchCode.company._id },
      { $push: { users: newUser._id } }, // ← исправлено!
      { new: true }
    );

    console.log("✅ Компания обновлена:", updatedCompany?.title);

    // 6️⃣ Сохраняем пользователя
    await newUser.save();

    // 7️⃣ Удаляем использованный код
    await Code.deleteOne({ _id: searchCode._id });

    // 8️⃣ Возвращаем результат
    return {
      success: true,
      message: `✅ Регистрация прошла успешно!\nДобро пожаловать, *${name} ${surname}*.\nВаша роль: *${role}*`,
    };
  } catch (error) {
    console.error("Ошибка при создании пользователя:", error);
    return {
      success: false,
      message: "⚠️ Произошла ошибка при регистрации. Попробуйте позже.",
    };
  }
};

export const upBalanceUser = async ({
  chat_id,
  amount,
}: {
  chat_id: number;
  amount: number;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findOne({ chat_id });

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    user.balance = (user.balance || 0) + Number(amount);
    await user.save();

    return {
      success: true,

      message:
        `💰 *Баланс успешно пополнен!*\n\n` +
        `➕ Пополнено: ${amount} ₽\n` +
        `💎 Текущий баланс: ${user.balance} ₽`,
    };
  } catch (error) {
    console.error("Ошибка при обновлении баланса:", error);
    return { success: false, message: "Ошибка сервера при обновлении баланса" };
  }
};
export const checkUserRole = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<{
  success: boolean;
  newUser: boolean;
  role?: Role;
  test_company: boolean;
  api_key?: string;
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
        api_key: findUser.company.api_key,
        test_company: true,
        role: findUser.role,
        message:
          "⚠️ Вы директор, но компания пока в тестовом режиме. Отправьте заявку чтобы активировать компанию!",
      };
    }

    // 3. Директор с рабочей компанией
    if (findUser.role === Role.director) {
      return {
        success: true,
        newUser: false,
        test_company: false,
        role: findUser.role,
        message: `*${findUser.name}*, здравствуйте!
Выберите действие в меню ниже 👇`,
      };
    }

    // 4. Менеджер
    if (findUser.role === Role.manager) {
      return {
        success: true,
        newUser: false,
        test_company: false,
        role: findUser.role,
        message: `🎉 Добро пожаловать обратно, *${findUser.name}*!

Вы успешно вошли в систему.
👤 Роль: *${findUser.role}*${
          findUser.company ? `\n🏢 Компания: *${findUser.company.title}*` : ""
        }.`,
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
