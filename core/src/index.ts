import config from "./config/config";

import app from "./web/index";

app.listen(config.PORT, () => {
  console.log(`Сервер запущен на http://localhost:${process.env.PORT}`);
});
