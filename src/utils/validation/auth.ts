import Joi from "joi";
import { validateSchema, validationCustomMessage } from "./validation";

export const registerValidation = (params: any) => {
  const schema = Joi.object({
    firstname: Joi.string()
      .trim()
      .required()
      .min(3)
      .max(20)
      .messages(validationCustomMessage("first name")),
    lastname: Joi.string()
      .trim()
      .required()
      .min(3)
      .max(20)
      .messages(validationCustomMessage("last name")),
    email: Joi.string()
      .trim()
      .required()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .messages(validationCustomMessage("email")),
    password: Joi.string()
      .min(6)
      .required()
      .messages(validationCustomMessage("password")),
  }).unknown(true);

  return validateSchema(schema, params);
};
