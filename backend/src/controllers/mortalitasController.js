import MortalitasService from "../services/mortalitasService.js";
import ResponseHelper from "../helpers/response.js";

class MortalitasController {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(req, res, next) {
    try {
      const data = await MortalitasService.getAll();

      return ResponseHelper.success(
        res,
        data,
        "Data mortalitas berhasil diambil.",
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(req, res, next) {
    try {
      const data = await MortalitasService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        data,
        "Detail mortalitas berhasil diambil.",
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(req, res, next) {
    try {
      const result = await MortalitasService.create(req.body, req.user);

      return ResponseHelper.created(
        res,
        result,
        "Data mortalitas berhasil ditambahkan.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default MortalitasController;
