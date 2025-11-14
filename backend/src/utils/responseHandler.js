/**
 * Utilidad para manejar respuestas de la API de forma consistente
 */

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos a retornar
 * @param {String} message - Mensaje opcional
 * @param {Number} statusCode - Código HTTP (default: 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Respuesta de error estándar
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje de error
 * @param {String} code - Código de error personalizado
 * @param {Number} statusCode - Código HTTP (default: 400)
 * @param {Object} details - Detalles adicionales del error
 */
const errorResponse = (res, message, code = 'ERROR', statusCode = 400, details = {}) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Respuesta con paginación
 * @param {Object} res - Objeto response de Express
 * @param {Array} items - Array de items
 * @param {Number} page - Página actual
 * @param {Number} limit - Items por página
 * @param {Number} total - Total de items
 * @param {String} message - Mensaje opcional
 */
const paginatedResponse = (
  res,
  items,
  page,
  limit,
  total,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    },
    message,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Respuesta para recursos creados
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos del recurso creado
 * @param {String} message - Mensaje opcional
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

/**
 * Respuesta para recursos eliminados
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje opcional
 */
const deletedResponse = (res, message = 'Resource deleted successfully') => {
  return successResponse(res, null, message, 200);
};

/**
 * Respuesta para operaciones sin contenido
 * @param {Object} res - Objeto response de Express
 */
const noContentResponse = (res) => {
  return res.status(204).send();
};

/**
 * Respuesta de error 404 - No encontrado
 * @param {Object} res - Objeto response de Express
 * @param {String} resource - Nombre del recurso no encontrado
 */
const notFoundResponse = (res, resource = 'Resource') => {
  return errorResponse(
    res,
    `${resource} not found`,
    'NOT_FOUND',
    404
  );
};

/**
 * Respuesta de error 401 - No autenticado
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje personalizado
 */
const unauthorizedResponse = (res, message = 'Unauthorized') => {
  return errorResponse(
    res,
    message,
    'UNAUTHORIZED',
    401
  );
};

/**
 * Respuesta de error 403 - Prohibido
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje personalizado
 */
const forbiddenResponse = (res, message = 'Forbidden') => {
  return errorResponse(
    res,
    message,
    'FORBIDDEN',
    403
  );
};

/**
 * Respuesta de error 422 - Validación fallida
 * @param {Object} res - Objeto response de Express
 * @param {Array|Object} errors - Errores de validación
 */
const validationErrorResponse = (res, errors) => {
  return errorResponse(
    res,
    'Validation failed',
    'VALIDATION_ERROR',
    422,
    { errors }
  );
};

/**
 * Respuesta de error 500 - Error interno
 * @param {Object} res - Objeto response de Express
 * @param {String} message - Mensaje opcional
 */
const internalErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(
    res,
    message,
    'INTERNAL_ERROR',
    500
  );
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  deletedResponse,
  noContentResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  validationErrorResponse,
  internalErrorResponse,
};
