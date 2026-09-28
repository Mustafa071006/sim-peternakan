import MortalitasModel from "../models/mortalitasModel.js";
import PeriodeModel from "../models/periodeModel.js";
import { STATUS } from "../constants/status.js";

class MortalitasService {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll() {
    return await MortalitasModel.getAll();
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id) {
    const mortalitas = await MortalitasModel.getById(id);

    if (!mortalitas) {
      const err = new Error("Data mortalitas tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return mortalitas;
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(data, user) {
    // ==========================
    // AMBIL PERIODE
    // ==========================
    const periode = await PeriodeModel.getById(data.periode_id, user);

    if (!periode) {
      const err = new Error("Belum ada periode aktif pada kandang operator.");
      err.statusCode = 404;
      throw err;
    }

    // ==========================
    // PERIODE HARUS AKTIF
    // ==========================
    if (periode.status !== STATUS.AKTIF) {
      const err = new Error("Periode sudah selesai.");
      err.statusCode = 409;
      throw err;
    }

    // ==========================
    // VALIDASI TANGGAL
    // ==========================
    const tanggalInput = new Date(data.tanggal);
    tanggalInput.setHours(0, 0, 0, 0);

    const tanggalMasuk = new Date(periode.tanggal_masuk);
    tanggalMasuk.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (tanggalInput < tanggalMasuk) {
      const err = new Error(
        "Tanggal mortalitas tidak boleh sebelum tanggal masuk periode.",
      );
      err.statusCode = 422;
      throw err;
    }

    if (tanggalInput > today) {
      const err = new Error(
        "Tanggal mortalitas tidak boleh melebihi hari ini.",
      );
      err.statusCode = 422;
      throw err;
    }

    // Selalu simpan sebagai string 'YYYY-MM-DD' lokal, bukan objek Date —
    // mysql2 meng-encode Date secara berbeda untuk INSERT vs perbandingan
    // WHERE pada kolom DATE lewat execute()/prepared statement.
    const tanggalSql = `${tanggalInput.getFullYear()}-${String(
      tanggalInput.getMonth() + 1,
    ).padStart(2, "0")}-${String(tanggalInput.getDate()).padStart(2, "0")}`;

    // ==========================
    // VALIDASI JUMLAH
    // ==========================
    const jumlah = Number(data.jumlah);

    if (jumlah <= 0) {
      const err = new Error("Jumlah kematian harus lebih dari 0.");
      err.statusCode = 422;
      throw err;
    }

    if (jumlah > periode.populasi_aktif) {
      const err = new Error("Jumlah kematian melebihi populasi aktif.");
      err.statusCode = 422;
      throw err;
    }

    // ==========================
    // SIMPAN
    // Boleh lebih dari satu entri per periode per hari — kematian bisa
    // bertambah beberapa kali dalam hari yang sama.
    // ==========================
    const id = await MortalitasModel.create({
      periode_id: periode.id,
      tanggal: tanggalSql,
      jumlah,
      penyebab: data.penyebab || null,
      foto: data.foto || null,
      created_by: user.id,
    });

    // ==========================
    // UPDATE POPULASI AKTIF (atomic)
    // ==========================
    await PeriodeModel.decrementPopulasiAktif(periode.id, jumlah);

    return { id };
  }
}

export default MortalitasService;
