import db from "../config/database.js";

/**
 * Pakan harian disimpan di tabel `feeds`
 * (periode_id, pakan_id, tanggal, gram_per_ekor, total_kg, created_by).
 */
class FeedModel {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT
        f.id,
        f.periode_id,
        f.pakan_id,
        p.kode_periode,
        jp.nama AS pakan,
        f.tanggal,
        f.gram_per_ekor,
        f.total_kg,
        u.nama AS dibuat_oleh,
        f.created_at,
        f.updated_at
      FROM feeds f
      JOIN periodes p ON f.periode_id = p.id
      JOIN jenis_pakan jp ON f.pakan_id = jp.id
      JOIN users u ON f.created_by = u.id
      ORDER BY f.tanggal DESC, f.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        id, periode_id, pakan_id, tanggal, gram_per_ekor, total_kg,
        created_by, created_at, updated_at
      FROM feeds
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );
    return rows[0];
  }

  static async getById(id) {
    return await this.findById(id);
  }

  static async create(data) {
    const { periode_id, pakan_id, tanggal, gram_per_ekor, total_kg, created_by } =
      data;

    const [result] = await db.execute(
      `
      INSERT INTO feeds (periode_id, pakan_id, tanggal, gram_per_ekor, total_kg, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [periode_id, pakan_id, tanggal, gram_per_ekor, total_kg, created_by],
    );

    return result.insertId;
  }

  static async findJenisPakan(id) {
    const [rows] = await db.execute(
      `SELECT id, status FROM jenis_pakan WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0];
  }
}

export default FeedModel;
