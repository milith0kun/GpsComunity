const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/environment');
const { unauthorizedResponse } = require('../utils/responseHandler');
const { ERROR_CODES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Middleware de autenticación
 * Verifica el token JWT y adjunta el usuario a req.user
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return unauthorizedResponse(res, 'Token no proporcionado', ERROR_CODES.AUTH_001);
    }

    if (!authHeader.startsWith('Bearer ')) {
      return unauthorizedResponse(res, 'Formato de token inválido', ERROR_CODES.AUTH_002);
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // 2. Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return unauthorizedResponse(res, 'Token expirado', ERROR_CODES.AUTH_005);
      }
      if (error.name === 'JsonWebTokenError') {
        return unauthorizedResponse(res, 'Token inválido', ERROR_CODES.AUTH_004);
      }
      throw error;
    }

    // 3. Verificar que sea access token
    if (decoded.type !== 'access') {
      return unauthorizedResponse(res, 'Tipo de token inválido', ERROR_CODES.AUTH_002);
    }

    // 4. Buscar usuario
    const user = await User.findById(decoded.userId);

    if (!user) {
      return unauthorizedResponse(res, 'Usuario no encontrado', ERROR_CODES.AUTH_003);
    }

    // 5. Verificar estado del usuario
    if (user.status !== 'active') {
      return unauthorizedResponse(res, 'Cuenta inactiva o suspendida', ERROR_CODES.AUTH_003);
    }

    // 6. Verificar si la cuenta está bloqueada
    if (user.isAccountLocked()) {
      return unauthorizedResponse(res, 'Cuenta bloqueada temporalmente', ERROR_CODES.AUTH_007);
    }

    // 7. Adjuntar usuario a request
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    logger.error('Error en auth middleware:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor',
      },
    });
  }
};

/**
 * Middleware opcional de autenticación
 * Similar a authMiddleware pero no falla si no hay token
 * Útil para rutas que pueden funcionar con o sin autenticación
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continuar sin usuario
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      if (decoded.type === 'access') {
        const user = await User.findById(decoded.userId);
        if (user && user.status === 'active') {
          req.user = user;
          req.userId = user._id;
        }
      }
    } catch (error) {
      // Si hay error con el token, simplemente continuar sin usuario
      logger.debug('Optional auth middleware: token inválido o expirado');
    }

    next();
  } catch (error) {
    logger.error('Error en optional auth middleware:', error);
    next();
  }
};

/**
 * Middleware para verificar email verificado
 * Debe usarse después de authMiddleware
 */
const requireEmailVerified = (req, res, next) => {
  if (!req.user) {
    return unauthorizedResponse(res, 'Autenticación requerida');
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: ERROR_CODES.AUTH_008,
        message: 'Email no verificado',
      },
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireEmailVerified,
};
