import db from "../config/database.js";
import { STATUS } from "../constants/status.js";
import { ROLE } from "../constants/role.js";

class DashboardModel {
  // =====================================
  // GET ACTIVE PERIODE
  // =====================================
  static async getActivePeriode(user, kandangId = null) {
    let query = `
      SELECT
        p.id,
        p.kode_periode,
        p.strain_id,
        p.kandang_id,
        p.jumlah_awal,
        p.populasi_aktif,
        p.umur_awal_vendor,
        p.tanggal_masuk,
        k.nama AS kandang,
        s.nama AS strain
      FROM periodes p
      JOIN kandangs k
        ON p.kandang_id = k.id
      JOIN strains s
        ON p.strain_id = s.id
      WHERE p.status = ?
    `;

    const params = [STATUS.AKTIF];

    if (user.role === ROLE.OPERATOR) {
      // Operator bisa ditugaskan ke lebih dari satu kandang (backup) —
      // batasi ke kandang yang dipilih (jika ada) atau ke seluruh kandang
      // yang ditugaskan ke operator ini.
      if (kandangId) {
        query += ` AND p.kandang_id = ? AND p.kandang_id IN (SELECT kandang_id FROM kandang_operators WHERE user_id = ?)`;
        params.push(kandangId, user.id);
      } else {
        query += ` AND p.kandang_id IN (SELECT kandang_id FROM kandang_operators WHERE user_id = ?)`;
        params.push(user.id);
      }
    }

    query += `
      ORDER BY p.created_at DESC
      LIMIT 1
    `;

    const [rows] = await db.execute(query, params);

    return rows[0] || null;
  }

  // =====================================
  // GET PAKAN HARI INI
  // =====================================
  static async getFeedHariIni(periodeId) {
    const [[row]] = await db.execute(
      `
      SELECT
        COALESCE(SUM(gram_per_ekor),0) AS gram_per_ekor,
        COALESCE(SUM(total_kg),0) AS total_kg
      FROM feeds
      WHERE periode_id = ?
      AND tanggal = CURDATE()
      `,
      [periodeId],
    );

    return row;
  }

  // =====================================
  // GET PRODUKSI HARI INI
  // =====================================
  static async getProduksiHariIni(periodeId) {
    const [[row]] = await db.execute(
      `
      SELECT
        COALESCE(SUM(telur_bagus),0) AS telur_bagus,
        COALESCE(SUM(telur_krem),0) AS telur_krem,
        COALESCE(SUM(telur_retak),0) AS telur_retak,
        COALESCE(SUM(telur_total),0) AS telur_total,
        COALESCE(SUM(berat_total),0) AS berat_total
      FROM produksis
      WHERE periode_id = ?
      AND tanggal = CURDATE()
      `,
      [periodeId],
    );

    return row;
  }

  // =====================================
  // GET TOTAL MORTALITAS
  // =====================================
  static async getTotalMortalitas(periodeId) {
    const [[row]] = await db.execute(
      `
      SELECT
        COALESCE(SUM(jumlah),0) AS total
      FROM mortalitas
      WHERE periode_id = ?
      `,
      [periodeId],
    );

    return Number(row.total);
  }

  // =====================================
  // GET UMUR AYAM
  // =====================================
  static async getUmurAyam(periodeId) {
    const [[row]] = await db.execute(
      `
      SELECT
        FLOOR(
          umur_awal_vendor +
          (DATEDIFF(CURDATE(), tanggal_masuk) / 7)
        ) AS umur_minggu
      FROM periodes
      WHERE id = ?
      `,
      [periodeId],
    );

    return row;
  }

  // =====================================
  // GET STANDAR HARI INI
  // =====================================
  static async getStandarHariIni(strainId, umurMinggu) {
    const [[row]] = await db.execute(
      `
      SELECT
        feed_gram,
        produksi_persen,
        berat_telur
      FROM standar_strains
      WHERE strain_id = ?
      AND umur_minggu = ?
      LIMIT 1
      `,
      [strainId, umurMinggu],
    );

    return row || null;
  }

