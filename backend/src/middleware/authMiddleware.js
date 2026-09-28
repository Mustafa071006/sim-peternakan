import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { STATUS } from "../constants/status.js";
import { ROLE } from "../constants/role.js";
import env from "../config/env.js";

const authMiddleware = async (req, res, next) => {
  try {
    // ==============================
    // AUTHORIZATION HEADER
    // ==============================
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      const err = new Error("Token tidak ditemukan.");
      err.statusCode = 401;
      return next(err);
    }

    // ==============================
    // FORMAT BEARER TOKEN
    // ==============================
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      const err = new Error("Format token tidak valid.");
      err.statusCode = 401;
      return next(err);
    }

    // ==============================
    // VERIFY TOKEN
    // ==============================
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // ==============================
    // GET USER
    // ==============================
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 401;
      return next(err);
    }

    // ==============================
    // USER STATUS
    // ==============================
    if (user.status !== STATUS.AKTIF) {
      const err = new Error("User tidak aktif.");
      err.statusCode = 401;
      return next(err);
    }

    // ==============================
    // KANDANG YANG DITUGASKAN (many-to-many, selalu terbaru per request)
    // ==============================
    if (user.role === ROLE.OPERATOR) {
      user.kandangIds = await UserModel.getKandangIds(user.id);
    }

    // ==============================
    // SAVE USER
    // ==============================
    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
