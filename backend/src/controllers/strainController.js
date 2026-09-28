import StrainService from "../services/strainService.js";
import ResponseHelper from "../helpers/response.js";

class StrainController {
  // ==========================
  // GET ALL
  // ==========================

  static async getAll(req, res, next) {
    try {
      const data = await StrainService.getAll();

      return ResponseHelper.success(res, data, "Data strain berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET BY ID
  // ==========================

  static async getById(req, res, next) {
    try {
      const data = await StrainService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        data,
        "Detail strain berhasil diambil.",
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
      const result = await StrainService.create(req.body);

      return ResponseHelper.created(
        res,
        result,
        "Strain berhasil ditambahkan.",
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // UPDATE
  // ==========================

  static async update(req, res, next) {
    try {
      await StrainService.update(req.params.id, req.body);

      return ResponseHelper.success(res, null, "Strain berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // DELETE
  // ==========================

  static async delete(req, res, next) {
    try {
      await StrainService.delete(req.params.id);

      return ResponseHelper.success(res, null, "Strain berhasil dihapus.");
    } catch (error) {
      next(error);
    }
  }
}

export default StrainController;
