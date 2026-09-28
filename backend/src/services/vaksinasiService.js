import VaksinasiModel from "../models/vaksinasiModel.js";
import PeriodeModel from "../models/periodeModel.js";
import { STATUS } from "../constants/status.js";

class VaksinasiService {
  static async getAll() {
    return await VaksinasiModel.getAll();
  }

  static async getById(id) {
    const data = await VaksinasiModel.getById(id);
    if (!data) {
      const err = new Error("Data vaksinasi tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }
    return data;
  }

  /**
   * @param {{ periode_id:number, tanggal:string, nama_vaksin:string }} data
   */
  static async create(data, user) {
    const periode = await PeriodeModel.getById(data.periode_id, user);
    if (!periode) {
      const err = new Error("Periode tidak ditemukan pada kandang operator.");
      err.statusCode = 404;
      throw err;
    }
    if (periode.status !== STATUS.AKTIF) {
      const err = new Error("Periode sudah selesai.");
      err.statusCode = 409;
      throw err;
    }

    const tanggalInput = new Date(data.tanggal);
    tanggalInput.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tanggalInput > today) {
      const err = new Error("Tanggal vaksinasi tidak boleh melebihi hari ini.");
      err.statusCode = 422;
      throw err;
    }

    const nama = String(data.nama_vaksin || "").trim();
    if (!nama) {
      const err = new Error("Nama vaksin wajib diisi.");
      err.statusCode = 422;
      throw err;
    }

    const tanggalSql = tanggalInput.toISOString().slice(0, 10);

    const duplicate = await VaksinasiModel.findDuplicate(
      periode.id,
      tanggalSql,
      nama,
    );
    if (duplicate) {
      const err = new Error(
        "Vaksinasi dengan nama dan tanggal tersebut sudah tercatat.",
      );
      err.statusCode = 409;
      throw err;
    }

    const id = await VaksinasiModel.create({
      periode_id: periode.id,
      tanggal: tanggalSql,
      nama_vaksin: nama,
    });

    return { id };
  }
}

export default VaksinasiService;
