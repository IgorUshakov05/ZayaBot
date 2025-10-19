import conf from "../../config/config";
import { add_comment } from "../../database/request/Application";

export async function replyMessag(ctx: any) {
  const { message } = ctx;
  const replyMessage = message?.reply_to_message;
  const originalText = message?.text;
  const chat_id = ctx.chat?.id;
  if (replyMessage.from.username !== conf.BOT_TAG) {
    return;
  }
  console.log("🔍 Данные ответа:", {
    message_id: replyMessage.message_id,
    originalText,
  });
  let new_comment = await add_comment({
    chat_id,
    comment: originalText,
    message_id: message.id,
  })
  console.log(new_comment)
}
