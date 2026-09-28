import express from "express";
import AuthController from "../controllers/authController.js";
import validate from "../middleware/validate.js";
import AuthValidator from "../validators/authValidator.js";

const router = express.Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Login menggunakan email dan password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@simpeternakan.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login berhasil.
 *       401:
 *         description: Email atau password salah.
 *       422:
 *         description: Validasi gagal.
 */
router.post(
  "/login",
  validate(AuthValidator.loginSchema),
  AuthController.login,
);

export default router;
