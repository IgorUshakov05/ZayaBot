import { body } from "express-validator";

export const requestValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Имя должно быть строкой")
    .isLength({ max: 20 })
    .withMessage("Имя не должно превышать 20 символов"),

  body("phone")
    .optional()
    .isString()
    .withMessage("Телефон должен быть строкой")
    .isLength({ max: 15 })
    .withMessage("Телефон не должен превышать 15 символов")
    .matches(/^[0-9+\-() ]*$/)
    .withMessage("Телефон содержит недопустимые символы"),

  body("post")
    .optional()
    .isEmail()
    .withMessage("Почта должна быть корректным email"),

  body("company")
    .optional()
    .isString()
    .withMessage("Компания должна быть строкой")
    .isLength({ max: 30 })
    .withMessage("Название компании не должно превышать 30 символов"),

  body("address")
    .optional()
    .isString()
    .withMessage("Адрес должен быть строкой")
    .isLength({ max: 50 })
    .withMessage("Адрес не должен превышать 50 символов"),

  body("message")
    .optional()
    .isString()
    .withMessage("Сообщение должно быть строкой")
    .isLength({ max: 1000 })
    .withMessage("Сообщение не должно превышать 200 символов"),
];
