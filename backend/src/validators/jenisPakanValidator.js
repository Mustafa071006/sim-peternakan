import Joi from "joi";

const createSchema = Joi.object({
  nama: Joi.string().max(100).required().messages({
    "string.empty": "Nama jenis pakan wajib diisi.",
    "any.required": "Nama jenis pakan wajib diisi.",
  }),

  deskripsi: Joi.string().allow("").optional(),

  status: Joi.string().valid("Aktif", "Nonaktif").required().messages({
    "any.only": "Status harus Aktif atau Nonaktif.",
  }),
});

export default {
  createSchema,
};
