const morgan = require('morgan');
const logger = require('../utils/logger');
const config = require('../config/environment');

/**
 * Configuración de Morgan para logging de HTTP requests
 */

// Formato personalizado de Morgan
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

morgan.token('user-email', (req) => {
  return req.user ? req.user.email : 'anonymous';
});

// Formato de log en desarrollo (más verbose)
const devFormat =
  ':method :url :status :response-time ms - :res[content-length] - User: :user-email';

// Formato de log en producción (JSON)
const prodFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time ms',
  contentLength: ':res[content-length]',
  userId: ':user-id',
  ip: ':remote-addr',
  userAgent: ':user-agent',
});

// Stream personalizado que usa winston
const stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Middleware de Morgan
const httpLogger = morgan(config.isDevelopment ? devFormat : prodFormat, {
  stream,
  // No loguear requests a /health (demasiado verbose)
  skip: (req) => req.url === '/health' || req.url === '/api/v1/health',
});

/**
 * Middleware para loguear body de requests (solo en desarrollo)
 * CUIDADO: No usar en producción por seguridad y performance
 */
const requestBodyLogger = (req, res, next) => {
  if (config.isDevelopment && req.body && Object.keys(req.body).length > 0) {
    // No loguear passwords
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.refreshToken) sanitizedBody.refreshToken = '[REDACTED]';

    logger.debug('Request Body:', sanitizedBody);
  }
  next();
};

module.exports = {
  httpLogger,
  requestBodyLogger,
};
