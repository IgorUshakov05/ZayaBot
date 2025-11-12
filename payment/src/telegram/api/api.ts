import axios, { AxiosError } from "axios";
import conf from "../../config/config";

export interface SendMessageParams {
  chat_id: number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: any;
}

export default async function subscriptionMessageSender(
  params: SendMessageParams
): Promise<{ success: boolean; status: number; error?: string }> {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${conf.BOT_TOKEN}/sendMessage`,
      params,
      {
        timeout: 30000,
      }
    );

    const isSuccess = response.data.ok === true;

    return {
      success: isSuccess,
      status: response.status,
      error: isSuccess ? undefined : response.data.description,
    };
  } catch (error: any) {
    console.error(
      `Ошибка отправки пользователю ${params.chat_id}:`,
      error.message
    );

    const status = error.response?.status || error.status || 500;
    const errorMessage = error.response?.data?.description || error.message;

    return {
      success: false,
      status: status,
      error: errorMessage,
    };
  }
}
