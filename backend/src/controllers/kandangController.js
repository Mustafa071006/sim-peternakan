import KandangService from "../services/kandangService.js";
import ResponseHelper from "../helpers/response.js";
import QueryHelper from "../helpers/queryHelper.js";
import PaginationHelper from "../helpers/paginationHelper.js";

class KandangController {
  // ==========================
  // GET /api/kandang
  // ==========================
  static async getAll(req, res, next) {
    try {
      const query = QueryHelper.parse(req.query);
      const result = await KandangService.getAll(query);

      const pagination = PaginationHelper.createMeta(
        query.page,
        query.limit,
        result.total,
      );

      return ResponseHelper.success(res, {
        data: result.data,
        pagination,
      }, "Data kandang berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET /api/kandang/:id
  // ==========================
  static async getById(req, res, next) {
    try {
      const data = await KandangService.getById(req.params.id);
      return ResponseHelper.success(res, data, "Detail kandang berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // POST /api/kandang (admin)
  // ==========================
  static async create(req, res, next) {
    try {
      const data = await KandangService.create(req.body);
      return ResponseHelper.created(res, data, "Kandang berhasil ditambahkan.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET /api/kandang/:id/operators (admin)
  // ==========================
  static async getOperators(req, res, next) {
    try {
      const data = await KandangService.getOperators(req.params.id);
      return ResponseHelper.success(res, data, "Operator kandang berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // PUT /api/kandang/:id/operators (admin)
  // ==========================
  static async setOperators(req, res, next) {
    try {
      await KandangService.setOperators(req.params.id, req.body.user_ids);
      return ResponseHelper.success(res, null, "Operator kandang berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // PATCH /api/kandang/:id/status  (admin)
  // ==========================
  static async updateStatus(req, res, next) {
    try {
      await KandangService.updateStatus(req.params.id, req.body.status);
      return ResponseHelper.success(res, null, "Status kandang berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }
}

export default KandangController;
