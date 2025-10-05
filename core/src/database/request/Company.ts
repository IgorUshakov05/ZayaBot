import { Types } from "mongoose";
import { Role } from "../../types/UserSchema";
import { Company } from "../schema/CompanySchema";
import { User } from "../schema/UserSchema";
import { v4 as uuidv4 } from "uuid";

interface CreateCompanyParams {
  user: { user_tag: string; chat_id: number; name: string };
  company: { title: string; domain: string };
}

export async function createCompanyAndUser({
  user,
  company,
}: CreateCompanyParams) {
  try {
    // 1️⃣ Проверяем, есть ли уже компания с таким доменом
    let existingCompany = await Company.findOne({
      domain: company.domain,
      test: true,
    });
    if (existingCompany) {
      return {
        success: false,
        message: "Компания с таким доменом уже существует!",
      };
    }

    // 2️⃣ Создаём компанию
    const newCompany = await Company.create({
      title: company.title,
      domain: company.domain,
      api_key: uuidv4(),
      users: [],
    });

    // 3️⃣ Создаём пользователя и привязываем его к компании
    const newUser = await User.create({
      name: user.name,
      user_tag: user.user_tag,
      chat_id: user.chat_id,
      role: "director",
      company: newCompany._id,
    });

    // 4️⃣ Добавляем пользователя в массив компании
    newCompany.users.push(newUser._id as Types.ObjectId);
    await newCompany.save();

    return { success: true, company: newCompany, user: newUser };
  } catch (error) {
    console.error("Ошибка создания компании и пользователя:", error);
    return {
      success: false,
      message: "Ошибка создания компании и пользователя!",
    };
    throw error;
  }
}
