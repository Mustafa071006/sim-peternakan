import ProduksiModel from "../models/produksiModel.js";
import PeriodeModel from "../models/periodeModel.js";
import { STATUS } from "../constants/status.js";

class ProduksiService {
  // ==========================
  // GET ALL
  // ==========================

  static async getAll() {
    return await ProduksiModel.getAll();
  }

  // ==========================
  // GET BY ID
  // ==========================

  static async getById(id) {
    const produksi = await ProduksiModel.getById(id);

    if (!produksi) {
      const err = new Error("Data produksi tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return produksi;
  }

  // ==========================
  // CREATE
  // ==========================

  static async create(data, user) {
    // ==========================
    // AMBIL PERIODE OPERATOR
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
    const tanggalMasuk = new Date(periode.tanggal_masuk);
    const today = new Date();

    tanggalInput.setHours(0, 0, 0, 0);
    tanggalMasuk.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (tanggalInput < tanggalMasuk) {
      const err = new Error(
        "Tanggal produksi tidak boleh sebelum tanggal masuk periode.",
      );
      err.statusCode = 422;
      throw err;
    }

    if (tanggalInput > today) {
      const err = new Error(
        "Tanggal produksi tidak boleh melebihi tanggal hari ini.",
      );
      err.statusCode = 422;
      throw err;
    }

    // mysql2 encodes a raw Date object differently for a WHERE comparison
    // (execute/prepared statement) than for an INSERT against a DATE column
    // — always use a plain 'YYYY-MM-DD' string for both.
    const tanggalSql = `${tanggalInput.getFullYear()}-${String(
      tanggalInput.getMonth() + 1,
    ).padStart(2, "0")}-${String(tanggalInput.getDate()).padStart(2, "0")}`;

    // ==========================
    // KONVERSI NILAI
    // ==========================

    const telurBagus = Number(data.telur_bagus);
    const beratBagus = Number(data.berat_bagus);

    const telurKrem = Number(data.telur_krem);
    const beratKrem = Number(data.berat_krem);

    const telurRetak = Number(data.telur_retak);
    const beratRetak = Number(data.berat_retak);

    // ==========================
    // VALIDASI NILAI
    // ==========================

    const angka = {
      telur_bagus: telurBagus,
      berat_bagus: beratBagus,
      telur_krem: telurKrem,
      berat_krem: beratKrem,
      telur_retak: telurRetak,
      berat_retak: beratRetak,
    };

    for (const [field, value] of Object.entries(angka)) {
      if (Number.isNaN(value) || value < 0) {
        const err = new Error(`${field} tidak boleh bernilai negatif.`);
        err.statusCode = 422;
        throw err;
      }
    }

    // ==========================
    // NOMOR PENGAMBILAN (otomatis, boleh berkali-kali per hari)
    // ==========================

    const pengambilanKe =
      (await ProduksiModel.countByPeriodeTanggal(periode.id, tanggalSql)) + 1;

    // ==========================
    // HITUNG RATA-RATA BERAT
    // ==========================

    const rata_bagus =
      telurBagus > 0 ? Number((beratBagus / telurBagus).toFixed(2)) : 0;

    const rata_krem =
      telurKrem > 0 ? Number((beratKrem / telurKrem).toFixed(2)) : 0;

    const rata_retak =
      telurRetak > 0 ? Number((beratRetak / telurRetak).toFixed(2)) : 0;

    // ==========================
    // HITUNG TOTAL
    // ==========================

    const telur_total = telurBagus + telurKrem + telurRetak;

    const berat_total = Number(
      (beratBagus + beratKrem + beratRetak).toFixed(2),
    );

    const rata_total =
      telur_total > 0 ? Number((berat_total / telur_total).toFixed(2)) : 0;

    // ==========================
    // VALIDASI TOTAL TELUR
    // ==========================

    if (telur_total > periode.populasi_aktif) {
      const err = new Error(
        "Jumlah telur tidak boleh melebihi populasi aktif.",
      );
      err.statusCode = 422;
      throw err;
    }

    // ==========================
    // SIMPAN
    // ==========================

    const id = await ProduksiModel.create({
      periode_id: periode.id,
      tanggal: tanggalSql,
      pengambilan_ke: pengambilanKe,

      telur_bagus: telurBagus,
      berat_bagus: beratBagus,
      rata_bagus,

      telur_krem: telurKrem,
      berat_krem: beratKrem,
      rata_krem,

      telur_retak: telurRetak,
      berat_retak: beratRetak,
      rata_retak,

      telur_total,
      berat_total,
      rata_total,

      created_by: user.id,
    });

    return { id };
  }
}

export default ProduksiService;
