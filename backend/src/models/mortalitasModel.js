import db from "../config/database.js";

class MortalitasModel {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT
        m.id,
        m.periode_id,
        p.kode_periode,
        m.tanggal,
        m.jumlah,
        m.penyebab,
        m.foto,
        u.nama AS dibuat_oleh,
        m.created_at,
        m.updated_at
      FROM mortalitas m
      JOIN periodes p
        ON m.periode_id = p.id
      JOIN users u
        ON m.created_by = u.id
      ORDER BY m.tanggal DESC, m.created_at DESC
    `);

    return rows;
  }

  // ==========================
  // FIND BY ID
  // ==========================
  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        periode_id,
        tanggal,
        jumlah,
        penyebab,
        foto,
        created_by,
        created_at,
        updated_at
      FROM mortalitas
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0];
  }

  // Alias
  static async getById(id) {
    return await this.findById(id);
  }

  // ==========================
  // TOTAL MORTALITAS PER PERIODE
  // ==========================
  static async getTotalByPeriode(periodeId) {
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
  // GET PERIODE
  // ==========================
  static async getPeriode(periodeId) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        jumlah_awal,
        populasi_aktif,
        status
      FROM periodes
      WHERE id = ?
      LIMIT 1
    `,
      [periodeId],
    );

    return rows[0];
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(data) {
    const { periode_id, tanggal, jumlah, penyebab, foto, created_by } = data;

    const [result] = await db.execute(
      `
      INSERT INTO mortalitas (
        periode_id,
        tanggal,
        jumlah,
        penyebab,
        foto,
        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [periode_id, tanggal, jumlah, penyebab || null, foto || null, created_by],
    );

    return result.insertId;
  }
}

export default MortalitasModel;
