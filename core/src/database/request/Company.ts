import { Company } from "./../schema/CompanySchema";
import { Types } from "mongoose";
import { User } from "../schema/UserSchema";
import { v4 as uuidv4 } from "uuid";
import { ICompanySchema } from "../../types/CompanySchema";
import IUser, { PaymentPlan, PaymentType, Role } from "../../types/UserSchema";
import IApplication from "../../types/ApplicationSchema";

interface CreateCompanyParams {
  user: { user_tag: string; chat_id: number; name: string };
  company: { title: string; domain: string };
}
/**
 * Создаёт новую компанию и назначает пользователя директором.
 *
 * @param {Object} params.user - Данные пользователя.
 * @param {string} params.user.user_tag - Уникальный идентификатор пользователя в Telegram.
 * @param {number} params.user.chat_id - ID чата пользователя.
 * @param {string} params.user.name - Имя пользователя.
 * @param {Object} params.company - Данные компании.
 * @param {string} params.company.title - Название компании.
 * @param {string} params.company.domain - Уникальный домен компании.
 *
 * @returns {Promise<{success: boolean; message: string; company?: ICompanySchema; user?: any}>}
 * Объект с результатом операции.
 */
export async function createCompanyAndUser({
  user,
  company,
}: CreateCompanyParams) {
  try {
    const findUser = await User.findOne({ chat_id: user.chat_id });
    if (findUser) {
      return {
        success: false,
        message:
          "⚠️ Вы уже зарегистрированы в системе. Повторная регистрация невозможна.",
      };
    }

    // Проверяем существование компании
    const existingCompany = await Company.findOne({
      domain: company.domain,
      test: true,
    });
    if (existingCompany) {
      return {
        success: false,
        message: `🚫 Компания с доменом *${company.domain}* уже зарегистрирована. 
Если это ваша организация — обратитесь к администратору.`,
      };
    }

    // Создаём новую компанию
    const newCompany = await Company.create({
      title: company.title,
      test: true,
      domain: company.domain,
      users: [],
      api_key: uuidv4(),
    });

    // Создаём пользователя и назначаем директором
    const newUser = await User.create({
      name: user.name,
      user_tag: user.user_tag,
      chat_id: user.chat_id,
      role: "director",
      company: newCompany._id,
    });

    // Привязываем пользователя к компании
    newCompany.users.push(newUser._id as Types.ObjectId);
    await newCompany.save();

    return {
      success: true,
      message: `✅ Компания *${newCompany.title}* успешно создана!\n
👤 Вы назначены директором.\n🌐 Домен: *${newCompany.domain}*`,
      company: newCompany,
      user: newUser,
    };
  } catch (error) {
    console.error("Ошибка создания компании и пользователя:", error);
    return {
      success: false,
      message:
        "❌ Произошла ошибка при создании компании. Пожалуйста, попробуйте позже.",
    };
  }
}

/**
 * Проверяет, является ли пользователь директором и верифицирована ли его компания.
 *
 * @param {Object} params - Параметры проверки.
 * @param {number} params.chat_id - Telegram chat ID пользователя.
 * @param {string} params.messageSuccess - Сообщение, возвращаемое при успешной проверке.
 *
 * @returns {Promise<{success: boolean; message: string}>}
 * Результат проверки с сообщением.
 */
export async function is_verefy_company_of_director({
  chat_id,
  messageSuccess,
}: {
  chat_id: number;
  messageSuccess: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const findUser = await User.findOne({ chat_id }).populate<ICompanySchema>(
      "company"
    );

    if (!findUser) {
      return {
        success: false,
        message:
          "🚫 Пользователь не найден. Пожалуйста, пройдите регистрацию заново.",
      };
    }

    if (findUser.role !== Role.director) {
      return {
        success: false,
        message: "⚠️ Только директор компании может выполнить это действие.",
      };
    }

    if (!findUser.company) {
      return {
        success: false,
        message:
          "🏢 К вашему профилю не привязана компания.\n\n" +
          "Создайте компанию через команду /create_company или свяжитесь с администратором.",
      };
    }

    const company = findUser.company as unknown as ICompanySchema;

    if (!company.test === false) {
      return {
        success: false,
        message:
          "🕓 Компания ожидает подтверждения.\n" +
          "Пожалуйста, дождитесь проверки администрацией.",
      };
    }

    return {
      success: true,
      message: messageSuccess,
    };
  } catch (error) {
    console.error("Ошибка в is_verefy_company_of_director:", error);
    return {
      success: false,
      message: "❗ Произошла внутренняя ошибка сервера. Попробуйте позже.",
    };
  }
}

