import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

const downloadRouter = Router();

downloadRouter.get("/download", async (req: Request, res: Response) => {
  try {
    const filename = req.query.file as string;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: "Не указано имя файла",
      });
    }

    if (
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return res.status(400).json({
        success: false,
        message: "Некорректное имя файла",
      });
    }

    const filePath = path.join(__dirname, "..", "..", "storage", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Файл не найден",
      });
    }

    const fileStats = fs.statSync(filePath);

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", fileStats.size);
    res.setHeader("Cache-Control", "no-cache");

    const fileStream = fs.createReadStream(filePath);

    fileStream.on("error", (error) => {
      console.error("Ошибка чтения файла:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: "Ошибка при чтении файла",
        });
      }
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "Внутренняя ошибка сервера",
      });
    }
  }
});

export default downloadRouter;
