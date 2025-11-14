const rateLimit = require('express-rate-limit');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Rate limiter general para todas las rutas
 */
const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes, por favor intenta más tarde',
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes, por favor intenta más tarde',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Rate limiter estricto para login
 * Previene ataques de fuerza bruta
 */
const loginLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.loginMax,
  message: {
    success: false,
    error: {
      code: 'LOGIN_RATE_LIMIT',
      message: 'Demasiados intentos de inicio de sesión, intenta nuevamente en unos minutos',
    },
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
  handler: (req, res) => {
    logger.warn(`Login rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'LOGIN_RATE_LIMIT',
        message: 'Demasiados intentos de inicio de sesión, intenta nuevamente en unos minutos',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Rate limiter para registro de usuarios
 */
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 registros por hora por IP
  message: {
    success: false,
    error: {
      code: 'REGISTER_RATE_LIMIT',
      message: 'Demasiados registros desde esta IP, intenta más tarde',
    },
  },
  handler: (req, res) => {
    logger.warn(`Register rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'REGISTER_RATE_LIMIT',
        message: 'Demasiados registros desde esta IP, intenta más tarde',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Rate limiter para endpoints de tracking/location
 * Más permisivo porque se envían ubicaciones frecuentemente
 */
const locationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 120, // 120 ubicaciones por minuto (una cada 0.5 segundos aprox)
  message: {
    success: false,
    error: {
      code: 'LOCATION_RATE_LIMIT',
      message: 'Demasiadas ubicaciones enviadas, reduce la frecuencia',
    },
  },
  handler: (req, res) => {
    logger.warn(`Location rate limit exceeded for user: ${req.user?._id}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'LOCATION_RATE_LIMIT',
        message: 'Demasiadas ubicaciones enviadas, reduce la frecuencia',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Rate limiter para password reset
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // 3 intentos por hora
  message: {
    success: false,
    error: {
      code: 'PASSWORD_RESET_RATE_LIMIT',
      message: 'Demasiados intentos de recuperación de contraseña, intenta más tarde',
    },
  },
  handler: (req, res) => {
    logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_RATE_LIMIT',
        message: 'Demasiados intentos de recuperación de contraseña, intenta más tarde',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

/**
 * Rate limiter para API endpoints de organizaciones
 */
const organizationLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: 50, // 50 requests por minuto
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Demasiadas solicitudes a la API',
      },
      timestamp: new Date().toISOString(),
    });
  },
});

module.exports = {
  generalLimiter,
  loginLimiter,
  registerLimiter,
  locationLimiter,
  passwordResetLimiter,
  organizationLimiter,
};
