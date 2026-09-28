import FeedService from "../services/feedService.js";
import ResponseHelper from "../helpers/response.js";

class FeedController {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(req, res, next) {
    try {
      const data = await FeedService.getAll();

      return ResponseHelper.success(res, data, "Data pakan berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(req, res, next) {
    try {
      const data = await FeedService.getById(req.params.id);

      return ResponseHelper.success(
        res,
        data,
        "Detail pakan berhasil diambil.",
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
      const result = await FeedService.create(req.body, req.user);

      return ResponseHelper.created(
        res,
        result,
        "Data pakan berhasil ditambahkan.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default FeedController;
