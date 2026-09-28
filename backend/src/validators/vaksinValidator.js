import Joi from "joi";

const createSchema = Joi.object({
  nama: Joi.string().max(100).required().messages({
    "string.empty": "Nama vaksin wajib diisi.",
    "any.required": "Nama vaksin wajib diisi.",
  }),

  deskripsi: Joi.string().allow("").optional(),

  status: Joi.string()
    .valid("Aktif", "Nonaktif")
    .required()
    .messages({
      "any.only": "Status harus Aktif atau Nonaktif.",
      "any.required": "Status wajib diisi.",
    }),
});

export default {
  createSchema,
};