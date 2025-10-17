import bot from "..";
import { Role } from "../../types/UserSchema";

/**
 * Отправляет уведомление всем пользователям компании.
 * Сообщения различаются по роли (директор / менеджер).
 *
 * @param {Object} params
 * @param {{ chat_id: number; role: Role }[]} params.users - Список пользователей компании.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export async function sendMessageAllUsers({
  users,
}: {
  users: { chat_id: number; role: Role }[];
}): Promise<{ success: boolean; message?: string }> {
  if (!users || users.length === 0) {
    return { success: false, message: "Нет пользователей для уведомления." };
  }

  const managerMessage = `📨 Новая заявка! Проверьте панель менеджера.`;
  const directorMessage = `👔 Новая заявка! Проверьте панель директора.`;

  try {
    // Используем Promise.allSettled для безопасной рассылки
    const results = await Promise.allSettled(
      users.map((user, i) =>
        new Promise((resolve) =>
          setTimeout(async () => {
            try {
              await bot.telegram.sendMessage(
                user.chat_id,
                user.role === Role.director ? directorMessage : managerMessage
              );
              resolve({ chat_id: user.chat_id, status: "sent" });
            } catch (err) {
              console.error(`Ошибка отправки пользователю ${user.chat_id}:`, err);
              resolve({ chat_id: user.chat_id, status: "failed" });
            }
          }, i * 500) // чуть быстрее, чем 1000мс — оптимизация
        )
      )
    );

    const failed = results.filter(
      (r) => r.status === "fulfilled" && (r.value as any).status === "failed"
    );

    if (failed.length > 0) {
      return {
        success: false,
        message: `Не удалось отправить ${failed.length} пользователям.`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке сообщений:", error);
    return { success: false, message: "Ошибка при рассылке сообщений." };
  }
}
