import DashboardService from "../services/dashboardService.js";
import ResponseHelper from "../helpers/response.js";

class DashboardController {
  // ==========================
  // GET DASHBOARD
  // ==========================

  static async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboard(req.user);

      return ResponseHelper.success(
        res,
        "Data dashboard berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET ADMIN DASHBOARD
  // ==========================
  static async getAdminDashboard(req, res, next) {
    try {
      const data = await DashboardService.getAdminDashboard(req.user);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  // ==========================
  // GET PRODUKSI MINGGUAN
  // ==========================

  static async getProduksiMingguan(req, res, next) {
    try {
      const data = await DashboardService.getProduksiMingguan(req.user);

      return ResponseHelper.success(
        res,
        "Data produksi mingguan berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET PERFORMA
  // ==========================

  static async getPerforma(req, res, next) {
    try {
      const data = await DashboardService.getPerforma(req.user);

      return ResponseHelper.success(
        res,
        "Data performa berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET PAKAN MINGGUAN
  // ==========================

  static async getPakanMingguan(req, res, next) {
    try {
      const data = await DashboardService.getPakanMingguan(req.user);

      return ResponseHelper.success(
        res,
        "Data pakan mingguan berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET MORTALITAS MINGGUAN
  // ==========================

  static async getMortalitasMingguan(req, res, next) {
    try {
      const data = await DashboardService.getMortalitasMingguan(req.user);

      return ResponseHelper.success(
        res,
        "Data mortalitas mingguan berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET UMUR AYAM
  // ==========================

  static async getUmurAyam(req, res, next) {
    try {
      const data = await DashboardService.getUmurAyam(req.user);

      return ResponseHelper.success(
        res,
        "Data umur ayam berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }

  // ==========================
  // GET VAKSIN TERAKHIR
  // ==========================

  static async getVaksinTerakhir(req, res, next) {
    try {
      const data = await DashboardService.getVaksinTerakhir(req.user);

      return ResponseHelper.success(
        res,
        "Data vaksin terakhir berhasil diambil.",
        data,
      );
    } catch (error) {
      next(error);
    }
  }
}

export default DashboardController;
