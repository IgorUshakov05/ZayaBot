import { Markup } from "telegraf";
import bot from "..";
import { ApplicationData } from "../../types/Application";
import { Role } from "../../types/UserSchema";
import { applicationManageMurkap } from "../keyboards/application";
import { buildManagerMessage } from "./buildManagerMessage";
import IApplication from "../../types/ApplicationSchema";

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
}): Promise<
  | {
      success: true;
      chat_data: { chat_id: number; message_id: number; role: Role }[] | [];
    }
  | { success: false; message: string }
> {
  if (!users || users.length === 0) {
    return { success: false, message: "Нет пользователей для уведомления." };
  }

  let new_message = buildManagerMessage({
    ...data,
    count: count + 1,
  } as IApplication);

  try {
    const promises = users.map(
      (user, i) =>
        new Promise<{
          chat_id: number;
          status: "failed" | "sent";
          role: Role;
          message_id: number;
        }>((resolve) =>
          setTimeout(async () => {
            try {
              const sentMessage = await bot.telegram.sendMessage(
                user.chat_id,
                new_message,
                { parse_mode: "HTML" }
              );
              if (user.role === Role.manager) {
                await bot.telegram.editMessageReplyMarkup(
                  user.chat_id,
                  sentMessage.message_id,
                  undefined,
                  applicationManageMurkap(sentMessage.message_id)
                    .newApplicationManager.reply_markup
                );
              }

              resolve({
                chat_id: user.chat_id,
                status: "sent",
                role: user.role,
                message_id: sentMessage.message_id,
              });
            } catch (err) {
              resolve({
                chat_id: user.chat_id,
                message_id: 0,
                role: user.role,
                status: "failed",
              });
            }
          }, i * 100)
        )
    );

    const result = await Promise.allSettled(promises);
    const fulfilled: { chat_id: number; message_id: number; role: Role }[] =
      result
        .filter(
          (
            r
          ): r is PromiseFulfilledResult<{
            chat_id: number;
            role: Role;
            status: "failed" | "sent";
            message_id: number;
          }> => r.status === "fulfilled"
        )
        .map((item) => {
          return {
            chat_id: item.value.chat_id,
            role: item.value.role,
            message_id: item.value.message_id,
          };
        });

    return { success: true, chat_data: fulfilled };
  } catch (error) {
    console.error("Ошибка при отправке сообщений:", error);
    return { success: false, message: "Ошибка при рассылке сообщений." };
  }
}
