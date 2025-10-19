import bot from "..";
import { ApplicationData } from "../../types/Application";
import { Role } from "../../types/UserSchema";
import { start } from "../keyboards/start";

/**
 * Отправляет тестовое уведомление директору с данными заявки.
 *
 * @param {Object} params
 * @param {number} params.chat_id - ID чата директора.
 * @param {string} params.domain - Домен компании.
 * @param {Omit<IApplication, "createdAt" | "updatedAt">} params.data - Данные тестовой заявки.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export async function sendTestMessage({
  chat_id,
  domain,
  data,
}: {
  chat_id: number;
  domain: string;
  data: ApplicationData;
}): Promise<{ success: boolean; message?: string }> {
  if (!chat_id) {
    return { success: false, message: "Нет пользователей для уведомления." };
  }

  // Формируем тело сообщения с учётом существующих полей
  const parts: string[] = [
    `🔔 <b>Тестовая заявка успешно получена!</b>`,
    `Ваш домен <b>${domain}</b> подтверждён.`,
    "",
    `📋 <b>Данные заявки:</b>`,
  ];

  if (data.name) parts.push(`👤 Имя: ${data.name}`);
  if (data.user_phone) parts.push(`📞 Телефон: ${data.user_phone}`);
  if (data.user_post) parts.push(`💼 Должность: ${data.user_post}`);
  if (data.user_address) parts.push(`🏢 Адрес: ${data.user_address}`);
  if (data.message) parts.push(`💬 Сообщение: ${data.message}`);
  if (data.file) parts.push(`📎 Файл: В тестовом отсуствует`);

  parts.push(
    "",
    `ℹ️ На бесплатном тарифе доступно 10 заявок в месяц.`,
    `(Тестовая заявка не учитывается).`
  );

  const directorMessage = parts.join("\n");

  try {
    await bot.telegram.sendMessage(chat_id, directorMessage, {
      parse_mode: "HTML",
      ...start.auth.director,
    });

    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    return {
      success: false,
      message: "Ошибка при отправке тестового сообщения.",
    };
  }
}
