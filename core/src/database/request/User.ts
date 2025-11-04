import { Document, Types } from "mongoose";
import { ICompanySchema } from "../../types/CompanySchema";
import { ICreateManager } from "../../types/PropsFuntion";
import IUser, {
  PaymentPlan,
  PaymentType,
  PricePlan,
  Role,
} from "../../types/UserSchema";
import { Code } from "../schema/CodeSchema";
import { User } from "../schema/UserSchema";
import { Company } from "../schema/CompanySchema";
import { toTitleCase } from "../../bot/global/toTitleCase";

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
      { $push: { users: newUser._id } },
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

export const getManagers = async (
  chat_id: number
): Promise<
  | { success: false; message: string }
  | {
      success: true;
      managers: Pick<
        IUser,
        "name" | "surname" | "_id" | "chat_id" | "user_tag"
      >[];
    }
> => {
  try {
    const director = await User.findOne({
      chat_id,
      role: Role.director,
    }).populate<{
      company: ICompanySchema & {
        users: Pick<
          IUser,
          "name" | "surname" | "_id" | "chat_id" | "user_tag"
        >[];
      };
    }>({
      path: "company",
      populate: {
        path: "users",
        match: { role: Role.manager },
        select: "name surname _id chat_id user_tag",
      },
    });

    if (!director) {
      return { success: false, message: "Директор не найден" };
    }

    if (!director.company) {
      return { success: false, message: "Компания не привязана" };
    }

    const managers = director.company.users;

    if (managers.length === 0) {
      return {
        success: false,
        message:
          "Менеджеры не назначены\n\nДобавьте хотя бы одного менеджера в компанию.",
      };
    }

    return {
      success: true,
      managers,
    };
  } catch (error) {
    console.error("Ошибка в getManagers: ", error);
    return {
      success: false,
      message:
        "Что-то пошло не так\n\nПопробуйте позже или обратитесь к администратору.",
    };
  }
};

export const editUser = async ({
  chat_id,
  surname,
  name,
}: {
  chat_id: number;
  surname: string;
  name: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    // Валидация входных данных
    if (!chat_id || !surname?.trim() || !name?.trim()) {
      return {
        success: false,
        message: "❌ Пожалуйста, заполни все поля: имя и фамилия",
      };
    }

    // Проверка длины данных
    if (surname.length > 50 || name.length > 50) {
      return {
        success: false,
        message: "❌ Имя и фамилия не должны превышать 50 символов",
      };
    }

    // Обновление пользователя
    const updatedUser = await User.findOneAndUpdate(
      { chat_id },
      {
        $set: {
          name: name.trim(),
          surname: surname.trim(),
          updatedAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return {
        success: false,
        message:
          "❌ Ты еще не зарегистрирован в системе! Используй команду /start",
      };
    }

    return {
      success: true,
      message: `✅ Теперь вы ${name.trim()} ${surname.trim()}!`,
    };
  } catch (error: any) {
    console.error("Ошибка при обновлении пользователя:", error);

    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "❌ Проверь правильность введенных данных",
      };
    }

    if (error.name === "CastError") {
      return {
        success: false,
        message: "❌ Неверный формат данных",
      };
    }

    return {
      success: false,
      message: "😔 Произошла ошибка. Попробуй еще раз позже",
    };
  }
};

export const upBalanceUser = async ({
  chat_id,
  amount,
  paymentType,
}: {
  chat_id: number;
  amount: number;
  paymentType: PaymentType;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findOne({ chat_id });

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    user.balance = (user.balance || 0) + Number(amount);
    user.payment_type = paymentType;
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

export const setTariff = async ({
  chat_id,
  tariffType,
  paymentType,
}: {
  chat_id: number;
  tariffType: PaymentPlan;
  paymentType: PaymentType;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const user = await User.findOne({ chat_id });

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    // Обновляем тариф и тип оплаты
    user.payment_plan = tariffType;
    user.payment_type = paymentType;
    await user.save();

    // Формируем сообщение с информацией о тарифе и цене
    const price = PricePlan[tariffType];

    return {
      success: true,
      message:
        `💳 *Тариф успешно выбран!*\n\n` +
        `💎 Текущий тариф: *${tariffType}*\n` +
        `💰 Стоимость тарифа: *${price} ₽*`,
    };
  } catch (error) {
    console.error("Ошибка при установке тарифа:", error);
    return {
      success: false,
      message: "❌ Ошибка сервера при установке тарифа",
    };
  }
};

export const getTariff = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<
  | { success: true; payment_plan: PaymentPlan; payment_type: PaymentType }
  | { success: false; message: string }
> => {
  try {
    const user = await User.findOne({ chat_id });

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    return {
      success: true,
      payment_plan: user.payment_plan,
      payment_type: user.payment_type,
    };
  } catch (error) {
    console.error("Ошибка при установке тарифа:", error);
    return {
      success: false,
      message: "❌ Ошибка сервера при установке тарифа",
    };
  }
};

export const checkUserNotification = async ({
  chat_id,
}: {
  chat_id: number;
}): Promise<
  | { success: false; message: string }
  | { success: true; role: Role; mute: boolean }
> => {
  try {
    const user = await User.findOne({ chat_id });

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }

    return { success: true, role: user.role, mute: user.mute };
  } catch (error) {
    console.error("Ошибка при проверке уведомлений пользователя:", error);
    return {
      success: false,
      message: "Произошла ошибка при проверке пользователя",
    };
  }
};

export const setUserNotification = async ({
  chat_id,
  state,
}: {
  chat_id: number;
  state: boolean;
}): Promise<
  | { success: false; message: string }
  | { success: true; role: Role; mute: boolean }
> => {
  try {
    const user = await User.findOneAndUpdate(
      { chat_id },
      { $set: { mute: state } }
    );

    if (!user) {
      return { success: false, message: "Пользователь не найден" };
    }
    return { success: true, role: user.role, mute: user.mute };
  } catch (error) {
    console.error("Ошибка при проверке уведомлений пользователя:", error);
    return {
      success: false,
      message: "Произошла ошибка при проверке пользователя",
    };
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
        message: `*${toTitleCase(findUser.name)}*, здравствуйте!
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
        message: `🎉 Добро пожаловать обратно, *${toTitleCase(findUser.name)}*!

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
