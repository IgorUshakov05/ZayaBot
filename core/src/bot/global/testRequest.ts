import bot from "..";
import { Role } from "../../types/UserSchema";
import { start } from "../keyboards/start";

/**
 * Отправляет уведомление всем пользователям компании.
 * Сообщения различаются по роли (директор / менеджер).
 *
 * @param {Object} params
 * @param {{ chat_id: number; role: Role }[]} params.users - Список пользователей компании.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export async function sendTestMessage({
  chat_id,
  domain,
}: {
  chat_id: number;
  domain: string;
}): Promise<{ success: boolean; message?: string }> {
  if (!chat_id) {
    return { success: false, message: "Нет пользователей для уведомления." };
  }

  const directorMessage = `🔔 Тестовая заявка успешно получена!
Ваш домен ${domain} подтверждён. На бесплатном тарифе доступно 10 заявок в месяц (тестовая заявка не учитывается).`;

  try {
    // Используем Promise.allSettled для безопасной рассылки

    await bot.telegram.sendMessage(
      chat_id,
      directorMessage,
      start.auth.director
    );

    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке сообщения:", error);
    return {
      success: false,
      message: "Ошибка при отправке тестового сообщения.",
    };
  }
}
