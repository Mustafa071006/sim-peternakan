import Joi from "joi";

const createSchema = Joi.object({
  periode_id: Joi.number().integer().positive().required().messages({
    "any.required": "Periode wajib dipilih.",
    "number.base": "Periode tidak valid.",
  }),

  pakan_id: Joi.number().integer().positive().required().messages({
    "any.required": "Jenis pakan wajib dipilih.",
    "number.base": "Jenis pakan tidak valid.",
  }),

  tanggal: Joi.date().required().messages({
    "any.required": "Tanggal wajib diisi.",
    "date.base": "Tanggal tidak valid.",
  }),

  total_kg: Joi.number().positive().required().messages({
    "any.required": "Total pakan (kg) wajib diisi.",
    "number.base": "Total pakan harus berupa angka.",
    "number.positive": "Total pakan harus lebih dari 0.",
  }),
});

export default { createSchema };
