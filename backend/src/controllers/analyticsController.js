import AnalyticsService from "../services/analyticsService.js";
import ResponseHelper from "../helpers/response.js";

class AnalyticsController {

  static async getAnalytics(req, res, next) {
    try {
      const data = await AnalyticsService.getAnalytics(req.params.periodeId);

      return ResponseHelper.success(
        res,
        data,
        "Data analytics berhasil diambil."
      );
    } catch (err) {
      next(err);
    }
  }
}

export default AnalyticsController;