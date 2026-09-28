import Joi from "joi";

// Admin membuat kandang: kode dibuat otomatis oleh sistem (KDG-001, dst).
const createSchema = Joi.object({
  nama: Joi.string().trim().max(100).required().messages({
    "string.empty": "Nama kandang wajib diisi.",
    "any.required": "Nama kandang wajib diisi.",
  }),

  jenis: Joi.string().valid("Umbaran", "Battery").required().messages({
    "any.only": "Jenis kandang harus Umbaran atau Battery.",
    "any.required": "Jenis kandang wajib dipilih.",
  }),
});

// Admin menugaskan/mengganti operator suatu kandang (replace-all).
const setOperatorsSchema = Joi.object({
  user_ids: Joi.array().items(Joi.number().integer().positive()).required().messages({
    "any.required": "Daftar operator wajib diisi.",
    "array.base": "Daftar operator tidak valid.",
  }),
});

export default {
  createSchema,
  setOperatorsSchema,
};
