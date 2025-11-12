import { Request, Router, Response } from "express";
import { YooKassaWebhookBody } from "../../types/Yookassa";
import { setTariff, upBalanceUser } from "../../database/request/User";
import bot from "../../bot";
import { start } from "../../bot/keyboards/start";
import { create_or_updata_payment_method } from "../../database/request/PaymentMethod";
import { create_payment } from "../../database/request/Payment";
import { PaymentType } from "../../types/UserSchema";
const router = Router();

let stringBooltoBool = (str: string): boolean =>
  str === "true" ? true : str === "false" ? false : Boolean(str);

router.post("/webhook/yookassa", async (req: Request, res: Response) => {
  let data: YooKassaWebhookBody = await req.body;
  console.log(data);
  let isAutoPay = stringBooltoBool(data.object.metadata.isAutoPay);
  if (data.object.status === "succeeded") {
    // Это при платеже за заявки
    if (data.object.metadata?.paymentType === PaymentType.PER_REQUEST) {
      let balanse = await upBalanceUser({
        chat_id: data.object.metadata.chat_id,
        amount: data.object.amount.value,
        paymentType: data.object.metadata.paymentType,
      });
      if (!balanse.success) {
        throw Error(balanse.message);
      }
      await create_or_updata_payment_method({
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
    } else if (data.object.metadata?.paymentType === PaymentType.SUBSCRIPTION) {
      if (isAutoPay) {
        await create_or_updata_payment_method({
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
          isAuto: isAutoPay,
          status: data.object.status,
        });

        const amountInRubles = Number(data.object.amount.value).toFixed(2);

        await bot.telegram.sendMessage(
          data.object.metadata.chat_id,
          `
✨ <b>Ваш автоплатеж успешно выполнен!</b>

Тариф: <b>${data.object.metadata.paymentPlan}</b>
Сумма: <b>${amountInRubles} ₽</b>

<i>Спасибо, что остаетесь с нами!</i>
`,
          {
            parse_mode: "HTML",
            ...start.auth.director,
          }
        );
      } else {
        let newTariff = await setTariff({
          chat_id: data.object.metadata.chat_id,
          tariffType: data.object.metadata.paymentPlan,
          paymentType: data.object.metadata.paymentType,
        });
        if (!newTariff.success) {
          throw Error(newTariff.message);
        }
        await create_or_updata_payment_method({
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
          newTariff.message,
          {
            ...start.auth.director,
            parse_mode: "Markdown",
          }
        );
      }
    }
  } else if (data.object.status === "canceled") {
    if (data.object.metadata?.paymentType === PaymentType.SUBSCRIPTION) {
      if (isAutoPay) {
        const amountInRubles = Number(data.object.amount.value).toFixed(2);

        await bot.telegram.sendMessage(
          data.object.metadata.chat_id,
          `
❌ <b>Автоплатеж не выполнен</b>

Тариф: <b>${data.object.metadata.paymentPlan}</b>
Сумма: <b>${amountInRubles} ₽</b>

<i>Пожалуйста, проверьте данные вашей карты 
или обратитесь в поддержку банка.</i>
`,
          {
            parse_mode: "HTML",
            ...start.auth.director,
          }
        );
      }
    }
  }
  return await res.status(200).send({ success: true });
});

export default router;
