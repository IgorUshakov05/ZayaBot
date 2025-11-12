require("dotenv").config();
interface Config {
  PORT: number;
  MODE: "DEV" | "PROD";
  DATABASE_URI_DEV: string;
  DATABASE_URI_PROD: string;
  BOT_TOKEN: string;
  SHOP_ID: string;
  BASE_URL: string;
  BOT_TAG: string;
  BOT_TITLE: string;
  YOOUKASSA_SECKRET_KEY: string;
  PRICE_PER_REQUEST: number;
  STORE_FOLDER: string;
}

const conf: Config = {
  PORT: Number(process.env.PORT),
  MODE: process.env.MODE as "DEV" | "PROD",
  SHOP_ID: String(process.env.SHOP_ID),
  PRICE_PER_REQUEST: Number(process.env.PRICE_PER_REQUEST),
  BOT_TAG: String(process.env.BOT_TAG),
  BOT_TITLE: String(process.env.BOT_TITLE),
  STORE_FOLDER: String(process.env.STORE_FOLDER),
  YOOUKASSA_SECKRET_KEY: String(process.env.YOOUKASSA_SECKRET_KEY),
  DATABASE_URI_DEV: String(process.env.DATABASE_URI_DEV),
  DATABASE_URI_PROD: String(process.env.DATABASE_URI_PROD),
  BOT_TOKEN: String(process.env.BOT_TOKEN),
  BASE_URL: String(process.env.BASE_URL),
};

export default conf;
