import JenisPakanService from "../services/jenisPakanService.js";
import ResponseHelper from "../helpers/response.js";

class JenisPakanController {
  static async getAll(req, res, next) {
    try {
      const data = await JenisPakanService.getAll();

      return ResponseHelper.success(
        res,
        "Data jenis pakan berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await JenisPakanService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        "Detail jenis pakan berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const result = await JenisPakanService.create(req.body);

      return ResponseHelper.success(
        res,
        "Jenis pakan berhasil ditambahkan.",
        result,
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      await JenisPakanService.update(req.params.id, req.body);

      return ResponseHelper.success(res, "Jenis pakan berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await JenisPakanService.delete(req.params.id);

      return ResponseHelper.success(res, "Jenis pakan berhasil dihapus.");
    } catch (error) {
      next(error);
    }
  }
}

export default JenisPakanController;
