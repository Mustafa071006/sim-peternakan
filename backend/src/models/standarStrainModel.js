import db from "../config/database.js";

class StandarStrainModel {
  // ==============================
  // GET ALL
  // ==============================
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT
        ss.id,
        ss.strain_id,
        s.nama AS strain,
        ss.umur_minggu,
        ss.feed_gram,
        ss.produksi_persen,
        ss.berat_telur,
        ss.created_at,
        ss.updated_at
      FROM standar_strains ss
      INNER JOIN strains s
        ON ss.strain_id = s.id
      ORDER BY s.nama ASC, ss.umur_minggu ASC
    `);

    return rows;
  }

  // ==============================
  // FIND BY ID
  // ==============================
  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT
        ss.id,
        ss.strain_id,
        s.nama AS strain,
        ss.umur_minggu,
        ss.feed_gram,
        ss.produksi_persen,
        ss.berat_telur,
        ss.created_at,
        ss.updated_at
      FROM standar_strains ss
      INNER JOIN strains s
        ON ss.strain_id = s.id
      WHERE ss.id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0];
  }

  // ==============================
  // FIND BY STRAIN & UMUR
  // ==============================
  static async findByStrainAndUmur(strainId, umurMinggu) {
    const [rows] = await db.execute(
      `
      SELECT id
      FROM standar_strains
      WHERE strain_id = ?
        AND umur_minggu = ?
      LIMIT 1
      `,
      [strainId, umurMinggu],
    );

    return rows[0];
  }

  // ==============================
  // CREATE
  // ==============================
  static async create(data) {
    const { strain_id, umur_minggu, feed_gram, produksi_persen, berat_telur } =
      data;

    const [result] = await db.execute(
      `
      INSERT INTO standar_strains (
        strain_id,
        umur_minggu,
        feed_gram,
        produksi_persen,
        berat_telur
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [strain_id, umur_minggu, feed_gram, produksi_persen, berat_telur],
    );

    return result.insertId;
  }

  // ==============================
  // UPDATE
  // ==============================
  static async update(id, data) {
    const { strain_id, umur_minggu, feed_gram, produksi_persen, berat_telur } =
      data;

    await db.execute(
      `
      UPDATE standar_strains
      SET
        strain_id = ?,
        umur_minggu = ?,
        feed_gram = ?,
        produksi_persen = ?,
        berat_telur = ?
      WHERE id = ?
      `,
      [strain_id, umur_minggu, feed_gram, produksi_persen, berat_telur, id],
    );
  }

  // ==============================
  // DELETE
  // ==============================
  static async delete(id) {
    await db.execute(
      `
      DELETE FROM standar_strains
      WHERE id = ?
      `,
      [id],
    );
  }
}

export default StandarStrainModel;
