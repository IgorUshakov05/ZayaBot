import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { ApplicationData } from "../../../types/Application";
import { requestValidator } from "../../validator/request";
import { validationResult } from "express-validator";
import { validateDomain } from "./validateRoute";
import { get_data_company_and_director } from "../../../database/request/Company";
import { sendMessageAllUsers } from "../../../bot/global/newRequest";
import { sendTestMessage } from "../../../bot/global/testRequest";

// Вот функция, нужно с ней дальше работать, это для работы с заявкой
import { create_application } from "../../../database/request/Application";
import { checkTariff } from "../../validator/checkTariff";
import { sendMessageTarriffError } from "../../../bot/global/messageTariffError";
import { PaymentType } from "../../../types/UserSchema";
import { downBalanceUser } from "../../../database/request/User";

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

      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res
          .status(400)
          .json({ success: false, errors: validationErrors.array() });
      }

      const {
        name,
        user_phone,
        user_company,
        user_post,
        message,
        user_address,
      }: ApplicationData = req.body;

      const uploadedFile = req.file;

      let data = await get_data_company_and_director({
        api_key,
        domain: queryDomain,
      });

      if (!data.success) {
        return res
          .status(400)
          .json({ success: data.success, message: data.error_message });
      }

      if ("test" in data && data.test) {
        await sendTestMessage({
          chat_id: data.chat_id_director,
          domain: queryDomain,
          data: {
            name,
            user_phone,
            user_company,
            user_post,
            message,
            user_address,
          },
        });
      }
      if ("chat_ids" in data && data.chat_ids) {
        console.log(data.balance, " баланс");
        let check_tariff = await checkTariff({
          application: {
            name,
            user_phone,
            user_company,
            user_post,
            message,
            user_address,
          },
          balance: data.balance,
          countApplicationInMounth: data.countApplicationInMounth,
          payment_plan: data.payment_plan,
          payment_type: data.payment_type,
        });

        if (!check_tariff.success) {
          await sendMessageTarriffError({
            chat_id_director: data.chat_id_director,
            message: check_tariff.message,
          });
          return res.json({
            success: false,
            message: "Обновите тарифный план!",
          });
        }
        let send_message = await sendMessageAllUsers({
          count: data.count,
          users: data.chat_ids,
          data: check_tariff.filtredApplication,
        });

        if (!send_message.success) {
          return res.status(500).json({
            success: false,
            message: send_message.message,
          });
        }
        console.log(send_message.chat_data);
        let save_application_with_chat_ids = await create_application({
          api_key,
          count: data.count + 1,
          chat_data: send_message.chat_data,
          data: check_tariff.filtredApplication,
        });

        if (data.payment_type === PaymentType.PER_REQUEST) {
          // Тут я списываю с баланса!
          let downBalance = await downBalanceUser({
            chat_id: data.chat_id_director,
          });
          console.log(downBalance);
        }

        if (!save_application_with_chat_ids.success) {
          return res.status(500).json({
            success: false,
            message: "Ошибка рассылке заявки",
          });
        }
      }

      return res.status(201).json({
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
