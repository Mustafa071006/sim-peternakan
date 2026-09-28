import express from "express";
import ProduksiController from "../controllers/produksiController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import ProduksiValidator from "../validators/produksiValidator.js";
import { ROLE } from "../constants/role.js";

const router = express.Router();

// ==========================
// AUTH
// ==========================

router.use(authMiddleware);

// ==========================
// GET
// ==========================

router.get("/", ProduksiController.getAll);
router.get("/:id", ProduksiController.getById);

// ==========================
// POST
// ==========================

router.post(
  "/",
  roleMiddleware(ROLE.OPERATOR),
  validate(ProduksiValidator.createSchema),
  ProduksiController.create,
);

export default router;