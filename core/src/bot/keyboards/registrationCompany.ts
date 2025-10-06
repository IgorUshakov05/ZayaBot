import { Markup } from "telegraf";

export const registrationCompany = {
  cancel: {
    ...Markup.keyboard([["❌ Прекратить регистрацию"]]).resize(true),
  },
  finally: {
    ...Markup.keyboard([
      ["📄 Скачать документацию PDF"],
      ["❌ Удалить компанию"],
    ]).resize(true),
  },
};
