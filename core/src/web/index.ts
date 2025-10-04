import { Request, Response } from "express";
const express = require("express");
const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ data: "" });
});

app.post("/data", (req: Request, res: Response) => {});

export default app;
