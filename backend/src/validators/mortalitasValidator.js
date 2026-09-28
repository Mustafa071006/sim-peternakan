import Joi from "joi";

class MortalitasValidator {
  static createSchema = Joi.object({
    periode_id: Joi.number().integer().positive().required().messages({
      "any.required": "Periode wajib dipilih.",
      "number.base": "Periode tidak valid.",
      "number.integer": "Periode tidak valid.",
      "number.positive": "Periode tidak valid.",
    }),

    tanggal: Joi.date().required().messages({
      "any.required": "Tanggal wajib diisi.",
      "date.base": "Format tanggal tidak valid.",
    }),

    jumlah: Joi.number().integer().positive().required().messages({
      "any.required": "Jumlah kematian wajib diisi.",
      "number.base": "Jumlah kematian harus berupa angka.",
      "number.integer": "Jumlah kematian harus berupa bilangan bulat.",
      "number.positive": "Jumlah kematian minimal 1 ekor.",
    }),

    penyebab: Joi.string().trim().max(255).allow("", null).messages({
      "string.max": "Penyebab maksimal 255 karakter.",
    }),

    foto: Joi.string().trim().allow("", null),
  });
}

export default MortalitasValidator;
