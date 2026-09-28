import JenisPakanModel from "../models/jenisPakanModel.js";

class JenisPakanService {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll() {
    return await JenisPakanModel.getAll();
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id) {
    const jenisPakan = await JenisPakanModel.getById(id);

    if (!jenisPakan) {
      const err = new Error("Jenis pakan tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return jenisPakan;
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(data) {
    const duplicate = await JenisPakanModel.findByNama(data.nama);

    if (duplicate) {
      const err = new Error("Nama jenis pakan sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    const id = await JenisPakanModel.create(data);

    return { id };
  }

  // ==========================
  // UPDATE
  // ==========================
  static async update(id, data) {
    const jenisPakan = await JenisPakanModel.getById(id);

    if (!jenisPakan) {
      const err = new Error("Jenis pakan tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const duplicate = await JenisPakanModel.findByNamaExceptId(data.nama, id);

    if (duplicate) {
      const err = new Error("Nama jenis pakan sudah digunakan.");
      err.statusCode = 409;
      throw err;
    }

    await JenisPakanModel.update(id, data);
  }

  // ==========================
  // DELETE
  // ==========================
  static async delete(id) {
    const jenisPakan = await JenisPakanModel.getById(id);

    if (!jenisPakan) {
      const err = new Error("Jenis pakan tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    const used = await JenisPakanModel.isUsed(id);

    if (used) {
      const err = new Error(
        "Jenis pakan tidak dapat dihapus karena sudah digunakan pada data feed.",
      );
      err.statusCode = 409;
      throw err;
    }

    await JenisPakanModel.delete(id);
  }
}

export default JenisPakanService;
