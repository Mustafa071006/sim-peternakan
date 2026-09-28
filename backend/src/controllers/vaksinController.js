import VaksinService from "../services/vaksinService.js";
import ResponseHelper from "../helpers/response.js";

class VaksinController {
  // ==========================
  // GET ALL
  // ==========================

  static async getAll(req, res, next) {
    try {
      const data = await VaksinService.getAll();

      return ResponseHelper.success(res, data, "Data vaksin berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET BY ID
  // ==========================

  static async getById(req, res, next) {
    try {
      const data = await VaksinService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        data,
        "Detail vaksin berhasil diambil.",
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
      const result = await VaksinService.create(req.body);

      return ResponseHelper.created(
        res,
        result,
        "Vaksin berhasil ditambahkan.",
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
      await VaksinService.update(req.params.id, req.body);

      return ResponseHelper.success(res, null, "Vaksin berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // DELETE
  // ==========================

  static async delete(req, res, next) {
    try {
      await VaksinService.delete(req.params.id);

      return ResponseHelper.success(res, null, "Vaksin berhasil dihapus.");
    } catch (error) {
      next(error);
    }
  }
}

export default VaksinController;
