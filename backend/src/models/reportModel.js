import db from "../config/database.js";

class ReportModel {
  // ==========================
  // PERIODE
  // ==========================

  static async getPeriode(id) {
    const [rows] = await db.execute(
      `
      SELECT
        p.id,
        p.kode_periode,
        p.jumlah_awal,
        p.populasi_aktif,
        p.tanggal_masuk,
        p.tanggal_selesai,
        k.nama AS kandang,
        s.nama AS strain
      FROM periodes p
      JOIN kandangs k
        ON k.id = p.kandang_id
      JOIN strains s
        ON s.id = p.strain_id
      WHERE p.id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0] || null;
  }

  // ==========================
  // ALIAS
  // ==========================

  static async getById(id) {
    return await this.getPeriode(id);
  }

  // ==========================
  // TOTAL MORTALITAS
  // ==========================

  static async getTotalMortalitas(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(jumlah), 0) AS total
      FROM mortalitas
      WHERE periode_id = ?
      `,
      [periodeId],
    );

    return Number(rows[0].total);
  }

  // ==========================
  // TOTAL PAKAN
  // ==========================

  static async getTotalPakan(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(total_kg), 0) AS total
      FROM feeds
      WHERE periode_id = ?
      `,
      [periodeId],
    );

    return Number(rows[0].total);
  }

  // ==========================
  // TOTAL PRODUKSI TELUR
  // ==========================

  static async getTotalProduksi(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(telur_total), 0) AS total
      FROM produksis
      WHERE periode_id = ?
      `,
      [periodeId],
    );

    return Number(rows[0].total);
  }

  // ==========================
  // TOTAL BERAT TELUR
  // ==========================

  static async getTotalBeratTelur(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        COALESCE(SUM(berat_total), 0) AS total
      FROM produksis
      WHERE periode_id = ?
      `,
      [periodeId],
    );

    return Number(rows[0].total);
  }

  // ==========================
  // TOTAL VAKSINASI
  // ==========================

  static async getTotalVaksinasi(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        COUNT(*) AS total
      FROM vaksinasi_lama
      WHERE periode_id = ?
      `,
      [periodeId],
    );

    return Number(rows[0].total);
  }

  // ==========================
  // UMUR AYAM
  // ==========================

  static async getUmurAyam(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        DATEDIFF(
          COALESCE(tanggal_selesai, CURDATE()),
          tanggal_masuk
        ) AS umur
      FROM periodes
      WHERE id = ?
      LIMIT 1
      `,
      [periodeId],
    );

    return Number(rows[0].umur);
  }

  // ==========================
  // LAMA PERIODE
  // ==========================

  static async getLamaPeriode(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        DATEDIFF(
          COALESCE(tanggal_selesai, CURDATE()),
          tanggal_masuk
        ) + 1 AS hari
      FROM periodes
      WHERE id = ?
      LIMIT 1
      `,
      [periodeId],
    );

    return Number(rows[0].hari);
  }
}

export default ReportModel;
