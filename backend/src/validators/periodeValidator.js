import Joi from "joi";

// Admin membuat periode untuk kandang yang sudah ada.
const createSchema = Joi.object({
  kandang_id: Joi.number().integer().positive().required().messages({
    "any.required": "Kandang wajib dipilih.",
    "number.base": "Kandang tidak valid.",
  }),

  strain_id: Joi.number().integer().positive().required().messages({
    "any.required": "Strain wajib dipilih.",
    "number.base": "Strain tidak valid.",
  }),

  jumlah_awal: Joi.number().integer().min(1).required().messages({
    "any.required": "Jumlah ayam wajib diisi.",
    "number.base": "Jumlah ayam harus berupa angka.",
    "number.min": "Jumlah ayam minimal 1 ekor.",
  }),

  umur_awal_vendor: Joi.number().integer().min(0).max(20).required().messages({
    "any.required": "Umur ayam wajib diisi.",
    "number.base": "Umur ayam harus berupa angka.",
    "number.min": "Umur ayam tidak boleh kurang dari 0.",
    "number.max": "Umur ayam maksimal 20 minggu.",
  }),

  tanggal_masuk: Joi.date().required().messages({
    "any.required": "Tanggal masuk wajib diisi.",
    "date.base": "Tanggal masuk tidak valid.",
  }),
});

export default { createSchema };
