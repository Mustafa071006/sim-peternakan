import express from "express";
import DashboardController from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ==========================
// AUTH
// ==========================

// Semua endpoint wajib login
router.use(authMiddleware);

// ==========================
// DASHBOARD
// ==========================

router.get("/", DashboardController.getDashboard);

// ==========================
// PERFORMA
// ==========================

router.get("/performa", DashboardController.getPerforma);

// ==========================
// PRODUKSI
// ==========================

router.get("/produksi-mingguan", DashboardController.getProduksiMingguan);

// ==========================
// PAKAN
// ==========================

router.get("/pakan-mingguan", DashboardController.getPakanMingguan);

// ==========================
// MORTALITAS
// ==========================

router.get("/mortalitas-mingguan", DashboardController.getMortalitasMingguan);

// ==========================
// UMUR AYAM
// ==========================

router.get("/umur-ayam", DashboardController.getUmurAyam);

// ==========================
// VAKSIN TERAKHIR
// ==========================

router.get("/vaksin-terakhir", DashboardController.getVaksinTerakhir);

router.get("/admin", authMiddleware, DashboardController.getAdminDashboard);

export default router;
