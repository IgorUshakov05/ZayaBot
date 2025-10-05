require("dotenv").config();
interface Config {
  PORT: Number;
  MODE: string;
  DATABASE_URI: string;
  BOT_TOKEN: string;
  BASE_URL: string;
}

const conf: Config = {
  PORT: Number(process.env.PORT),
  MODE: String(process.env.MODE) || "DEV",
  DATABASE_URI: String(process.env.DATABASE_URI),
  BOT_TOKEN: String(process.env.BOT_TOKEN),
  BASE_URL: String(process.env.BASE_URL),
};

export default conf;
