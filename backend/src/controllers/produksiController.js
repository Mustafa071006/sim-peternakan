import ProduksiService from "../services/produksiService.js";
import ResponseHelper from "../helpers/response.js";

class ProduksiController {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(req, res, next) {
    try {
      const data = await ProduksiService.getAll();

      return ResponseHelper.success(
        res,
        data,
        "Data produksi berhasil diambil.",
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
      const data = await ProduksiService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        data,
        "Detail produksi berhasil diambil.",
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
      const result = await ProduksiService.create(req.body, req.user);

      return ResponseHelper.created(
        res,
        result,
        "Data produksi berhasil ditambahkan.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ProduksiController;
