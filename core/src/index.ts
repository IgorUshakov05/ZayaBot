import bot from "./bot";
import config from "./config/config";
import { connectDB } from "./database";
import app from "./web/index";

const start = async () => {
  try {
    await connectDB(); // подключаем базу
    console.log("✅ База данных подключена!");

    app.listen(config.PORT, () => {
      console.log(`🌐 Сервер запущен на http://localhost:${config.PORT}`);
    });
    console.log("✅ Бот успешно запущен!");
    await bot.launch();
  } catch (error) {
    console.error("❌ Ошибка при запуске:", error);
  }
};

start();