export async function remove_manager_from_company({
  director_chat_id,
  manager__id,
}: {
  manager__id: string;
  director_chat_id: number;
}): Promise<{ success: boolean; message: string }> {
  try {
    const director = await User.findOne({
      chat_id: director_chat_id,
      role: Role.director,
    }).populate<{
      company: ICompanySchema & {
        users: IUser[];
      };
    }>({
      path: "company",
      populate: {
        path: "users",
        match: { role: Role.manager, _id: manager__id },
        select: "name surname _id chat_id user_tag",
      },
    });

    if (!director) {
      return { success: false, message: "Директор не найден" };
    }

    if (!director.company) {
      return { success: false, message: "Компания не привязана" };
    }

    if (!director.company.users || director.company.users.length === 0) {
      return { success: false, message: "Менеджер не найден" };
    }

    const manager = director.company.users[0];

    await Company.findByIdAndUpdate(director.company._id, {
      $pull: {
        users: manager._id,
      },
    });

    await User.findByIdAndDelete(manager._id);

    return {
      success: true,
      message: `✅ Менеджер ${manager.name} ${
        manager.surname ? "" : manager.surname
      } успешно удален из компании`,
    };
  } catch (error) {
    console.error("Ошибка в функции remove_manager_from_company", error);
    return { success: false, message: "Ошибка сервера" };
  }
}

/**
 * Удаляет компанию и всех связанных с ней пользователей.
 *
 * @param {Object} params - Параметры удаления.
 * @param {number} params.chat_id - Telegram chat ID директора компании.
 * @param {boolean} params.test - Флаг тестовой компании.
 *
 * @returns {Promise<{success: boolean; message: string}>}
 * Результат операции удаления.
 */
export async function delete_company({
  chat_id,
  test,
}: {
  chat_id: number;
  test: boolean;
}) {
  try {
    const findUser = await User.findOne({ chat_id }).populate("company");

    if (!findUser) {
      return {
        success: false,
        message: "⚠️ Вы не зарегистрированы в системе",
      };
    }

    if (!findUser.company) {
      return {
        success: false,
        message: "ℹ️ У вас нет зарегистрированной компании.",
      };
    }

    if (findUser.role !== "director") {
      return {
        success: false,
        message:
          "🚫 Только директор компании может удалить организацию из системы.",
      };
    }

    const company = findUser.company as any;
    await User.deleteMany({ company: company._id });
    await Company.deleteOne({ _id: company._id, test });

    return {
      success: true,
      message: `✅ Компания *${company.title}* успешно удалена из системы.`,
    };
  } catch (error) {
    console.error("Ошибка при удалении компании:", error);
    return {
      success: false,
      message:
        "❌ Произошла ошибка при удалении компании. Пожалуйста, попробуйте позже.",
    };
  }
}

/**
 * Получает данные о компании и её пользователях по API-ключу и домену.
 * Возвращает chat_id всех активных пользователей и роль директора.
 *
 * @param {Object} params - Параметры запроса.
 * @param {string} params.api_key - Уникальный API-ключ компании.
 * @param {string} params.domain - Домен компании.
 *
 * @returns {Promise<
 *   | { success: false; message: string }
 *   | { success: true; chat_ids: { role: Role; chat_id: number }[] }
 * >}
 */
export async function get_data_company_and_director({
  api_key,
  domain,
}: {
  api_key: string;
  domain: string;
}): Promise<
  | { success: false; error_message?: string }
  | {
      success: true;
      chat_ids: { role: Role; chat_id: number }[];
      count: number;

      payment_type: PaymentType;
      payment_plan: PaymentPlan;
      countApplicationInMounth: number;
      chat_id_director: number;
      balance: number;
    }
  | {
      success: true;
      test: true;
      chat_id_director: number;
    }
> {
  try {
    const company = await Company.findOne({ api_key, domain }).populate([
      "users",
      "applications",
    ]);

    if (!company) {
      return {
        success: false,
        error_message: "❌ Компании с указанными данными не существует.",
      };
    }
    const users = company.users as unknown as IUser[];
    const director = users.filter((user) => user.role === Role.director)[0];
    if (!users || users.length === 0) {
      return {
        success: false,
        error_message: "⚠️ У компании нет зарегистрированных пользователей.",
      };
    }
    const applications = company.applications as unknown as IApplication[];
    const countApplication = applications.length;

    const countApplicationInMounth = applications.filter(
      (app) => new Date(app.createdAt).getMonth() === new Date().getMonth()
    ).length;

    const chat_ids = users
      .filter((user) => user.mute === false)
      .map((user) => ({
        chat_id: user.chat_id,
        role: user.role,
      }));
    if (company.test === true) {
      company.test = false;
      await company.save();
      return { success: true, chat_id_director: director.chat_id, test: true };
    }

    return {
      success: true,
      chat_ids,
      count: countApplication,
      balance: director.balance,
      chat_id_director: director.chat_id,
      payment_plan: director.payment_plan,
      payment_type: director.payment_type,
      countApplicationInMounth,
    };
  } catch (error) {
    console.error("Ошибка в get_data_company_and_director:", error);
    return {
      success: false,
      error_message: "❗ Произошла ошибка при получении данных компании.",
    };
  }
}
