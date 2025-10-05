import { Types } from "mongoose";
import { Company } from "../schema/CompanySchema";
import { User } from "../schema/UserSchema";
import { v4 as uuidv4 } from "uuid";
import { ICompanySchema } from "../../types/CompanySchema";

interface CreateCompanyParams {
  user: { user_tag: string; chat_id: number; name: string };
  company: { title: string; domain: string };
}

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

export async function delete_company({ chat_id }: { chat_id: string }) {
  try {
    const findUser = await User.findOne({ chat_id }).populate("company");

    if (!findUser) {
      return {
        success: false,
        message: "⚠️ Вы не зарегистрированы в системе.",
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
    console.log(company);
    await User.deleteMany({ company: company._id });
    await Company.deleteOne({ _id: company._id, test: false });

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
