import express from "express";
import UserController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import UserValidator from "../validators/userValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

// Semua endpoint hanya Admin
router.use(roleMiddleware(ROLE.ADMIN));

/**
 * @swagger
 * tags:
 *   - name: User
 *     description: Manajemen data user
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     tags:
 *       - User
 *     summary: Ambil semua data user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data user berhasil diambil.
 */
router.get("/", UserController.getAll);

/**
 * @swagger
 * /api/user/search:
 *   get:
 *     tags:
 *       - User
 *     summary: Cari user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         example: admin
 *     responses:
 *       200:
 *         description: Hasil pencarian user.
 */
router.get("/search", UserController.search);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Ambil detail user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Detail user berhasil diambil.
 *       404:
 *         description: User tidak ditemukan.
 */
router.get("/:id", UserController.getById);

/**
 * @swagger
 * /api/user:
 *   post:
 *     tags:
 *       - User
 *     summary: Tambah user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Mustafa
 *               email:
 *                 type: string
 *                 example: mustafa@gmail.com
 *               password:
 *                 type: string
 *                 example: password123
 *               role:
 *                 type: string
 *                 example: ADMIN
 *     responses:
 *       201:
 *         description: User berhasil ditambahkan.
 */
router.post("/", validate(UserValidator.createSchema), UserController.create);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User berhasil diperbarui.
 */
router.put("/:id", validate(UserValidator.updateSchema), UserController.update);

/**
 * @swagger
 * /api/user/{id}/status:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update status user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Status user berhasil diperbarui.
 */
router.patch(
  "/:id/status",
  validate(UserValidator.statusSchema),
  UserController.updateStatus,
);

/**
 * @swagger
 * /api/user/{id}/reset-password:
 *   patch:
 *     tags:
 *       - User
 *     summary: Reset password user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Password user berhasil direset.
 */
router.patch(
  "/:id/reset-password",
  validate(UserValidator.resetPasswordSchema),
  UserController.resetPassword,
);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Hapus user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: User berhasil dihapus.
 */
router.delete("/:id", UserController.delete);

export default router;