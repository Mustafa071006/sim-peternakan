import PeriodeService from "../services/periodeService.js";
import ResponseHelper from "../helpers/response.js";

class PeriodeController {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(req, res, next) {
    try {
      const data = await PeriodeService.getAll(req.user);

      return ResponseHelper.success(
        res,
        data,
        "Data periode berhasil diambil.",
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
      const data = await PeriodeService.getById(req.params.id, req.user);

      return ResponseHelper.success(
        res,
        data,
        "Detail periode berhasil diambil.",
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
      const result = await PeriodeService.create(req.body, req.user);

      return ResponseHelper.created(
        res,
        result,
        "Periode berhasil ditambahkan.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default PeriodeController;
