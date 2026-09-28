import StrainModel from "../models/strainModel.js";

class StrainService {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll() {
    return await StrainModel.getAll();
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id) {
    const strain = await StrainModel.getById(id);

    if (!strain) {
      const err = new Error("Strain tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return strain;
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(data) {
    const duplicate = await StrainModel.findByNama(data.nama);

    if (duplicate) {
      const err = new Error("Nama strain sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    const id = await StrainModel.create(data);

    return { id };
  }

  // ==========================
  // UPDATE
  // ==========================
  static async update(id, data) {
    const strain = await StrainModel.findById(id);

    if (!strain) {
      const err = new Error("Strain tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const duplicate = await StrainModel.findByNamaExceptId(data.nama, id);

    if (duplicate) {
      const err = new Error("Nama strain sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    await StrainModel.update(id, data);

    return true;
  }

  // ==========================
  // DELETE
  // ==========================
  static async delete(id) {
    const strain = await StrainModel.findById(id);

    if (!strain) {
      const err = new Error("Strain tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const used = await StrainModel.isUsed(id);

    if (used) {
      const err = new Error(
        "Strain tidak dapat dihapus karena masih digunakan pada periode.",
      );
      err.statusCode = 409;
      throw err;
    }

    await StrainModel.delete(id);

    return true;
  }
}

export default StrainService;
