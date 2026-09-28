import mysql from "mysql2/promise";
import env from "./env.js";

const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // DATE columns must round-trip as plain 'YYYY-MM-DD' strings. Without this,
  // mysql2 returns them as JS Date objects at local midnight; res.json()
  // then serializes via toISOString() (UTC), which rolls the date back a day
  // in positive UTC-offset zones (e.g. Asia/Jakarta, UTC+7).
  dateStrings: true,
});

// Test koneksi saat server startup
(async () => {
  try {
    const connection = await pool.getConnection();

    console.log("Database Connected");

    connection.release();
  } catch (error) {
    console.error("Database Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
})();

export default pool;