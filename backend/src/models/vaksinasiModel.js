import db from "../config/database.js";

/**
 * Catatan vaksinasi disimpan di tabel `vaksinasi_lama`
 * (periode_id, tanggal, nama_vaksin).
 */
class VaksinasiModel {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT
        v.id,
        v.periode_id,
        p.kode_periode,
        v.tanggal,
        v.nama_vaksin,
        v.created_at,
        v.updated_at
      FROM vaksinasi_lama v
      JOIN periodes p ON v.periode_id = p.id
      ORDER BY v.tanggal DESC, v.created_at DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        v.id,
        v.periode_id,
        p.kode_periode,
        v.tanggal,
        v.nama_vaksin,
        v.created_at,
        v.updated_at
      FROM vaksinasi_lama v
      JOIN periodes p ON v.periode_id = p.id
      WHERE v.id = ?
      LIMIT 1
      `,
      [id],
    );
    return rows[0];
  }

  static async getById(id) {
    return await this.findById(id);
  }

  static async findDuplicate(periodeId, tanggal, namaVaksin) {
    const [rows] = await db.execute(
      `SELECT id FROM vaksinasi_lama WHERE periode_id = ? AND tanggal = ? AND nama_vaksin = ? LIMIT 1`,
      [periodeId, tanggal, namaVaksin],
    );
    return rows[0];
  }

  static async create({ periode_id, tanggal, nama_vaksin }) {
    const [result] = await db.execute(
      `INSERT INTO vaksinasi_lama (periode_id, tanggal, nama_vaksin) VALUES (?, ?, ?)`,
      [periode_id, tanggal, nama_vaksin],
    );
    return result.insertId;
  }

  static async delete(id) {
    await db.execute(`DELETE FROM vaksinasi_lama WHERE id = ?`, [id]);
  }
}

export default VaksinasiModel;
