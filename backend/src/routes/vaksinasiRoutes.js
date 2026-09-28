import express from "express";
import VaksinasiController from "../controllers/vaksinasiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import VaksinasiValidator from "../validators/vaksinasiValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint harus login
router.use(authMiddleware);

// ==========================
// GET
// ==========================
router.get("/", VaksinasiController.getAll);

router.get("/:id", VaksinasiController.getById);

// ==========================
// POST
// ==========================
router.post(
  "/",
  roleMiddleware(ROLE.OPERATOR),
  validate(VaksinasiValidator.createSchema),
  VaksinasiController.create,
);

export default router;
