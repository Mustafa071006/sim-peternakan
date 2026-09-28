const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    // ==============================
    // USER HARUS LOGIN
    // ==============================
    if (!req.user) {
      const err = new Error("User belum login.");
      err.statusCode = 401;
      return next(err);
    }

    // ==============================
    // VALIDASI ROLE
    // ==============================
    if (!Array.isArray(roles) || roles.length === 0) {
      const err = new Error("Role middleware belum dikonfigurasi.");
      err.statusCode = 500;
      return next(err);
    }

    // ==============================
    // CEK ROLE
    // ==============================
    if (!roles.includes(req.user.role)) {
      const err = new Error("Anda tidak memiliki hak akses.");
      err.statusCode = 403;
      return next(err);
    }

    // ==============================
    // NEXT
    // ==============================
    next();
  };
};

export default roleMiddleware;
