require("dotenv").config();
interface Config {
  PORT: number;
  MODE: string;
  DATABASE_URI: string;
  BOT_TOKEN: string;
  SHOP_ID: string;
  BASE_URL: string;
  YOOUKASSA_SECKRET_KEY: string;
}

const conf: Config = {
  PORT: Number(process.env.PORT),
  MODE: String(process.env.MODE) || "DEV",
  SHOP_ID: String(process.env.SHOP_ID),
  YOOUKASSA_SECKRET_KEY: String(process.env.YOOUKASSA_SECKRET_KEY),
  DATABASE_URI: String(process.env.DATABASE_URI),
  BOT_TOKEN: String(process.env.BOT_TOKEN),
  BASE_URL: String(process.env.BASE_URL),
};

export default conf;
