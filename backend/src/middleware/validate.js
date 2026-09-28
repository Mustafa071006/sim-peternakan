const validate = (schema) => {
  return (req, res, next) => {
    // ==============================
    // VALIDASI SCHEMA
    // ==============================
    if (!schema) {
      const err = new Error("Validator belum dikonfigurasi.");
      err.statusCode = 500;
      return next(err);
    }

    // ==============================
    // VALIDATE REQUEST
    // ==============================
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      error.statusCode = 422;
      return next(error);
    }

    // ==============================
    // SAVE SANITIZED BODY
    // ==============================
    req.body = value;

    next();
  };
};

export default validate;
