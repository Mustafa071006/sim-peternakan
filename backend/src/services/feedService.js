import FeedModel from "../models/feedModel.js";
import PeriodeModel from "../models/periodeModel.js";
import { STATUS } from "../constants/status.js";
import { MAX_GRAM_PER_EKOR } from "../constants/feed.js";

class FeedService {
  static async getAll() {
    return await FeedModel.getAll();
  }

  static async getById(id) {
    const feed = await FeedModel.getById(id);
    if (!feed) {
      const err = new Error("Data pakan tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }
    return feed;
  }

  /**
   * @param {{ periode_id:number, pakan_id:number, tanggal:string, total_kg:number }} data
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
    const tanggalMasuk = new Date(periode.tanggal_masuk);
    tanggalMasuk.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tanggalInput < tanggalMasuk) {
      const err = new Error(
        "Tanggal pemberian pakan tidak boleh sebelum tanggal masuk periode.",
      );
      err.statusCode = 422;
      throw err;
    }
    if (tanggalInput > today) {
      const err = new Error("Tanggal pemberian pakan tidak boleh melebihi hari ini.");
      err.statusCode = 422;
      throw err;
    }

    const pakan = await FeedModel.findJenisPakan(data.pakan_id);
    if (!pakan) {
      const err = new Error("Jenis pakan tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }
    if (pakan.status && pakan.status !== STATUS.AKTIF) {
      const err = new Error("Jenis pakan tidak aktif.");
      err.statusCode = 409;
      throw err;
    }

    const totalKgInput = Number(data.total_kg);
    if (!Number.isFinite(totalKgInput) || totalKgInput <= 0) {
      const err = new Error("Total pakan harus lebih dari 0.");
      err.statusCode = 422;
      throw err;
    }
    if (!periode.populasi_aktif || periode.populasi_aktif <= 0) {
      const err = new Error("Populasi aktif kandang tidak valid.");
      err.statusCode = 422;
      throw err;
    }

    const gram = (totalKgInput * 1000) / periode.populasi_aktif;
    if (gram > MAX_GRAM_PER_EKOR) {
      const err = new Error(
        `Total pakan terlalu besar untuk populasi saat ini (maksimal setara ${MAX_GRAM_PER_EKOR} gram/ekor).`,
      );
      err.statusCode = 422;
      throw err;
    }

    const tanggalSql = `${tanggalInput.getFullYear()}-${String(
      tanggalInput.getMonth() + 1,
    ).padStart(2, "0")}-${String(tanggalInput.getDate()).padStart(2, "0")}`;

    // Boleh lebih dari satu pemberian pakan per periode per hari (mis. pagi
    // & sore), jadi tidak ada lagi pengecekan duplikat di sini.
    const id = await FeedModel.create({
      periode_id: periode.id,
      pakan_id: data.pakan_id,
      tanggal: tanggalSql,
      gram_per_ekor: Number(gram.toFixed(2)),
      total_kg: Number(totalKgInput.toFixed(2)),
      created_by: user.id,
    });

    return { id };
  }
}

export default FeedService;
