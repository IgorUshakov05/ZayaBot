import { ApplicationData } from "../../types/Application";
import { Application } from "../schema/ApplicationSchema";
import { Company } from "../schema/CompanySchema";

/**
 * Создаёт новую заявку и связывает её с компанией по api_key.
 *
 * @param param0.data - Данные заявки, соответствующие типу ApplicationData
 * @param param0.chat_data - Массив объектов с chat_id и message_id для хранения сообщений Telegram
 * @param param0.api_key - API-ключ компании, к которой привязывается заявка
 *
 * @returns Объект с результатом выполнения:
 *          - success: true при успешном создании
 *          - success: false и сообщение об ошибке в случае сбоя
 */

export async function create_application({
  data,
  chat_data,
  api_key,
}: {
  data: ApplicationData;
  chat_data: { message_id: number; chat_id: number }[];
  api_key: string;
}): Promise<{ success: true } | { success: false; message: string }> {
  try {
    const newApplication = new Application({ ...data, chats: chat_data });

    await newApplication.save();
    console.log("Создана заявка с ID:", newApplication._id);

    const company = await Company.findOneAndUpdate(
      { api_key },
      { $push: { applications: newApplication._id } },
      { new: true }
    );

    if (!company) {
      return { success: false, message: "Компания с таким api_key не найдена" };
    }

    return { success: true };
  } catch (error) {
    console.error(error, " create_application");
    return { success: false, message: "Ошибка при сохранении заявки" };
  }
}
