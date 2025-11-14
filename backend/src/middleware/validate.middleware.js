const { validationResult } = require('express-validator');
const { validationErrorResponse } = require('../utils/responseHandler');

/**
 * Middleware para validar resultados de express-validator
 * Debe usarse después de las reglas de validación
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return validationErrorResponse(res, formattedErrors);
  }

  next();
};

module.exports = {
  validate,
};
