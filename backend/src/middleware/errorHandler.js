import ResponseHelper from "../helpers/response.js";

const errorHandler = (err, req, res, next) => {
  // ==============================
  // LOG ERROR
  // ==============================
  console.error("=================================");
  console.error(`${req.method} ${req.originalUrl}`);

  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack || err);
  } else {
    console.error(err.message);
  }

  console.error("=================================");

  // ==============================
  // JOI VALIDATION
  // ==============================
  if (err.isJoi) {
    return ResponseHelper.error(
      res,
      "Validasi gagal.",
      422,
      err.details.map((item) => ({
        field: item.path.join("."),
        message: item.message,
      })),
    );
  }

  // ==============================
  // JWT ERROR
  // ==============================
  if (err.name === "JsonWebTokenError") {
    return ResponseHelper.error(res, "Token tidak valid.", 401);
  }

  if (err.name === "TokenExpiredError") {
    return ResponseHelper.error(res, "Token telah kedaluwarsa.", 401);
  }

  // ==============================
  // MYSQL DUPLICATE
  // ==============================
  if (err.code === "ER_DUP_ENTRY") {
    return ResponseHelper.error(res, "Data sudah ada.", 409);
  }

  // ==============================
  // MYSQL FOREIGN KEY
  // ==============================
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return ResponseHelper.error(res, "Data referensi tidak ditemukan.", 422);
  }

  // ==============================
  // MYSQL REFERENCE EXISTS
  // ==============================
  if (err.code === "ER_ROW_IS_REFERENCED_2") {
    return ResponseHelper.error(
      res,
      "Data masih digunakan sehingga tidak dapat dihapus.",
      409,
    );
  }

  // ==============================
  // DEFAULT ERROR
  // ==============================
  return ResponseHelper.error(
    res,
    err.message || "Terjadi kesalahan pada server.",
    err.statusCode || 500,
  );
};

export default errorHandler;
