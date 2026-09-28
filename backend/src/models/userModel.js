import db from "../config/database.js";

class UserModel {
  // ==============================
  // LOGIN
  // ==============================

  static async findByEmail(email) {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        nama,
        email,
        password,
        role,
        status
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
      [email],
    );

    return rows[0];
  }

  // ==============================
  // GET USER BY ID
  // ==============================

  static async findById(id) {
    const [rows] = await db.execute(
      `
            SELECT
                id,
                nama,
                email,
                role,
                status
            FROM users
            WHERE id = ?
            LIMIT 1
            `,
      [id],
    );

    return rows[0];
  }

  // ==============================
  // KANDANG YANG DITUGASKAN KE USER (many-to-many)
  // ==============================
  static async getKandangIds(userId, conn = db) {
    const [rows] = await conn.execute(
      `SELECT kandang_id FROM kandang_operators WHERE user_id = ?`,
      [userId],
    );
    return rows.map((r) => r.kandang_id);
  }

  // ==============================
  // GET ALL USER
  // ==============================

  static async getAll() {
    const [rows] = await db.execute(
      `
            SELECT
                u.id,
                u.nama,
                u.email,
                u.role,
                u.status,
                GROUP_CONCAT(k.nama ORDER BY k.nama SEPARATOR ', ') AS kandang,
                u.created_at,
                u.updated_at
            FROM users u
            LEFT JOIN kandang_operators ko
                ON ko.user_id = u.id
            LEFT JOIN kandangs k
                ON k.id = ko.kandang_id
            GROUP BY u.id
            ORDER BY u.nama ASC
            `,
    );

    return rows;
  }

  // ==============================
  // CREATE USER
  // ==============================

  static async create(data) {
    const { nama, email, password, role, status } = data;

    const [result] = await db.execute(
      `
            INSERT INTO users
            (
                nama,
                email,
                password,
                role,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
      [nama, email, password, role, status],
    );

    return result.insertId;
  }

  // ==============================
  // UPDATE USER
  // ==============================

  static async update(id, data) {
    const { nama, email, role } = data;

    await db.execute(
      `
            UPDATE users
            SET
                nama = ?,
                email = ?,
                role = ?
            WHERE id = ?
            `,
      [nama, email, role, id],
    );
  }

  // ==============================
  // DELETE USER
  // ==============================

  static async delete(id) {
    await db.execute(
      `
            DELETE FROM users
            WHERE id = ?
            `,
      [id],
    );
  }

  // ==============================
  // UPDATE STATUS
  // ==============================

  static async updateStatus(id, status) {
    await db.execute(
      `
            UPDATE users
            SET status = ?
            WHERE id = ?
            `,
      [status, id],
    );
  }

  // ==============================
  // UPDATE PASSWORD
  // ==============================

  static async updatePassword(id, password) {
    await db.execute(
      `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
      [password, id],
    );
  }

  // ==============================
  // SEARCH USER
  // ==============================
  static async search(keyword) {
    const [rows] = await db.execute(
      `
      SELECT
          u.id,
          u.nama,
          u.email,
          u.role,
          u.status,
          GROUP_CONCAT(k.nama ORDER BY k.nama SEPARATOR ', ') AS kandang
      FROM users u
      LEFT JOIN kandang_operators ko
          ON ko.user_id = u.id
      LEFT JOIN kandangs k
          ON k.id = ko.kandang_id
      WHERE
          u.nama LIKE ?
          OR u.email LIKE ?
          OR u.role LIKE ?
      GROUP BY u.id
      ORDER BY u.nama ASC
    `,
      [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`],
    );

    return rows;
  }
}

export default UserModel;
