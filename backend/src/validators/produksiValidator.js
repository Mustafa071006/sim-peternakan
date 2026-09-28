import Joi from "joi";

const createSchema = Joi.object({
  periode_id: Joi.number().integer().positive().required().messages({
    "any.required": "Periode wajib dipilih.",
    "number.base": "Periode tidak valid.",
    "number.integer": "Periode tidak valid.",
    "number.positive": "Periode tidak valid.",
  }),

  tanggal: Joi.date().required().messages({
    "any.required": "Tanggal wajib diisi.",
    "date.base": "Tanggal tidak valid.",
  }),

  telur_bagus: Joi.number().integer().min(0).required().messages({
    "any.required": "Jumlah telur bagus wajib diisi.",
    "number.base": "Jumlah telur bagus harus berupa angka.",
    "number.integer": "Jumlah telur bagus harus berupa angka.",
    "number.min": "Jumlah telur bagus tidak boleh negatif.",
  }),

  berat_bagus: Joi.number().min(0).required().messages({
    "any.required": "Berat telur bagus wajib diisi.",
    "number.base": "Berat telur bagus harus berupa angka.",
    "number.min": "Berat telur bagus tidak boleh negatif.",
  }),

  telur_krem: Joi.number().integer().min(0).required().messages({
    "any.required": "Jumlah telur krem wajib diisi.",
    "number.base": "Jumlah telur krem harus berupa angka.",
    "number.integer": "Jumlah telur krem harus berupa angka.",
    "number.min": "Jumlah telur krem tidak boleh negatif.",
  }),

  berat_krem: Joi.number().min(0).required().messages({
    "any.required": "Berat telur krem wajib diisi.",
    "number.base": "Berat telur krem harus berupa angka.",
    "number.min": "Berat telur krem tidak boleh negatif.",
  }),

  telur_retak: Joi.number().integer().min(0).required().messages({
    "any.required": "Jumlah telur retak wajib diisi.",
    "number.base": "Jumlah telur retak harus berupa angka.",
    "number.integer": "Jumlah telur retak harus berupa angka.",
    "number.min": "Jumlah telur retak tidak boleh negatif.",
  }),

  berat_retak: Joi.number().min(0).required().messages({
    "any.required": "Berat telur retak wajib diisi.",
    "number.base": "Berat telur retak harus berupa angka.",
    "number.min": "Berat telur retak tidak boleh negatif.",
  }),
})
  .custom((value, helpers) => {
    const total = value.telur_bagus + value.telur_krem + value.telur_retak;

    if (total === 0) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid": "Minimal harus ada satu butir telur yang diinput.",
  });

export default {
  createSchema,
};
