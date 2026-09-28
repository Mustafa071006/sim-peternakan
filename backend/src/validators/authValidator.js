import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Format email tidak valid.",
      "any.required": "Email wajib diisi.",
    }),

  password: Joi.string()
    .required()
    .messages({
      "any.required": "Password wajib diisi.",
    }),
});

export default {
  loginSchema,
};