import { connectDB } from "./database";
import { get_user_payment_methods } from "./database/request/PaymentMethod";
import { sendRenewalReminder } from "./telegram/messages/subscriptionMessageSender";
import { IPayment } from "./types/PaymentShcema";

const start = () => {
  connectDB();
};
start();
(async () => {
  {
    console.log("Завтра");
    let x = await get_user_payment_methods(1);
    if (!x.success) return;
    x.payments.forEach((payment: any) => console.log(payment.user.chat_id));
    // console.log(x);
  }
  {
    console.log("Сегодня");
    let x = await get_user_payment_methods(0);
    if (!x.success) return;
    x.payments.forEach((payment: any) => console.log(payment.user.chat_id));
    console.log(x);
  }
})();
