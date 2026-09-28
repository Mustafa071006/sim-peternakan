class ResponseHelper {
  // ==============================
  // SUCCESS (200)
  // ==============================
  static success(res, data = null, message = "Berhasil.", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  // ==============================
  // CREATED (201)
  // ==============================
  static created(res, data = null, message = "Data berhasil ditambahkan.") {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  // ==============================
  // UPDATED (200)
  // ==============================
  static updated(res, data = null, message = "Data berhasil diperbarui.") {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  // ==============================
  // DELETED (200)
  // ==============================
  static deleted(res, message = "Data berhasil dihapus.") {
    return res.status(200).json({
      success: true,
      message,
      data: null,
    });
  }

  // ==============================
  // NO CONTENT (204)
  // ==============================
  static noContent(res) {
    return res.status(204).send();
  }

  // ==============================
  // ERROR
  // ==============================
  static error(
    res,
    message = "Terjadi kesalahan.",
    statusCode = 500,
    errors = null,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }
}

export default ResponseHelper;
