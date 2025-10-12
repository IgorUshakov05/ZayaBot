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

// Типизация контекста для Wizard
type MyContext = Scenes.WizardContext;

const bot = new Telegraf<MyContext>(config.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([
  registrationWizard,
  registrationUser,
  topupBalanceWizard,
]);
bot.use(session());
bot.use(stage.middleware());
bot.start(command_start);

// Экшены
bot.action("remove_test_company", removeTextCompany);
bot.action("topup_balance", topupBalance);

bot.on("text", messageHandle);
export default bot;
