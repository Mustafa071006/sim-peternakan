import UserService from "../services/userService.js";
import ResponseHelper from "../helpers/response.js";

class UserController {
  static async getAll(req, res, next) {
    try {
      const data = await UserService.getAll();
      return ResponseHelper.success(res, data, "Data user berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const data = await UserService.getById(req.params.id);
      return ResponseHelper.success(res, data, "Detail user berhasil diambil.");
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const id = await UserService.create(req.body);
      return ResponseHelper.created(res, { id }, "User berhasil ditambahkan.");
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      await UserService.update(req.params.id, req.body);
      return ResponseHelper.success(res, null, "User berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await UserService.delete(req.params.id);
      return ResponseHelper.success(res, null, "User berhasil dihapus.");
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      await UserService.updateStatus(req.params.id, req.body.status);
      return ResponseHelper.success(res, null, "Status user berhasil diperbarui.");
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      await UserService.resetPassword(req.params.id, req.body.password);
      return ResponseHelper.success(res, null, "Password berhasil direset.");
    } catch (error) {
      next(error);
    }
  }

  static async search(req, res, next) {
    try {
      const data = await UserService.search(req.query.keyword || "");
      return ResponseHelper.success(res, data, "Pencarian user berhasil.");
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;
