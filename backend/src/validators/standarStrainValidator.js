import Joi from "joi";

const createSchema = Joi.object({
  strain_id: Joi.number().integer().required().messages({
    "number.base": "Strain wajib dipilih.",
    "any.required": "Strain wajib dipilih.",
  }),

  umur_minggu: Joi.number().integer().min(0).required().messages({
    "number.base": "Umur minggu harus berupa angka.",
    "number.min": "Umur minggu minimal 0.",
    "any.required": "Umur minggu wajib diisi.",
  }),

  feed_gram: Joi.number().min(0).required().messages({
    "number.base": "Feed gram harus berupa angka.",
    "number.min": "Feed gram minimal 0.",
    "any.required": "Feed gram wajib diisi.",
  }),

  produksi_persen: Joi.number().min(0).max(100).required().messages({
    "number.base": "Produksi persen harus berupa angka.",
    "number.min": "Produksi persen minimal 0.",
    "number.max": "Produksi persen maksimal 100.",
    "any.required": "Produksi persen wajib diisi.",
  }),

  berat_telur: Joi.number().min(0).required().messages({
    "number.base": "Berat telur harus berupa angka.",
    "number.min": "Berat telur minimal 0.",
    "any.required": "Berat telur wajib diisi.",
  }),
});

export default {
  createSchema,
};