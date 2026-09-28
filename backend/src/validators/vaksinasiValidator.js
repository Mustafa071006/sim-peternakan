import Joi from "joi";

const createSchema = Joi.object({
  periode_id: Joi.number().integer().positive().required().messages({
    "any.required": "Periode wajib dipilih.",
    "number.base": "Periode tidak valid.",
  }),

  tanggal: Joi.date().required().messages({
    "any.required": "Tanggal wajib diisi.",
    "date.base": "Format tanggal tidak valid.",
  }),

  nama_vaksin: Joi.string().trim().max(150).required().messages({
    "string.empty": "Nama vaksin wajib diisi.",
    "any.required": "Nama vaksin wajib diisi.",
    "string.max": "Nama vaksin maksimal 150 karakter.",
  }),
});

export default { createSchema };
