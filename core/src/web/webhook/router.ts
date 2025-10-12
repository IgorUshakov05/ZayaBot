import { Request, Router, Response } from "express";
import { YooKassaWebhookBody } from "../../types/Yookassa";
import { upBalanceUser } from "../../database/request/User";
import bot from "../../bot";
const router = Router();

router.post("/webhook/yookassa", async (req: Request, res: Response) => {
  let data: YooKassaWebhookBody = await req.body;
  if (data.object.status === "succeeded") {
    // Это при платеже за заявки
    if (data.object.metadata?.paymentType) {
      let balanse = await upBalanceUser({
        chat_id: data.object.metadata.chat_id,
        amount: data.object.amount.value,
      });
      if (!balanse.success) {
        throw Error(balanse.message);
      }
      await bot.telegram.sendMessage(
        data.object.metadata.chat_id,
        balanse.message,
        {
          parse_mode: "Markdown", // или "HTML", если используешь HTML-форматирование
        }
      );
    }
  }
  return await res.status(200).send({ success: true });
});

export default router;
