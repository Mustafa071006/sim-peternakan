import pool from "../config/database.js";
import PeriodeModel from "../models/periodeModel.js";
import KandangModel from "../models/kandangModel.js";
import { ROLE } from "../constants/role.js";
import { STATUS } from "../constants/status.js";

class PeriodeService {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(user) {
    return await PeriodeModel.getAll(user);
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id, user) {
    const periode = await PeriodeModel.getById(id, user);

    if (!periode) {
      const err = new Error("Periode tidak ditemukan.");
      err.statusCode = 404;
      throw err;
    }

    return periode;
  }

  // ==========================
  // GENERATE KODE PERIODE
  // ==========================
  static async generateKodePeriode(conn) {
    const last = await PeriodeModel.getLastPeriode(conn);
    const year = new Date().getFullYear();

    if (!last) return `PRD-${year}-0001`;

    const parts = String(last.kode_periode).split("-");
    const nomor = parseInt(parts[2], 10);
    const next = Number.isFinite(nomor) ? nomor + 1 : 1;

    return `PRD-${year}-${String(next).padStart(4, "0")}`;
  }

  // ==========================
  // CREATE
  // Admin membuat periode untuk kandang yang sudah ada (populasi awal +
  // strain ditentukan admin saat itu juga).
  // ==========================
  static async create(data, user) {
    if (user.role !== ROLE.ADMIN) {
      const err = new Error("Hanya admin yang dapat membuat periode.");
      err.statusCode = 403;
      throw err;
    }

    // -------- validasi umum --------
    if (!data.tanggal_masuk) {
      const err = new Error("Tanggal masuk wajib diisi.");
      err.statusCode = 422;
      throw err;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tanggalMasuk = new Date(data.tanggal_masuk);
    tanggalMasuk.setHours(0, 0, 0, 0);

    if (Number.isNaN(tanggalMasuk.getTime())) {
      const err = new Error("Tanggal masuk tidak valid.");
      err.statusCode = 422;
      throw err;
    }
    if (tanggalMasuk > today) {
      const err = new Error("Tanggal masuk tidak boleh melebihi hari ini.");
      err.statusCode = 422;
      throw err;
    }

    const jumlahAwal = Number(data.jumlah_awal);
    if (!Number.isInteger(jumlahAwal) || jumlahAwal <= 0) {
      const err = new Error("Jumlah ayam harus lebih dari 0.");
      err.statusCode = 422;
      throw err;
    }

    const umur = Number(data.umur_awal_vendor);
    if (!Number.isFinite(umur) || umur < 0 || umur > 20) {
      const err = new Error("Umur ayam harus 0 sampai 20 minggu.");
      err.statusCode = 422;
      throw err;
    }

    const tanggalMasukSql = `${tanggalMasuk.getFullYear()}-${String(
      tanggalMasuk.getMonth() + 1,
    ).padStart(2, "0")}-${String(tanggalMasuk.getDate()).padStart(2, "0")}`;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // strain harus ada
      const strain = await PeriodeModel.findStrain(data.strain_id, conn);
      if (!strain) {
        const err = new Error("Strain tidak ditemukan.");
        err.statusCode = 404;
        throw err;
      }

      // kandang harus ada
      const kandang = await KandangModel.getById(data.kandang_id);
      if (!kandang) {
        const err = new Error("Kandang tidak ditemukan.");
        err.statusCode = 404;
        throw err;
      }

      // satu kandang hanya boleh satu periode aktif
      const aktif = await PeriodeModel.findActiveByKandang(
        data.kandang_id,
        conn,
      );
      if (aktif) {
        const err = new Error("Kandang masih memiliki periode aktif.");
        err.statusCode = 409;
        throw err;
      }

      const kodePeriode = await this.generateKodePeriode(conn);

      const periodeId = await PeriodeModel.create(
        {
          kode_periode: kodePeriode,
          kandang_id: data.kandang_id,
          strain_id: data.strain_id,
          jumlah_awal: jumlahAwal,
          populasi_aktif: jumlahAwal,
          umur_awal_vendor: umur,
          tanggal_masuk: tanggalMasukSql,
          tanggal_selesai: null,
          status: STATUS.AKTIF,
          created_by: user.id,
        },
        conn,
      );

      await conn.commit();

      return {
        id: periodeId,
        kode_periode: kodePeriode,
        kandang_id: data.kandang_id,
      };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  }
}

export default PeriodeService;
