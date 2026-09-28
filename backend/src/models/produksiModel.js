import db from "../config/database.js";

class ProduksiModel {
  // ==========================
  // GET ALL
  // ==========================
  static async getAll() {
    const [rows] = await db.execute(`
      SELECT
        pr.id,
        pr.periode_id,
        p.kode_periode,
        pr.tanggal,
        pr.pengambilan_ke,

        pr.telur_bagus,
        pr.berat_bagus,
        pr.rata_bagus,

        pr.telur_krem,
        pr.berat_krem,
        pr.rata_krem,

        pr.telur_retak,
        pr.berat_retak,
        pr.rata_retak,

        pr.telur_total,
        pr.berat_total,
        pr.rata_total,

        u.nama AS dibuat_oleh,
        pr.created_at,
        pr.updated_at

      FROM produksis pr
      JOIN periodes p
        ON pr.periode_id = p.id
      JOIN users u
        ON pr.created_by = u.id

      ORDER BY pr.tanggal DESC,
               pr.pengambilan_ke ASC
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
        pengambilan_ke,

        telur_bagus,
        berat_bagus,
        rata_bagus,

        telur_krem,
        berat_krem,
        rata_krem,

        telur_retak,
        berat_retak,
        rata_retak,

        telur_total,
        berat_total,
        rata_total,

        created_by,
        created_at,
        updated_at

      FROM produksis
      WHERE id = ?
      LIMIT 1
      `,
      [id],
    );

    return rows[0];
  }

  // ==========================
  // ALIAS
  // ==========================
  static async getById(id) {
    return await this.findById(id);
  }

  // ==========================
  // JUMLAH ENTRI HARI INI (untuk nomor pengambilan otomatis)
  // ==========================
  static async countByPeriodeTanggal(periodeId, tanggal) {
    const [[row]] = await db.execute(
      `
      SELECT COUNT(*) AS total
      FROM produksis
      WHERE periode_id = ?
        AND tanggal = ?
      `,
      [periodeId, tanggal],
    );

    return Number(row.total);
  }

  // ==========================
  // CREATE
  // ==========================
  static async create(data) {
    const {
      periode_id,
      tanggal,
      pengambilan_ke,

      telur_bagus,
      berat_bagus,
      rata_bagus,

      telur_krem,
      berat_krem,
      rata_krem,

      telur_retak,
      berat_retak,
      rata_retak,

      telur_total,
      berat_total,
      rata_total,

      created_by,
    } = data;

    const [result] = await db.execute(
      `
      INSERT INTO produksis (
        periode_id,
        tanggal,
        pengambilan_ke,

        telur_bagus,
        berat_bagus,
        rata_bagus,

        telur_krem,
        berat_krem,
        rata_krem,

        telur_retak,
        berat_retak,
        rata_retak,

        telur_total,
        berat_total,
        rata_total,

        created_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        periode_id,
        tanggal,
        pengambilan_ke,

        telur_bagus,
        berat_bagus,
        rata_bagus,

        telur_krem,
        berat_krem,
        rata_krem,

        telur_retak,
        berat_retak,
        rata_retak,

        telur_total,
        berat_total,
        rata_total,

        created_by,
      ],
    );

    return result.insertId;
  }
}

export default ProduksiModel;
