import KandangModel from "../models/kandangModel.js";
import UserModel from "../models/userModel.js";
import { STATUS } from "../constants/status.js";
import { ROLE } from "../constants/role.js";

class KandangService {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(query) {
    return await KandangModel.getAll(query);
  }

  // ==========================
  // CREATE (admin)
  // ==========================
  static async create({ nama, jenis }) {
    const kode = await KandangModel.generateKode();
    const id = await KandangModel.create({ kode, nama, jenis });
    return { id, kode };
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id) {
    const kandang = await KandangModel.getById(id);

    if (!kandang) {
      const err = new Error("Kandang tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return kandang;
  }

  // ==========================
  // UPDATE STATUS (admin only)
  // ==========================
  static async updateStatus(id, status) {
    const kandang = await KandangModel.getById(id);

    if (!kandang) {
      const err = new Error("Kandang tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    if (![STATUS.AKTIF, STATUS.NONAKTIF].includes(status)) {
      const err = new Error("Status harus Aktif atau Nonaktif.");
      err.statusCode = 422;
      throw err;
    }

    await KandangModel.updateStatus(id, status);
  }

  // ==========================
  // GET OPERATORS (admin)
  // ==========================
  static async getOperators(id) {
    const kandang = await KandangModel.getById(id);
    if (!kandang) {
      const err = new Error("Kandang tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }
    return await KandangModel.getOperators(id);
  }

  // ==========================
  // SET OPERATORS (admin) — replace-all penugasan operator kandang ini
  // ==========================
  static async setOperators(id, userIds) {
    const kandang = await KandangModel.getById(id);
    if (!kandang) {
      const err = new Error("Kandang tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const uniqueIds = [...new Set(userIds.map(Number))];

    for (const userId of uniqueIds) {
      const user = await UserModel.findById(userId);
      if (!user) {
        const err = new Error(`User #${userId} tidak ditemukan.`);
        err.statusCode = 404;
        throw err;
      }
      if (user.role !== ROLE.OPERATOR) {
        const err = new Error(`${user.nama} bukan operator.`);
        err.statusCode = 422;
        throw err;
      }
    }

    await KandangModel.setOperators(id, uniqueIds);
  }
}

export default KandangService;
