import express from "express";

import KandangController from "../controllers/kandangController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import KandangValidator from "../validators/kandangValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

// ==============================
// GET (semua role) — daftar & detail kandang
// ==============================
router.get("/", KandangController.getAll);
router.get("/:id", KandangController.getById);
router.get(
  "/:id/operators",
  roleMiddleware(ROLE.ADMIN),
  KandangController.getOperators,
);

// ==============================
// POST (Admin) — buat kandang baru
// ==============================
router.post(
  "/",
  roleMiddleware(ROLE.ADMIN),
  validate(KandangValidator.createSchema),
  KandangController.create,
);

// ==============================
// PUT operators (Admin) — tugaskan/pindahkan operator (replace-all)
// ==============================
router.put(
  "/:id/operators",
  roleMiddleware(ROLE.ADMIN),
  validate(KandangValidator.setOperatorsSchema),
  KandangController.setOperators,
);

// ==============================
// PATCH status (Admin) — aktif / nonaktif
// ==============================
router.patch(
  "/:id/status",
  roleMiddleware(ROLE.ADMIN),
  KandangController.updateStatus,
);

export default router;
