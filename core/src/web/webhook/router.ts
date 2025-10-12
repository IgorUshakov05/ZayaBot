import { Request, Router, Response } from "express";
import { YooKassaWebhookBody } from "../../types/Yookassa";
import { upBalanceUser } from "../../database/request/User";
import bot from "../../bot";
import { start } from "../../bot/keyboards/start";
import { create_payment_method } from "../../database/request/PaymentMethod";
import { PaymentMethodType } from "../../types/PaymentMethodSchema";
import { create_payment } from "../../database/request/Payment";
const router = Router();

router.post("/webhook/yookassa", async (req: Request, res: Response) => {
  let data: YooKassaWebhookBody = await req.body;
  if (data.object.status === "succeeded") {
    // Это при платеже за заявки
    if (data.object.metadata?.paymentType) {
      let balanse = await upBalanceUser({
        chat_id: data.object.metadata.chat_id,
        amount: data.object.amount.value,
        paymentType: data.object.metadata.paymentType,
      });
      if (!balanse.success) {
        throw Error(balanse.message);
      }
      await create_payment_method({
        chat_id: data.object.metadata.chat_id,
        payment_method_id: data.object.payment_method.id,
        saved: data.object.payment_method.saved,
        type: data.object.payment_method?.type,
        card: data.object.payment_method.card,
      });
      await create_payment({
        payment_method_id: data.object.payment_method.id,
        amount: data.object.amount,
        chat_id: data.object.metadata.chat_id,
        paid: data.object.paid,
        isAuto: data.object.payment_method.saved,
        status: data.object.status,
      });
      await bot.telegram.sendMessage(
        data.object.metadata.chat_id,
        balanse.message,
        {
          ...start.auth.director,
          parse_mode: "Markdown",
        }
      );
    }
  }
  return await res.status(200).send({ success: true });
});

export default router;
