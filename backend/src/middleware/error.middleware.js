const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * Middleware global de manejo de errores
 * Debe ser el último middleware en la cadena
 */
const errorMiddleware = (err, req, res, next) => {
  // Log del error
  logger.error('Error caught by error middleware:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
  });

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Datos de entrada inválidos',
        details: { errors },
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Errores de cast de Mongoose (ObjectId inválido, etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `ID inválido para ${err.path}`,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Errores de duplicado (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `El ${field} ya existe`,
        field,
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_004',
        message: 'Token inválido',
      },
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTH_005',
        message: 'Token expirado',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Errores de multer (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'El archivo es demasiado grande',
          details: { maxSize: config.upload.maxFileSize },
        },
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Error al subir archivo',
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Error personalizado con statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || 'CUSTOM_ERROR',
        message: err.message,
        details: err.details || {},
      },
      timestamp: new Date().toISOString(),
    });
  }

  // Error interno del servidor (500)
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.isProduction
        ? 'Error interno del servidor'
        : err.message,
      ...(config.isDevelopment && { stack: err.stack }),
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Wrapper para async functions
 * Captura errores de funciones async y los pasa a next()
 * Uso: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
  asyncHandler,
};
