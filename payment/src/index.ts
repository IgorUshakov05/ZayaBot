import { connectDB } from "./database";
import { get_user_payment_methods } from "./database/request/PaymentMethod";
import { sendMessageUsersWithRateLimit } from "./telegram/spam";
import payUsers from "./payment/payUsers";

const start = () => {
  connectDB();
};
start();
(async () => {
  {
    let x = await get_user_payment_methods(2);
    if (!x.success) return;
    await sendMessageUsersWithRateLimit(x.payments, 2);
  }
  {
    let x = await get_user_payment_methods(1);
    if (!x.success) return;
    await sendMessageUsersWithRateLimit(x.payments, 1);
  }
  {
    let x = await get_user_payment_methods(0);
    if (!x.success) return;
    await payUsers(x.payments);
  }
})();
