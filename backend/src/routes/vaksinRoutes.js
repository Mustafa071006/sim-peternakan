import express from "express";

import VaksinController from "../controllers/vaksinController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";

import VaksinValidator from "../validators/vaksinValidator.js";

import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint harus login
router.use(authMiddleware);

// ==========================
// GET
// ==========================

router.get("/", VaksinController.getAll);

router.get("/:id", VaksinController.getById);

// ==========================
// POST
// ==========================

// Hanya Admin
router.post(
  "/",
  roleMiddleware(ROLE.ADMIN),
  validate(VaksinValidator.createSchema),
  VaksinController.create,
);

// ==========================
// PUT
// ==========================

// Hanya Admin
router.put(
  "/:id",
  roleMiddleware(ROLE.ADMIN),
  validate(VaksinValidator.createSchema),
  VaksinController.update,
);

// ==========================
// DELETE
// ==========================

// Hanya Admin
router.delete("/:id", roleMiddleware(ROLE.ADMIN), VaksinController.delete);

export default router;
