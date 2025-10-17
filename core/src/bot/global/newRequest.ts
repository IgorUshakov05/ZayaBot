import bot from "..";
import { ApplicationData } from "../../types/Application";
import { Role } from "../../types/UserSchema";

/**
 * Отправляет уведомление всем пользователям компании.
 * Сообщения различаются по роли (директор / менеджер).
 *
 * @param {Object} params
 * @param {{ chat_id: number; role: Role }[]} params.users - Список пользователей компании.
 * @param {ApplicationData} params.data - Данные заявки.
 * @returns {Promise<{ success: boolean; message?: string }>}
 */
export async function sendMessageAllUsers({
  users,
  data,
  count,
}: {
  users: { chat_id: number; role: Role }[];
  data: ApplicationData;
  count: number;
}): Promise<{ success: boolean; message?: string }> {
  if (!users || users.length === 0) {
    return { success: false, message: "Нет пользователей для уведомления." };
  }

  const parts: string[] = [`🔔 <b>Заявка #${count+1}:</b>\n`];

  if (data.name) parts.push(`👤 Имя: ${data.name}`);
  if (data.phone) parts.push(`📞 Телефон: ${data.phone}`);
  if (data.post) parts.push(`📧 Почта: ${data.post}`);
  if (data.address) parts.push(`🏢 Адрес: ${data.address}`);
  if (data.company) parts.push(`💸 Адрес: ${data.company}`);
  if (data.message) parts.push(`💬 Сообщение: ${data.message}`);
  if (data.file) parts.push(`📎 Файл: В тестовом отсуствует`);

  const message = parts.join("\n");

  try {
    const promises = users.map(
      (user, i) =>
        new Promise<{
          chat_id: number;
          status: "failed" | "sent";
          message_id?: number;
        }>((resolve) =>
          setTimeout(async () => {
            try {
              const sentMessage = await bot.telegram.sendMessage(
                user.chat_id,
                message,
                { parse_mode: "HTML" }
              );
              resolve({
                chat_id: user.chat_id,
                status: "sent",
                message_id: sentMessage.message_id,
              });
            } catch (err) {
              resolve({ chat_id: user.chat_id, status: "failed" });
            }
          }, i * 100)
        )
    );

    const result = await Promise.allSettled(promises);
    const fulfilled: { chat_id: number; message_id?: number }[] = result
      .filter(
        (
          r
        ): r is PromiseFulfilledResult<{
          chat_id: number;
          status: "failed" | "sent";
          message_id?: number;
        }> => r.status === "fulfilled"
      )
      .map((item) => {
        return {
          chat_id: item.value.chat_id,
          message_id: item.value.message_id,
        };
      });

    console.log("Результаты рассылки:", fulfilled);

    return { success: true };
  } catch (error) {
    console.error("Ошибка при отправке сообщений:", error);
    return { success: false, message: "Ошибка при рассылке сообщений." };
  }
}
