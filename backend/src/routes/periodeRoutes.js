import express from "express";
import PeriodeController from "../controllers/periodeController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import PeriodeValidator from "../validators/periodeValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// ==========================
// AUTH
// ==========================

router.use(authMiddleware);

// ==========================
// GET
// ==========================

router.get("/", PeriodeController.getAll);
router.get("/:id", PeriodeController.getById);

// ==========================
// POST
// ==========================

router.post(
  "/",
  roleMiddleware(ROLE.ADMIN),
  validate(PeriodeValidator.createSchema),
  PeriodeController.create,
);

export default router;
