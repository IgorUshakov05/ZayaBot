require("dotenv").config();
interface Config {
  PORT: Number;
  MODE: String;
  BASE_URL: String;
}

const conf: Config = {
  PORT: Number(process.env.PORT),
  MODE: String(process.env.MODE) || "DEV",
  BASE_URL: String(process.env.BASE_URL),
};

export default conf;
