require("dotenv").config();
interface Config {
  PORT: number;
  MODE: string;
  DATABASE_URI: string;
  BOT_TOKEN: string;
  SHOP_ID: string;
  BASE_URL: string;
  BOT_TAG:string;
  BOT_TITLE: string;
  YOOUKASSA_SECKRET_KEY: string;
  PRICE_PER_REQUEST:number;
}

const conf: Config = {
  PORT: Number(process.env.PORT),
  MODE: String(process.env.MODE) || "DEV",
  SHOP_ID: String(process.env.SHOP_ID),
  PRICE_PER_REQUEST:Number(process.env.PRICE_PER_REQUEST),
  BOT_TAG: String(process.env.BOT_TAG),
  BOT_TITLE: String(process.env.BOT_TITLE),
  YOOUKASSA_SECKRET_KEY: String(process.env.YOOUKASSA_SECKRET_KEY),
  DATABASE_URI: String(process.env.DATABASE_URI),
  BOT_TOKEN: String(process.env.BOT_TOKEN),
  BASE_URL: String(process.env.BASE_URL),
};

export default conf;
