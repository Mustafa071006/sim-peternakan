import express from "express";
import MortalitasController from "../controllers/mortalitasController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import MortalitasValidator from "../validators/mortalitasValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

// ==========================
// GET
// ==========================
router.get("/", MortalitasController.getAll);
router.get("/:id", MortalitasController.getById);

// ==========================
// POST
// ==========================
// Hanya Operator yang boleh input data mortalitas
router.post(
  "/",
  roleMiddleware(ROLE.OPERATOR),
  validate(MortalitasValidator.createSchema),
  MortalitasController.create,
);

export default router;