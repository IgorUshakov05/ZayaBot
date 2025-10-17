import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { IApplicationRequest } from "../../../types/Application";
import { requestValidator } from "../../validator/request";
import { validationResult } from "express-validator";
import { validateDomain } from "./validateRoute";
import { get_data_company_and_director } from "../../../database/request/Company";
import { sendMessageAllUsers } from "../../../bot/global/newRequest";
import { sendTestMessage } from "../../../bot/global/testRequest";

const requestRouter = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "storage"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 МБ
});

// Роут для отправки заявок
requestRouter.post(
  "/request",
  requestValidator,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const originHeader = req.headers.origin as string;

      // Данные для функции
      const requestDomain = originHeader ? new URL(originHeader).host : "";
      const queryDomain = req.query.domain as string;
      const api_key = req.headers["x-api-key"] as string;

      if (!queryDomain || !requestDomain) {
        return res.json({
          success: false,
          message: "Скрытые источники",
        });
      }
      if (!api_key) {
        return res.json({
          success: false,
          message: "API ключа нет!",
        });
      }
      if (!validateDomain({ queryDomain, requestDomain })) {
        return res.json({
          success: false,
          message: "Не верный источник",
          queryDomain,
          requestDomain,
        });
      }
      console.log("CORS origin:", requestDomain);
      console.log("Query domain:", req.query.domain);

      console.log("API Key: ", api_key);

      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res
          .status(400)
          .json({ success: false, errors: validationErrors.array() });
      }

      const {
        name,
        phone,
        company,
        post,
        message,
        address,
      }: IApplicationRequest = req.body;

      const uploadedFile = req.file;

      console.log("Request body:", req.body);
      console.log("Uploaded file:", uploadedFile);

      let data = await get_data_company_and_director({
        api_key,
        domain: queryDomain,
      });

      console.log(data);
      if (!data.success) {
        return res
          .status(400)
          .json({ success: data.success, message: data.error_message });
      }

      if ("test" in data && data.test) {
        await sendTestMessage({
          chat_id: data.chat_id_director,
          domain: queryDomain,
        });
      }
      if ("chat_ids" in data && data.chat_ids) {
        await sendMessageAllUsers({ users: data.chat_ids });
      }

      return res.json({
        success: true,
        message: "Успех!",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Ошибка сервера" });
    }
  }
);

export default requestRouter;
