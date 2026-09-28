import db from "../config/database.js";
import { ROLE } from "../constants/role.js";

class PeriodeModel {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll(user) {
    let query = `
      SELECT
        p.id,
        p.kode_periode,
        p.kandang_id,
        k.kode AS kandang_kode,
        k.nama AS kandang,
        k.jenis AS kandang_jenis,
        p.strain_id,
        s.nama AS strain,
        p.jumlah_awal,
        p.populasi_aktif,
        p.umur_awal_vendor,
        p.tanggal_masuk,
        p.tanggal_selesai,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at
      FROM periodes p
      JOIN kandangs k ON p.kandang_id = k.id
      JOIN strains s  ON p.strain_id = s.id
    `;

    const params = [];

    if (user.role === ROLE.OPERATOR) {
      query += ` WHERE p.kandang_id IN (SELECT kandang_id FROM kandang_operators WHERE user_id = ?)`;
      params.push(user.id);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [rows] = await db.execute(query, params);
    return rows;
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id, user) {
    let query = `
      SELECT
        p.id,
        p.kode_periode,
        p.kandang_id,
        k.kode AS kandang_kode,
        k.nama AS kandang,
        k.jenis AS kandang_jenis,
        p.strain_id,
        s.nama AS strain,
        p.jumlah_awal,
        p.populasi_aktif,
        p.umur_awal_vendor,
        p.tanggal_masuk,
        p.tanggal_selesai,
        p.status,
        p.created_by,
        p.created_at,
        p.updated_at
      FROM periodes p
      JOIN kandangs k ON p.kandang_id = k.id
      JOIN strains s  ON p.strain_id = s.id
      WHERE p.id = ?
    `;

    const params = [id];

    if (user.role === ROLE.OPERATOR) {
      query += ` AND p.kandang_id IN (SELECT kandang_id FROM kandang_operators WHERE user_id = ?)`;
      params.push(user.id);
    }

    query += ` LIMIT 1`;

    const [rows] = await db.execute(query, params);
    return rows[0];
  }

  // ==========================
  // CEK STRAIN
  // ==========================
  static async findStrain(id, conn = db) {
    const [rows] = await conn.execute(
      `SELECT id FROM strains WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0];
  }

  // ==========================
  // CEK PERIODE AKTIF PADA KANDANG
  // ==========================
  static async findActiveByKandang(kandangId, conn = db) {
    const [rows] = await conn.execute(
      `SELECT id FROM periodes WHERE kandang_id = ? AND status = 'Aktif' LIMIT 1`,
      [kandangId],
    );
    return rows[0];
  }

  // ==========================
  // GET LAST KODE PERIODE
  // ==========================
  static async getLastPeriode(conn = db) {
    const [rows] = await conn.execute(
      `SELECT kode_periode FROM periodes ORDER BY id DESC LIMIT 1`,
    );
    return rows[0];
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(data, conn = db) {
    const {
      kode_periode,
      kandang_id,
      strain_id,
      jumlah_awal,
      populasi_aktif,
      umur_awal_vendor,
      tanggal_masuk,
      tanggal_selesai,
      status,
      created_by,
    } = data;

    const [result] = await conn.execute(
      `
      INSERT INTO periodes (
        kode_periode,
        kandang_id,
        strain_id,
        jumlah_awal,
        populasi_aktif,
        umur_awal_vendor,
        tanggal_masuk,
        tanggal_selesai,
        status,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        kode_periode,
        kandang_id,
        strain_id,
        jumlah_awal,
        populasi_aktif,
        umur_awal_vendor,
        tanggal_masuk,
        tanggal_selesai,
        status,
        created_by,
      ],
    );

    return result.insertId;
  }

  // ==========================
  // FIND BY ID (ALIAS)
  // ==========================
  static async findById(id, user) {
    return await this.getById(id, user);
  }

  // ==========================
  // UPDATE POPULASI AKTIF
  // ==========================
  static async updatePopulasiAktif(id, populasiAktif) {
    await db.execute(
      `UPDATE periodes SET populasi_aktif = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [populasiAktif, id],
    );
  }

  // ==========================
  // KURANGI POPULASI AKTIF (atomic, hindari race condition)
  // ==========================
  static async decrementPopulasiAktif(id, jumlah, conn = db) {
    await conn.execute(
      `UPDATE periodes SET populasi_aktif = populasi_aktif - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [jumlah, id],
    );
  }

  // ==========================
  // TUTUP PERIODE
  // ==========================
  static async closePeriode(id, tanggalSelesai) {
    await db.execute(
      `UPDATE periodes SET status = 'Selesai', tanggal_selesai = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [tanggalSelesai, id],
    );
  }
}

export default PeriodeModel;
