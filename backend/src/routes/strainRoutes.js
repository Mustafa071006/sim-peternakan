import express from "express";
import StrainController from "../controllers/strainController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import StrainValidator from "../validators/strainValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

/**
 * @swagger
 * /api/strain:
 *   get:
 *     tags:
 *       - Strain
 *     summary: Ambil semua data strain ayam
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data strain
 */
router.get("/", StrainController.getAll);

/**
 * @swagger
 * /api/strain/{id}:
 *   get:
 *     tags:
 *       - Strain
 *     summary: Ambil detail strain berdasarkan ID
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
 *         description: Detail strain berhasil diambil
 *       404:
 *         description: Strain tidak ditemukan
 */
router.get("/:id", StrainController.getById);

/**
 * @swagger
 * /api/strain:
 *   post:
 *     tags:
 *       - Strain
 *     summary: Tambah data strain
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
 *               - deskripsi
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Lohmann Brown
 *               deskripsi:
 *                 type: string
 *                 example: Ayam petelur dengan produktivitas tinggi.
 *     responses:
 *       201:
 *         description: Strain berhasil ditambahkan
 */
router.post(
  "/",
  roleMiddleware(ROLE.ADMIN),
  validate(StrainValidator.createSchema),
  StrainController.create,
);

/**
 * @swagger
 * /api/strain/{id}:
 *   put:
 *     tags:
 *       - Strain
 *     summary: Update data strain
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
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Lohmann Brown Classic
 *               deskripsi:
 *                 type: string
 *                 example: Update deskripsi strain.
 *     responses:
 *       200:
 *         description: Strain berhasil diperbarui
 *       404:
 *         description: Strain tidak ditemukan
 */
router.put(
  "/:id",
  roleMiddleware(ROLE.ADMIN),
  validate(StrainValidator.createSchema),
  StrainController.update,
);

/**
 * @swagger
 * /api/strain/{id}:
 *   delete:
 *     tags:
 *       - Strain
 *     summary: Hapus data strain
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
 *         description: Strain berhasil dihapus
 *       404:
 *         description: Strain tidak ditemukan
 */
router.delete("/:id", roleMiddleware(ROLE.ADMIN), StrainController.delete);

export default router;
