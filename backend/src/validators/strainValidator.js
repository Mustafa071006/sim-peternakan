import Joi from "joi";

const createSchema = Joi.object({
  nama: Joi.string().max(100).required().messages({
    "string.empty": "Nama strain wajib diisi.",
    "string.max": "Nama strain maksimal 100 karakter.",
    "any.required": "Nama strain wajib diisi.",
  }),

  deskripsi: Joi.string().allow("").max(255).messages({
    "string.max": "Deskripsi maksimal 255 karakter.",
  }),
});

export default {
  createSchema,
};
