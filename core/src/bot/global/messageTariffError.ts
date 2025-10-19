import bot from "..";

export async function sendMessageTarriffError({
  chat_id_director,
  message,
}: {
  chat_id_director: number;
  message: string;
}): Promise<{ success: boolean; message?: string; error?: any }> {
  try {
    const result = await bot.telegram.sendMessage(chat_id_director, message, {
      parse_mode: "HTML",
    });

    console.log(`Сообщение отправлено директору ${chat_id_director}:`, {
      message_id: result.message_id,
      date: result.date,
    });

    return {
      success: true,
      message: "Сообщение успешно отправлено",
    };
  } catch (error: any) {
    console.error("Ошибка отправки сообщения директору:", {
      chat_id: chat_id_director,
      error: error.message,
      stack: error.stack,
    });

    let errorMessage = "Неизвестная ошибка при отправке сообщения";
    if (error.response?.error_code === 403) {
      errorMessage = "Бот заблокирован пользователем";
    } else if (error.response?.error_code === 400) {
      errorMessage = "Неверный идентификатор чата или формат сообщения";
    } else if (error.response?.error_code === 429) {
      errorMessage = "Превышен лимит отправки сообщений";
    } else if (error.code === "ETELEGRAM") {
      errorMessage = `Ошибка Telegram API: ${error.description}`;
    }

    return {
      success: false,
      message: errorMessage,
      error: error.response || error,
    };
  }
}
