import { Scenes, session, Telegraf } from "telegraf";
import config from "../config/config";

// Комманды
import command_start from "./command/start";

// События
import messageHandle from "./middlewares/onMessage";

// Сцены
import registrationWizard from "./scenes/registationComapny";
import registrationUser from "./scenes/registrationUser";
import topupBalanceWizard from "./scenes/topUpBalance";

import removeTextCompany from "./action/removeCompany";
import topupBalance from "./action/topup_balance";
import tariffBalance from "./action/tariff";
import toggleTariffWizard from "./scenes/tariff";

// Типизация контекста для Wizard
type MyContext = Scenes.WizardContext;

const bot = new Telegraf<MyContext>(config.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([
  registrationWizard,
  registrationUser,
  toggleTariffWizard,
  topupBalanceWizard,
]);
bot.use(session());
bot.use(stage.middleware());
bot.start(command_start);

// Экшены
bot.action("remove_test_company", removeTextCompany);
bot.action("topup_balance", topupBalance);
bot.action(/^tariff_(.+)$/, tariffBalance);

bot.on("text", messageHandle);
export default bot;
