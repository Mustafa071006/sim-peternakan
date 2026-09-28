import AuthService from "../services/authService.js";
import ResponseHelper from "../helpers/response.js";

class AuthController {
  // ==========================
  // LOGIN
  // ==========================
  static async login(req, res, next) {
    try {
      const result = await AuthService.login(
        req.body.email,
        req.body.password,
      );

      return ResponseHelper.success(
        res,
        result,
        "Login berhasil.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;