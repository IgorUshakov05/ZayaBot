export enum PaymentMethodType {
  bank_card = "bank_card",
  yoo_money = "yoo_money",
  sberbank = "sberbank",
  tinkoff_bank = "tinkoff_bank",
  sbp = "sbp",
}

export default interface IPaymentMethod {
  id: string; // payment_method.id из ЮKassa
  payment_method_id: string; // Для автоплатежа айдишка
  type: PaymentMethodType; // тип метода оплаты
  saved: boolean; // Автоплатеж

  card?: {
    first6?: string;
    last4?: string;
    card_type?: string; // Mir
  };

  createdAt: Date;
  updatedAt: Date;
}
