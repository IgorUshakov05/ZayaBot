import express from "express";
import routerYoouKassa from "./webhook/router";
const app = express();

app.use(express.json());

app.use(routerYoouKassa);

export default app;
