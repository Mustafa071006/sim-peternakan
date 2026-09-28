import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";
import { STATUS } from "../constants/status.js";
import env from "../config/env.js";

class AuthService {
  // ==========================
  // LOGIN
  // ==========================
  static async login(email, password) {
    // ==========================
    // CARI USER
    // ==========================
    const user = await UserModel.findByEmail(email);

    if (!user) {
      const err = new Error("Email atau password salah.");
      err.statusCode = 401;
      throw err;
    }

    // ==========================
    // STATUS USER
    // ==========================
    if (user.status !== STATUS.AKTIF) {
      const err = new Error("Akun tidak aktif.");
      err.statusCode = 403;
      throw err;
    }

    // ==========================
    // VERIFIKASI PASSWORD
    // ==========================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const err = new Error("Email atau password salah.");
      err.statusCode = 401;
      throw err;
    }

    // ==========================
    // GENERATE TOKEN
    // ==========================
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      env.JWT_SECRET,
      {
        expiresIn: env.JWT_EXPIRES,
      },
    );

    // ==========================
    // RESPONSE
    // ==========================
    return {
      token,
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export default AuthService;
