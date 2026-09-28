import StandarStrainService from "../services/standarStrainService.js";
import ResponseHelper from "../helpers/response.js";

class StandarStrainController {
  static async getAll(req, res, next) {
    try {
      const data = await StandarStrainService.getAll();

      return ResponseHelper.success(
        res,
        data,
        "Data standar strain berhasil diambil.",
      );
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await StandarStrainService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        data,
        "Detail standar strain berhasil diambil.",
      );
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const id = await StandarStrainService.create(req.body);

      return ResponseHelper.created(
        res,
        { id },
        "Standar strain berhasil ditambahkan.",
      );
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      await StandarStrainService.update(req.params.id, req.body);

      return ResponseHelper.success(
        res,
        null,
        "Standar strain berhasil diperbarui.",
      );
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await StandarStrainService.delete(req.params.id);

      return ResponseHelper.success(
        res,
        null,
        "Standar strain berhasil dihapus.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default StandarStrainController;
