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
import editUserWizard from "./scenes/editUser";

import removeTextCompany from "./action/removeCompany";
import topupBalance from "./action/topup_balance";
import tariffBalance from "./action/tariff";
import toggleTariffWizard from "./scenes/tariff";
import notificationAction from "./action/notification";
import inWorkAction from "./action/inWork.application";
import cancelApplicationAction from "./action/cancel.application";
import finishApplicationAction from "./action/finish.application";
import exportApplication from "./action/exportApplication";
import removeManagerAction from "./action/removeManager";
import exportDocument from "./action/exportDocument";

// Типизация контекста для Wizard
type MyContext = Scenes.WizardContext;

const bot = new Telegraf<MyContext>(config.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([
  registrationWizard,
  registrationUser,
  toggleTariffWizard,
  topupBalanceWizard,
  editUserWizard,
]);
bot.use(session());
bot.use(stage.middleware());
bot.start(command_start);

// Экшены
bot.action("remove_test_company", removeTextCompany);
bot.action("topup_balance", topupBalance);
bot.action(/^tariff_(.+)$/, tariffBalance);
bot.action(/^notification_(off|on)$/, notificationAction);
bot.action(/^inwork_(\d+)/, inWorkAction as any);
bot.action(/^cancel_(\d+)/, cancelApplicationAction);
bot.action(/^finish_(\d+)/, finishApplicationAction);
bot.action(/^removemanager_(\d+)/, removeManagerAction as any);
bot.action(/exportApplication/, exportApplication)
bot.action(/^export_(excel|csv)$/,exportDocument)

bot.on("text", messageHandle);
export default bot;
