import Joi from "joi";
import { ROLE } from "../constants/role.js";
import { STATUS } from "../constants/status.js";

// ==============================
// CREATE USER (admin) — operator tidak memilih kandang di sini
// ==============================
const createSchema = Joi.object({
  nama: Joi.string().max(100).required().messages({
    "string.empty": "Nama wajib diisi.",
    "string.max": "Nama maksimal 100 karakter.",
    "any.required": "Nama wajib diisi.",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid.",
    "string.empty": "Email wajib diisi.",
    "any.required": "Email wajib diisi.",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter.",
    "string.empty": "Password wajib diisi.",
    "any.required": "Password wajib diisi.",
  }),

  role: Joi.string().valid(ROLE.ADMIN, ROLE.OPERATOR).required().messages({
    "any.only": "Role tidak valid.",
    "any.required": "Role wajib dipilih.",
  }),
});

// ==============================
// UPDATE USER
// ==============================
const updateSchema = Joi.object({
  nama: Joi.string().max(100).required().messages({
    "string.empty": "Nama wajib diisi.",
    "string.max": "Nama maksimal 100 karakter.",
    "any.required": "Nama wajib diisi.",
  }),

  email: Joi.string().email().required().messages({
    "string.email": "Format email tidak valid.",
    "string.empty": "Email wajib diisi.",
    "any.required": "Email wajib diisi.",
  }),

  role: Joi.string().valid(ROLE.ADMIN, ROLE.OPERATOR).required().messages({
    "any.only": "Role tidak valid.",
    "any.required": "Role wajib dipilih.",
  }),
});

// ==============================
// UPDATE STATUS
// ==============================
const statusSchema = Joi.object({
  status: Joi.string()
    .valid(STATUS.AKTIF, STATUS.NONAKTIF)
    .required()
    .messages({
      "any.only": "Status tidak valid.",
      "any.required": "Status wajib dipilih.",
    }),
});

// ==============================
// RESET PASSWORD
// ==============================
const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.min": "Password minimal 6 karakter.",
    "string.empty": "Password wajib diisi.",
    "any.required": "Password wajib diisi.",
  }),
});

export default {
  createSchema,
  updateSchema,
  statusSchema,
  resetPasswordSchema,
};
