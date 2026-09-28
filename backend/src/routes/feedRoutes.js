import express from "express";
import FeedController from "../controllers/feedController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import FeedValidator from "../validators/feedValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint harus login
router.use(authMiddleware);

/**
 * @swagger
 * /api/feed:
 *   get:
 *     tags:
 *       - Feed
 *     summary: Ambil semua data pakan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil data pakan
 */
router.get("/", FeedController.getAll);

/**
 * @swagger
 * /api/feed/{id}:
 *   get:
 *     tags:
 *       - Feed
 *     summary: Ambil detail data pakan
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
 *         description: Detail data pakan berhasil diambil
 *       404:
 *         description: Data pakan tidak ditemukan
 */
router.get("/:id", FeedController.getById);

/**
 * @swagger
 * /api/feed:
 *   post:
 *     tags:
 *       - Feed
 *     summary: Tambah data pakan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - periode_id
 *               - pakan_id
 *               - tanggal
 *               - gram_per_ekor
 *             properties:
 *               periode_id:
 *                 type: integer
 *                 example: 1
 *               pakan_id:
 *                 type: integer
 *                 example: 1
 *               tanggal:
 *                 type: string
 *                 format: date
 *                 example: "2026-08-08"
 *               gram_per_ekor:
 *                 type: number
 *                 example: 110
 *     responses:
 *       201:
 *         description: Data pakan berhasil ditambahkan
 */
router.post(
  "/",
  roleMiddleware(ROLE.OPERATOR),
  validate(FeedValidator.createSchema),
  FeedController.create,
);

export default router;
