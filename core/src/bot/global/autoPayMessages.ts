import IPaymentMethod, {
  PaymentMethodType,
} from "../../types/PaymentMethodSchema";

export const get_disable_auto_pay_message = (
  payment_method: IPaymentMethod
) => {
  const { type, card } = payment_method;

  let payment_info = "";

  switch (type) {
    case PaymentMethodType.bank_card:
      if (card?.first6 && card?.last4) {
        payment_info = `💳 Банковская карта: **** ${card.first6}****${card.last4}`;
        if (card.card_type) {
          payment_info += `\n📋 Тип: ${card.card_type}`;
        }
      } else {
        payment_info = "💳 Банковская карта";
      }
      break;

    case PaymentMethodType.yoo_money:
      payment_info = "👛 ЮMoney";
      break;

    case PaymentMethodType.sberbank:
      payment_info = "🏦 Сбербанк Онлайн";
      break;

    case PaymentMethodType.tinkoff_bank:
      payment_info = "💙 Тинькофф";
      break;

    case PaymentMethodType.qiwi:
      payment_info = "🥝 QIWI Кошелек";
      break;

    case PaymentMethodType.sbp:
      payment_info = "📱 СБП (Система быстрых платежей)";
      break;

    default:
      payment_info = "💳 Платёжный метод";
  }

  return `🔒 <b>Отключение автоплатежа</b>

${payment_info}

📅 Автоплатеж был подключен: ${payment_method.createdAt.toLocaleDateString(
    "ru-RU"
  )}

⚠️ <i>После отключения автоплатежа подписка не будет продлеваться автоматически</i>

Вы уверены, что хотите отключить автоплатеж?`;
};

export const get_disable_auto_pay_success_message = (
  payment_method: IPaymentMethod
) => {
  const { type, card } = payment_method;

  let payment_info = "";

  switch (type) {
    case PaymentMethodType.bank_card:
      if (card?.last4) {
        payment_info = `карты ····${card.last4}`;
      } else {
        payment_info = "банковской карты";
      }
      break;
    case PaymentMethodType.yoo_money:
      payment_info = "ЮMoney";
      break;
    case PaymentMethodType.sberbank:
      payment_info = "Сбербанк Онлайн";
      break;
    case PaymentMethodType.tinkoff_bank:
      payment_info = "Тинькофф";
      break;
    case PaymentMethodType.qiwi:
      payment_info = "QIWI Кошелька";
      break;
    case PaymentMethodType.sbp:
      payment_info = "СБП";
      break;
    default:
      payment_info = "платёжного метода";
  }

  return `✅ <b>Автоплатеж отключен</b>

🔒 Автоплатеж для ${payment_info} успешно отключен.

⚠️ <i>Теперь подписка не будет продлеваться автоматически. Не забудьте вовремя продлить подписку вручную!</i>

🔄 <b>Чтобы включить автоплатеж обратно:</b>
При следующей оплате подписки поставьте галочку "Разрешить автосписание" или "Сохранить для повторных платежей" в платежной форме.
`;
};
