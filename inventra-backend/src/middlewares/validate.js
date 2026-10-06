const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  // Remove images that multer already saved for a request that failed validation
  (req.files || []).forEach((f) => fs.unlink(path.resolve(f.path), () => {}));

  res.status(422).json({
    success: false,
    message: errors.array()[0].msg,
    errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
  });
};

module.exports = validate;
