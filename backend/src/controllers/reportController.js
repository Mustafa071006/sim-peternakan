import ReportService from "../services/reportService.js";
import ResponseHelper from "../helpers/response.js";

class ReportController {
  // ==========================
  // GET REPORT PER PERIODE
  // ==========================
  static async getReport(req, res, next) {
    try {
      const data = await ReportService.getReport(req.params.periodeId);

      return ResponseHelper.success(
        res,
        data,
        "Laporan periode berhasil diambil.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default ReportController;
