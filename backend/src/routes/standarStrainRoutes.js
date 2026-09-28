import express from "express";

import StandarStrainController from "../controllers/standarStrainController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";

import StandarStrainValidator from "../validators/standarStrainValidator.js";

import { ROLE } from "../constants/role.js";

const router = express.Router();

// Semua endpoint wajib login
router.use(authMiddleware);

// ==============================
// GET
// ==============================

router.get("/", StandarStrainController.getAll);

router.get("/:id", StandarStrainController.getById);

// ==============================
// POST
// ==============================

router.post(
  "/",
  roleMiddleware(ROLE.ADMIN),
  validate(StandarStrainValidator.createSchema),
  StandarStrainController.create,
);

// ==============================
// PUT
// ==============================

router.put(
  "/:id",
  roleMiddleware(ROLE.ADMIN),
  validate(StandarStrainValidator.createSchema),
  StandarStrainController.update,
);

// ==============================
// DELETE
// ==============================

router.delete(
  "/:id",
  roleMiddleware(ROLE.ADMIN),
  StandarStrainController.delete,
);

export default router;
