import express from "express";
import JenisPakanController from "../controllers/jenisPakanController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import JenisPakanValidator from "../validators/jenisPakanValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

/**
 * @swagger
 * /api/jenis-pakan:
 *   get:
 *     tags:
 *       - Jenis Pakan
 *     summary: Ambil semua data jenis pakan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data jenis pakan
 */
router.get("/", JenisPakanController.getAll);

/**
 * @swagger
 * /api/jenis-pakan/{id}:
 *   get:
 *     tags:
 *       - Jenis Pakan
 *     summary: Ambil detail jenis pakan berdasarkan ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Detail jenis pakan berhasil diambil
 *       404:
 *         description: Jenis pakan tidak ditemukan
 */
router.get("/:id", JenisPakanController.getById);

/**
 * @swagger
 * /api/jenis-pakan:
 *   post:
 *     tags:
 *       - Jenis Pakan
 *     summary: Tambah data jenis pakan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - status
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Pakan Starter
 *               deskripsi:
 *                 type: string
 *                 example: Pakan ayam umur 0-4 minggu
 *               status:
 *                 type: string
 *                 enum:
 *                   - Aktif
 *                   - Nonaktif
 *                 example: Aktif
 *     responses:
 *       201:
 *         description: Jenis pakan berhasil ditambahkan
 */
router.post(
  "/",
  roleMiddleware(ROLE.ADMIN),
  validate(JenisPakanValidator.createSchema),
  JenisPakanController.create,
);

/**
 * @swagger
 * /api/jenis-pakan/{id}:
 *   put:
 *     tags:
 *       - Jenis Pakan
 *     summary: Update data jenis pakan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - status
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Pakan Layer
 *               deskripsi:
 *                 type: string
 *                 example: Pakan ayam petelur
 *               status:
 *                 type: string
 *                 enum:
 *                   - Aktif
 *                   - Nonaktif
 *                 example: Aktif
 *     responses:
 *       200:
 *         description: Jenis pakan berhasil diperbarui
 *       404:
 *         description: Jenis pakan tidak ditemukan
 */
router.put(
  "/:id",
  roleMiddleware(ROLE.ADMIN),
  validate(JenisPakanValidator.createSchema),
  JenisPakanController.update,
);

/**
 * @swagger
 * /api/jenis-pakan/{id}:
 *   delete:
 *     tags:
 *       - Jenis Pakan
 *     summary: Hapus data jenis pakan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Jenis pakan berhasil dihapus
 *       404:
 *         description: Jenis pakan tidak ditemukan
 *       409:
 *         description: Jenis pakan masih digunakan
 */
router.delete("/:id", roleMiddleware(ROLE.ADMIN), JenisPakanController.delete);

export default router;
