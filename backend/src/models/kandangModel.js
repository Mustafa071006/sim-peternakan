import db from "../config/database.js";

class KandangModel {
  // ==========================
  // GET ALL (admin monitoring, read-only)
  // ==========================
  static async getAll(query) {
    const { search, sort, order, limit, offset } = query;

    const keyword = `%${search}%`;

    // MySQL rejects `?` placeholders for LIMIT/OFFSET in prepared statements.
    // `limit`/`offset` are integers from QueryHelper; `sort`/`order` come from a
    // whitelist, so inlining them here is injection-safe.
    const lim = Number.isFinite(Number(limit)) ? Math.max(1, Number(limit)) : 10;
    const off = Number.isFinite(Number(offset)) ? Math.max(0, Number(offset)) : 0;

    const [rows] = await db.execute(
      `
      SELECT
        k.id,
        k.kode,
        k.nama,
        k.jenis,
        k.status,
        GROUP_CONCAT(u.id   ORDER BY u.nama SEPARATOR ',')  AS operator_ids,
        GROUP_CONCAT(u.nama ORDER BY u.nama SEPARATOR ', ') AS operator_nama,
        k.created_at,
        k.updated_at
      FROM kandangs k
      LEFT JOIN kandang_operators ko
        ON ko.kandang_id = k.id
      LEFT JOIN users u
        ON u.id = ko.user_id AND u.role = 'Operator'
      WHERE
        k.kode LIKE ?
        OR k.nama LIKE ?
      GROUP BY k.id
      ORDER BY k.${sort} ${order}
      LIMIT ${lim} OFFSET ${off}
      `,
      [keyword, keyword],
    );

    const [count] = await db.execute(
      `
      SELECT COUNT(*) AS total
      FROM kandangs
      WHERE kode LIKE ? OR nama LIKE ?
      `,
      [keyword, keyword],
    );

    return { data: rows, total: count[0].total };
  }

  // ==========================
  // GET BY ID
  // ==========================
  static async getById(id) {
    const [rows] = await db.execute(
      `
      SELECT id, kode, nama, jenis, status, created_at, updated_at
      FROM kandangs
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0];
  }

  // ==========================
  // GENERATE KODE (KDG-001, KDG-002, …)
  // ==========================
  static async generateKode(conn = db) {
    const [rows] = await conn.execute(
      `SELECT kode FROM kandangs ORDER BY id DESC LIMIT 1`,
    );

    let next = 1;
    if (rows[0]?.kode) {
      const parsed = parseInt(String(rows[0].kode).split("-")[1], 10);
      if (Number.isFinite(parsed)) next = parsed + 1;
    }

    return `KDG-${String(next).padStart(3, "0")}`;
  }

  // ==========================
  // CREATE (admin)
  // ==========================
  static async create({ kode, nama, jenis }, conn = db) {
    const [result] = await conn.execute(
      `
      INSERT INTO kandangs (kode, nama, jenis, status)
      VALUES (?, ?, ?, 'Aktif')
      `,
      [kode, nama, jenis],
    );

    return result.insertId;
  }

  // ==========================
  // UPDATE STATUS (admin: Aktif / Nonaktif)
  // ==========================
  static async updateStatus(id, status) {
    await db.execute(
      `UPDATE kandangs SET status = ? WHERE id = ?`,
      [status, id],
    );
  }

  // ==========================
  // OPERATOR KANDANG (many-to-many)
  // ==========================
  static async getOperators(kandangId) {
    const [rows] = await db.execute(
      `
      SELECT u.id, u.nama, u.email, u.status
      FROM kandang_operators ko
      JOIN users u ON u.id = ko.user_id
      WHERE ko.kandang_id = ?
      ORDER BY u.nama ASC
      `,
      [kandangId],
    );
    return rows;
  }

  // Replace-all: operator yang tidak ada di `userIds` akan dilepas dari
  // kandang ini, sisanya ditambahkan (memindahkan operator antar kandang
  // tinggal panggil ini di kandang tujuan dan kandang asal masing-masing).
  static async setOperators(kandangId, userIds) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.execute(`DELETE FROM kandang_operators WHERE kandang_id = ?`, [
        kandangId,
      ]);

      if (userIds.length) {
        const values = userIds.map((userId) => [kandangId, userId]);
        await conn.query(
          `INSERT INTO kandang_operators (kandang_id, user_id) VALUES ?`,
          [values],
        );
      }

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
}

export default KandangModel;
