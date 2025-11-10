import axios from "axios";
import conf from "../../config/config";

export interface SendMessageParams {
  chat_id: number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: any;
}
export default async function subscriptionMessageSender(
  params: SendMessageParams
) {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${conf.BOT_TOKEN}/sendMessage`,
      params
    );

    return response.data.ok;
  } catch (error) {
    console.error("Ошибка отправки сообщения в Telegram:", error);
    return false;
  }
}

export const sendRenewalReminder = async (
  userChatId: number,
  daysUntilRenewal: number
) => {
  const messages = {
    1: `🔔 Напоминание: Ваша подписка будет продлена <b>завтра</b>`,
    2: `🔔 Напоминание: Ваша подписка будет продлена <b>послезавтра</b>`,
    3: `🔔 Напоминание: До продления подписки осталось <b>3 дня</b>`,
  };

  const text =
    messages[daysUntilRenewal as keyof typeof messages] ||
    `🔔 Напоминание: До продления подписки осталось ${daysUntilRenewal} дней`;

  const success = await subscriptionMessageSender({
    chat_id: userChatId,
    text: text,
    parse_mode: "HTML",
  });

  return success;
};
