const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Servicio de autenticación
 * Maneja login, registro, tokens, etc.
 */

/**
 * Genera tokens JWT (access + refresh)
 * @param {Object} user - Usuario
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };

  // Access token (corta duración)
  const accessToken = jwt.sign(
    { ...payload, type: 'access' },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiry }
  );

  // Refresh token (larga duración)
  const refreshToken = jwt.sign(
    { ...payload, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiry }
  );

  return { accessToken, refreshToken };
};

/**
 * Registra un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} { user, tokens }
 */
const register = async (userData) => {
  try {
    const { email, password, displayName } = userData;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw {
        statusCode: 409,
        code: 'USER_EXISTS',
        message: 'El email ya está registrado',
      };
    }

    // Crear usuario
    const user = new User({
      email,
      password, // Se hashea automáticamente en el pre-save hook
      displayName,
      emailVerified: false,
    });

    await user.save();

    logger.info(`Nuevo usuario registrado: ${email}`);

    // Generar tokens
    const tokens = generateTokens(user);

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Error en register service:', error);
    throw error;
  }
};

/**
 * Login con email y password
 * @param {string} email
 * @param {string} password
 * @param {string} ip - IP del request
 * @returns {Promise<Object>} { user, tokens }
 */
const login = async (email, password, ip) => {
  try {
    // Buscar usuario (incluir password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      };
    }

    // Verificar si la cuenta está bloqueada
    if (user.isAccountLocked()) {
      const lockUntil = user.accountLockedUntil;
      const minutesLeft = Math.ceil((lockUntil - Date.now()) / 60000);

      throw {
        statusCode: 423,
        code: 'ACCOUNT_LOCKED',
        message: `Cuenta bloqueada. Intenta nuevamente en ${minutesLeft} minutos`,
      };
    }

    // Verificar password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await user.incrementFailedAttempts();

      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Credenciales inválidas',
      };
    }

    // Verificar estado del usuario
    if (user.status !== 'active') {
      throw {
        statusCode: 403,
        code: 'ACCOUNT_INACTIVE',
        message: 'Cuenta inactiva o suspendida',
      };
    }

    // Login exitoso - resetear intentos fallidos
    await user.resetFailedAttempts();

    // Actualizar último login
    user.lastLoginAt = new Date();
    await user.save();

    logger.info(`Usuario inició sesión: ${email} desde IP: ${ip}`);

    // Generar tokens
    const tokens = generateTokens(user);

    return {
      user: user.toPublicJSON(),
      tokens,
    };
  } catch (error) {
    logger.error('Error en login service:', error);
    throw error;
  }
};

/**
 * Renovar access token usando refresh token
 * @param {string} refreshToken
 * @returns {Promise<Object>} { accessToken, refreshToken }
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.secret);

    if (decoded.type !== 'refresh') {
      throw {
        statusCode: 401,
        code: 'INVALID_TOKEN',
        message: 'Token de tipo inválido',
      };
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId);

    if (!user || user.status !== 'active') {
      throw {
        statusCode: 401,
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado o inactivo',
      };
    }

    // Generar nuevos tokens
    const tokens = generateTokens(user);

    return tokens;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        statusCode: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Refresh token expirado',
      };
    }
    throw error;
  }
};

/**
 * Verifica un token JWT
 * @param {string} token
 * @returns {Promise<Object>} Decoded token
 */
const verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw {
        statusCode: 401,
        code: 'TOKEN_EXPIRED',
        message: 'Token expirado',
      };
    }
    throw {
      statusCode: 401,
      code: 'INVALID_TOKEN',
      message: 'Token inválido',
    };
  }
};

/**
 * Cambia la contraseña de un usuario
 * @param {string} userId
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw {
        statusCode: 404,
        code: 'USER_NOT_FOUND',
        message: 'Usuario no encontrado',
      };
    }

    // Verificar password actual
    const isValid = await user.comparePassword(currentPassword);

    if (!isValid) {
      throw {
        statusCode: 401,
        code: 'INVALID_PASSWORD',
        message: 'Contraseña actual incorrecta',
      };
    }

    // Actualizar password
    user.password = newPassword;
    await user.save();

    logger.info(`Usuario ${user.email} cambió su contraseña`);
  } catch (error) {
    logger.error('Error en changePassword service:', error);
    throw error;
  }
};

/**
 * Genera token para recuperación de contraseña
 * @param {string} email
 * @returns {Promise<string>} Reset token
 */
const generatePasswordResetToken = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Por seguridad, no revelar si el email existe
      logger.warn(`Intento de reset de password para email inexistente: ${email}`);
      return null;
    }

    // Generar token aleatorio
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hashear y guardar
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
    await user.save();

    logger.info(`Token de reset generado para: ${email}`);

    return resetToken;
  } catch (error) {
    logger.error('Error en generatePasswordResetToken:', error);
    throw error;
  }
};

/**
 * Resetea la contraseña usando el token
 * @param {string} token
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
const resetPassword = async (token, newPassword) => {
  try {
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) {
      throw {
        statusCode: 400,
        code: 'INVALID_TOKEN',
        message: 'Token inválido o expirado',
      };
    }

    // Actualizar password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    logger.info(`Password reseteado para usuario: ${user.email}`);
  } catch (error) {
    logger.error('Error en resetPassword:', error);
    throw error;
  }
};

module.exports = {
  generateTokens,
  register,
  login,
  refreshAccessToken,
  verifyToken,
  changePassword,
  generatePasswordResetToken,
  resetPassword,
};
