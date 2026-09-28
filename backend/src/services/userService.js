import bcrypt from "bcrypt";
import UserModel from "../models/userModel.js";
import { STATUS } from "../constants/status.js";

class UserService {
  // ==============================
  // GET ALL
  // ==============================
  static async getAll() {
    return await UserModel.getAll();
  }

  // ==============================
  // GET BY ID
  // ==============================
  static async getById(id) {
    const user = await UserModel.findById(id);

    if (!user) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return user;
  }

  // ==============================
  // CREATE
  // Admin membuat akun. Penugasan kandang dilakukan terpisah oleh admin
  // lewat halaman Kandang ("Kelola Operator"), bukan di sini.
  // ==============================
  static async create(data) {
    const existingUser = await UserModel.findByEmail(data.email);

    if (existingUser) {
      const err = new Error("Email sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return await UserModel.create({
      nama: data.nama,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      status: STATUS.AKTIF,
    });
  }

  // ==============================
  // UPDATE (nama / email / role). Status & penugasan kandang tidak diubah di sini.
  // ==============================
  static async update(id, data) {
    const user = await UserModel.findById(id);

    if (!user) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const existingUser = await UserModel.findByEmail(data.email);

    if (existingUser && existingUser.id !== Number(id)) {
      const err = new Error("Email sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    await UserModel.update(id, {
      nama: data.nama,
      email: data.email,
      role: data.role,
    });
  }

  // ==============================
  // DELETE
  // ==============================
  static async delete(id) {
    const user = await UserModel.findById(id);

    if (!user) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    await UserModel.delete(id);
  }

  // ==============================
  // UPDATE STATUS
  // ==============================
  static async updateStatus(id, status) {
    const user = await UserModel.findById(id);

    if (!user) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    await UserModel.updateStatus(id, status);
  }

  // ==============================
  // RESET PASSWORD
  // ==============================
  static async resetPassword(id, password) {
    const user = await UserModel.findById(id);

    if (!user) {
      const err = new Error("User tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.updatePassword(id, hashedPassword);
  }

  // ==============================
  // SEARCH
  // ==============================
  static async search(keyword) {
    return await UserModel.search(keyword);
  }
}

export default UserService;
