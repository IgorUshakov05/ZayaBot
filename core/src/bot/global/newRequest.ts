import bot from "..";
import { ApplicationData } from "../../types/Application";
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
  data,
}: {
  users: { chat_id: number; role: Role }[];
  data: ApplicationData;
}): Promise<{ success: boolean; message?: string }> {
  if (!users || users.length === 0) {
    return { success: false, message: "Нет пользователей для уведомления." };
  }

  const parts: string[] = [`🔔 <b>Заявка #1:</b>`];

  if (data.name) parts.push(`👤 Имя: ${data.name}`);
  if (data.phone) parts.push(`📞 Телефон: ${data.phone}`);
  if (data.post) parts.push(`💼 Должность: ${data.post}`);
  if (data.address) parts.push(`🏢 Адрес: ${data.address}`);
  if (data.message) parts.push(`💬 Сообщение: ${data.message}`);
  if (data.file) parts.push(`📎 Файл: В тестовом отсуствует`);

  parts.push(
    "",
    `ℹ️ На бесплатном тарифе доступно 10 заявок в месяц.`,
    `(Тестовая заявка не учитывается).`
  );

  const message = parts.join("\n");
  try {
    // Используем Promise.allSettled для безопасной рассылки
    const results = await Promise.allSettled(
      users.map(
        (user, i) =>
          new Promise(
            (resolve) =>
              setTimeout(async () => {
                try {
                  await bot.telegram.sendMessage(user.chat_id, message);
                  resolve({ chat_id: user.chat_id, status: "sent" });
                } catch (err) {
                  console.error(
                    `Ошибка отправки пользователю ${user.chat_id}:`,
                    err
                  );
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
