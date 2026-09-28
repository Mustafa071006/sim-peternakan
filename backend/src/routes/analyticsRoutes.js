import express from "express";

import AnalyticsController from "../controllers/analyticsController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

/**
 * @swagger
 * /api/analytics/{periodeId}:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Analisis performa periode
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: periodeId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Data analytics berhasil diambil.
 */

router.get(
  "/:periodeId",
  roleMiddleware(ROLE.ADMIN),
  AnalyticsController.getAnalytics,
);

export default router;
