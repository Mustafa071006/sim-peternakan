import VaksinModel from "../models/vaksinModel.js";

class VaksinService {
  // ==========================
  // GET ALL
  // ==========================

  static async getAll() {
    return await VaksinModel.getAll();
  }

  // ==========================
  // GET BY ID
  // ==========================

  static async getById(id) {
    const vaksin = await VaksinModel.findById(id);

    if (!vaksin) {
      const err = new Error("Vaksin tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return vaksin;
  }

  // ==========================
  // CREATE
  // ==========================

  static async create(data) {
    const duplicate = await VaksinModel.findByNama(data.nama);

    if (duplicate) {
      const err = new Error("Nama vaksin sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    const id = await VaksinModel.create(data);

    return { id };
  }

  // ==========================
  // UPDATE
  // ==========================

  static async update(id, data) {
    const vaksin = await VaksinModel.findById(id);

    if (!vaksin) {
      const err = new Error("Vaksin tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const duplicate = await VaksinModel.findByNamaExceptId(data.nama, id);

    if (duplicate) {
      const err = new Error("Nama vaksin sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    await VaksinModel.update(id, data);

    return true;
  }

  // ==========================
  // DELETE
  // ==========================

  static async delete(id) {
    const vaksin = await VaksinModel.findById(id);

    if (!vaksin) {
      const err = new Error("Vaksin tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    await VaksinModel.delete(id);

    return true;
  }
}

export default VaksinService;
