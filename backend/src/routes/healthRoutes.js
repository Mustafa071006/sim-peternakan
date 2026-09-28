import express from "express";

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags:
 *       - System
 *     summary: Health Check
 *     description: Mengecek apakah API berjalan normal.
 *     responses:
 *       200:
 *         description: API berjalan normal.
 */
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API berjalan normal.",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;