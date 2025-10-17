import express from "express";
import routerYoouKassa from "./webhook/router";
import requestRouter from "./api/request/router";
import path from "path";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "dist")));

// Маршрутизация
app.use("/api/v1/", requestRouter);

// Хук Юкассы
app.use(routerYoouKassa);

export default app;
