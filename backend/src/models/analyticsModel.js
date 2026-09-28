import db from "../config/database.js";

class AnalyticsModel {
  // ==========================
  // PRODUKSI 7 HARI TERAKHIR
  // ==========================

  static async getProduksi7Hari(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        tanggal,
        (telur_bagus + telur_krem + telur_retak) AS total
      FROM produksis
      WHERE periode_id = ?
      ORDER BY tanggal DESC
      LIMIT 7
      `,
      [periodeId],
    );

    return rows.reverse();
  }

  // ==========================
  // FEED 7 HARI TERAKHIR
  // ==========================

  static async getFeed7Hari(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        tanggal,
        total_kg
      FROM feeds
      WHERE periode_id = ?
      ORDER BY tanggal DESC
      LIMIT 7
      `,
      [periodeId],
    );

    return rows.reverse();
  }

  // ==========================
  // MORTALITAS 7 HARI TERAKHIR
  // ==========================

  static async getMortalitas7Hari(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        tanggal,
        jumlah
      FROM mortalitas
      WHERE periode_id = ?
      ORDER BY tanggal DESC
      LIMIT 7
      `,
      [periodeId],
    );

    return rows.reverse();
  }

  // ==========================
  // PRODUKSI HD 7 HARI
  // ==========================

  static async getHD7Hari(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        tanggal,
        telur_bagus,
        telur_krem,
        telur_retak
      FROM produksis
      WHERE periode_id = ?
      ORDER BY tanggal DESC
      LIMIT 7
      `,
      [periodeId],
    );

    return rows.reverse();
  }

  // ==========================
  // POPULASI AKTIF
  // ==========================

  static async getPopulasiAktif(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        populasi_aktif
      FROM periodes
      WHERE id = ?
      `,
      [periodeId],
    );

    return rows[0];
  }
}

export default AnalyticsModel;