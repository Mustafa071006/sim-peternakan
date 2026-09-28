import db from "../config/database.js";

class VaksinModel {
  // ==========================
  // GET ALL
  // ==========================

  static async getAll() {
    const [rows] = await db.execute(`
      SELECT
        id,
        nama,
        deskripsi,
        status,
        created_at,
        updated_at
      FROM vaksin
      ORDER BY nama ASC
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
        nama,
        deskripsi,
        status,
        created_at,
        updated_at
      FROM vaksin
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0];
  }

  // Alias supaya file lama tetap jalan
  static async getById(id) {
    return await this.findById(id);
  }

  // ==========================
  // FIND BY NAMA
  // ==========================

  static async findByNama(nama) {
    const [rows] = await db.execute(
      `
      SELECT id
      FROM vaksin
      WHERE nama = ?
      LIMIT 1
      `,
      [nama],
    );

    return rows[0];
  }

  // ==========================
  // FIND BY NAMA EXCEPT ID
  // ==========================

  static async findByNamaExceptId(nama, id) {
    const [rows] = await db.execute(
      `
      SELECT id
      FROM vaksin
      WHERE nama = ?
        AND id <> ?
      LIMIT 1
      `,
      [nama, id],
    );

    return rows[0];
  }

  // ==========================
  // CREATE
  // ==========================

  static async create(data) {
    const { nama, deskripsi, status } = data;

    const [result] = await db.execute(
      `
      INSERT INTO vaksin
      (
        nama,
        deskripsi,
        status
      )
      VALUES (?, ?, ?)
      `,
      [nama, deskripsi, status],
    );

    return result.insertId;
  }

  // ==========================
  // UPDATE
  // ==========================

  static async update(id, data) {
    const { nama, deskripsi, status } = data;

    await db.execute(
      `
      UPDATE vaksin
      SET
        nama = ?,
        deskripsi = ?,
        status = ?
      WHERE id = ?
      `,
      [nama, deskripsi, status, id],
    );
  }

  // ==========================
  // DELETE
  // ==========================

  static async delete(id) {
    await db.execute(
      `
      DELETE FROM vaksin
      WHERE id = ?
      `,
      [id],
    );
  }
}

export default VaksinModel;