  // =====================================
  // GET VAKSIN TERAKHIR
  // =====================================
  static async getLastVaksin(periodeId) {
    const [[row]] = await db.execute(
      `
      SELECT
        tanggal,
        nama_vaksin
      FROM vaksinasi_lama
      WHERE periode_id = ?
      ORDER BY tanggal DESC
      LIMIT 1
      `,
      [periodeId],
    );

    return row || null;
  }

  // ==========================
  // GET PRODUKSI 7 HARI
  // ==========================
  static async getProduksiMingguan(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        DATE_FORMAT(tanggal, '%d/%m') AS hari,
        SUM(telur_total) AS total_telur,
        SUM(berat_total) AS total_berat
      FROM produksis
      WHERE periode_id = ?
        AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY tanggal
      ORDER BY tanggal ASC
      `,
      [periodeId],
    );

    return rows;
  }

  // ==========================
  // GET PAKAN 7 HARI
  // ==========================
  static async getPakanMingguan(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        DATE_FORMAT(tanggal, '%d/%m') AS hari,
        SUM(total_kg) AS total_kg,
        AVG(gram_per_ekor) AS gram_per_ekor
      FROM feeds
      WHERE periode_id = ?
        AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY tanggal
      ORDER BY tanggal ASC
      `,
      [periodeId],
    );

    return rows;
  }

  // ==========================
  // GET MORTALITAS 7 HARI
  // ==========================
  static async getMortalitasMingguan(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        DATE_FORMAT(tanggal, '%d/%m') AS hari,
        SUM(jumlah) AS total_mortalitas
      FROM mortalitas
      WHERE periode_id = ?
        AND tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY tanggal
      ORDER BY tanggal ASC
      `,
      [periodeId],
    );

    return rows;
  }

  // ==========================
  // GET PERFORMA
  // ==========================
  static async getPerforma(periodeId) {
    const [[row]] = await db.execute(
      `
      SELECT
        p.populasi_aktif,
        p.jumlah_awal,

        COALESCE((
          SELECT SUM(telur_total)
          FROM produksis
          WHERE periode_id = p.id
        ),0) AS total_telur,

        COALESCE((
          SELECT SUM(berat_total)
          FROM produksis
          WHERE periode_id = p.id
        ),0) AS total_berat_telur,

        COALESCE((
          SELECT SUM(total_kg)
          FROM feeds
          WHERE periode_id = p.id
        ),0) AS total_pakan,

        COALESCE((
          SELECT SUM(jumlah)
          FROM mortalitas
          WHERE periode_id = p.id
        ),0) AS total_mortalitas

      FROM periodes p
      WHERE p.id = ?
      `,
      [periodeId],
    );

    return row;
  }

  // ==========================
  // GET ADMIN DASHBOARD
  // ==========================
  static async getAdminDashboard() {
    const [rows] = await db.execute(
      `
      SELECT
        p.id AS periode_id,
        k.id AS kandang_id,
        k.nama AS kandang,
        p.populasi_aktif,

        COALESCE(prod.total_telur,0) AS total_telur,
        COALESCE(mort.total_mati,0) AS total_mati

      FROM periodes p

      JOIN kandangs k
        ON k.id = p.kandang_id

      LEFT JOIN (
        SELECT
          periode_id,
          SUM(telur_total) AS total_telur
        FROM produksis
        GROUP BY periode_id
      ) prod
        ON prod.periode_id = p.id

      LEFT JOIN (
        SELECT
          periode_id,
          SUM(jumlah) AS total_mati
        FROM mortalitas
        GROUP BY periode_id
      ) mort
        ON mort.periode_id = p.id

      WHERE p.status = ?

      ORDER BY k.nama ASC
      `,
      [STATUS.AKTIF],
    );

    return rows;
  }
}

export default DashboardModel;
