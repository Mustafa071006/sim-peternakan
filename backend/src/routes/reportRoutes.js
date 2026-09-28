import express from "express";
import ReportController from "../controllers/reportController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

/**
 * @swagger
 * /api/report/periode/{periodeId}:
 *   get:
 *     tags:
 *       - Report
 *     summary: Ambil laporan periode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: periodeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID periode
 *     responses:
 *       200:
 *         description: Laporan periode berhasil diambil.
 *       404:
 *         description: Periode tidak ditemukan.
 */
router.get(
  "/periode/:periodeId",
  ReportController.getReport,
);

export default router;