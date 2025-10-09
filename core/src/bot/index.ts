import { Scenes, session, Telegraf } from "telegraf";
import config from "../config/config";

// Комманды
import command_start from "./command/start";

// События
import messageHandle from "./middlewares/onMessage";

// Сцены
import registrationWizard from "./scenes/registationComapny";
import removeTextCompany from "./action/removeCompany";

// Типизация контекста для Wizard
type MyContext = Scenes.WizardContext;

const bot = new Telegraf<MyContext>(config.BOT_TOKEN);
const stage = new Scenes.Stage<MyContext>([registrationWizard]);
bot.use(session());
bot.use(stage.middleware());
bot.start(command_start);

// Экшены
bot.action("remove_test_company", removeTextCompany);

bot.on("text", messageHandle);
export default bot;
