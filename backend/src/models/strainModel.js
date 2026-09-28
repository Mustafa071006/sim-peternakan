import db from "../config/database.js";

class StrainModel {
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT id, nama, created_at
      FROM strains
      ORDER BY nama ASC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      `SELECT id, nama, created_at FROM strains WHERE id = ?`,
      [id],
    );
    return rows[0];
  }

  static async create(data) {
    const [result] = await db.execute(
      `INSERT INTO strains (nama) VALUES (?)`,
      [data.nama],
    );
    return result.insertId;
  }

  static async update(id, data) {
    await db.execute(`UPDATE strains SET nama = ? WHERE id = ?`, [
      data.nama,
      id,
    ]);
  }

  static async delete(id) {
    await db.execute(`DELETE FROM strains WHERE id = ?`, [id]);
  }

  static async findByNama(nama) {
    const [rows] = await db.execute(
      `SELECT id FROM strains WHERE nama = ? LIMIT 1`,
      [nama],
    );
    return rows[0];
  }

  static async findByNamaExceptId(nama, id) {
    const [rows] = await db.execute(
      `SELECT id FROM strains WHERE nama = ? AND id <> ? LIMIT 1`,
      [nama, id],
    );
    return rows[0];
  }

  static async isUsed(id) {
    const [rows] = await db.execute(
      `SELECT id FROM periodes WHERE strain_id = ? LIMIT 1`,
      [id],
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id FROM strains WHERE id = ? LIMIT 1`,
      [id],
    );
    return rows[0];
  }
}

export default StrainModel;
