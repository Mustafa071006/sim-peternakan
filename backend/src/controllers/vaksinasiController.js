import VaksinasiService from "../services/vaksinasiService.js";
import ResponseHelper from "../helpers/response.js";

class VaksinasiController {
  static async getAll(req, res, next) {
    try {
      const data = await VaksinasiService.getAll();
      return ResponseHelper.success(res, data, "Data vaksinasi berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await VaksinasiService.getById(req.params.id);
      return ResponseHelper.success(res, data, "Detail vaksinasi berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await VaksinasiService.create(req.body, req.user);
      return ResponseHelper.created(res, result, "Data vaksinasi berhasil ditambahkan.");
    } catch (error) {
      next(error);
    }
  }
}

export default VaksinasiController;
