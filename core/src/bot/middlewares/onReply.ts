import { Context } from "telegraf";
import conf from "../../config/config";
import { add_comment_application } from "../../database/request/Application";
import { applicationManageMurkap } from "../keyboards/application";
import { buildManagerMessage } from "../global/buildManagerMessage";

export async function replyMessag(ctx: any) {
  const { message } = ctx;
  const replyMessage = message?.reply_to_message;
  const originalText = message?.text;
  const chat_id = ctx.chat?.id;
  await ctx.telegram.deleteMessage(chat_id, ctx.message.message_id);
  try {
    if (replyMessage.from.username !== conf.BOT_TAG) {
      return;
    }
    let new_comment = await add_comment_application({
      chat_id,
      comment: originalText,
      message_id: replyMessage.message_id,
    });
    if (!new_comment.success) {
      return ctx.reply(new_comment.message);
    }

    let new_message = buildManagerMessage(new_comment.application);

    await ctx.telegram.editMessageText(
      chat_id,
      replyMessage.message_id,
      undefined,
      new_message,
      {
        parse_mode: "HTML",
        ...applicationManageMurkap(replyMessage.message_id).inWorkForManager,
      }
    );
  } catch (error) {
    console.error(error);
  }
}
