const authService = require('../services/auth.service');
const notificationService = require('../services/notification.service');
const AuditLog = require('../models/AuditLog');
const {
  successResponse,
  createdResponse,
  errorResponse,
} = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Autenticación
 */

/**
 * Registra un nuevo usuario
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, displayName } = req.body;

  const result = await authService.register({ email, password, displayName });

  // Log de auditoría
  await AuditLog.log({
    organizationId: null,
    userId: result.user.id,
    action: 'user.register',
    category: 'auth',
    result: 'success',
    description: `Usuario registrado: ${email}`,
    request: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  logger.info(`Nuevo usuario registrado: ${email}`);

  return createdResponse(res, result, 'Usuario registrado exitosamente');
});

/**
 * Login con email y password
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password, req.ip);

  // Log de auditoría
  await AuditLog.logLogin(result.user.id, null, req);

  return successResponse(res, result, 'Login exitoso');
});

/**
 * Renueva el access token
 * POST /api/v1/auth/refresh-token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token requerido', 'MISSING_TOKEN', 400);
  }

  const tokens = await authService.refreshAccessToken(refreshToken);

  return successResponse(res, tokens, 'Token renovado exitosamente');
});

/**
 * Logout
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  // En un sistema con JWT stateless, el logout es principalmente client-side
  // Aquí podríamos invalidar el token en Redis si se implementa

  logger.info(`Usuario ${req.user.email} cerró sesión`);

  return successResponse(res, null, 'Logout exitoso');
});

/**
 * Obtiene el usuario actual
 * GET /api/v1/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  return successResponse(res, req.user.toPublicJSON(), 'Usuario actual');
});

/**
 * Solicita recuperación de contraseña
 * POST /api/v1/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const resetToken = await authService.generatePasswordResetToken(email);

  if (resetToken) {
    // Construir URL de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Enviar email
    // await notificationService.sendPasswordResetEmail({ email }, resetUrl);
    logger.info(`Email de recuperación enviado a: ${email}`);
  }

  // Por seguridad, siempre retornar éxito (no revelar si el email existe)
  return successResponse(
    res,
    null,
    'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
  );
});

/**
 * Resetea la contraseña con el token
 * POST /api/v1/auth/reset-password
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  await authService.resetPassword(token, newPassword);

  logger.info('Contraseña reseteada exitosamente');

  return successResponse(res, null, 'Contraseña reseteada exitosamente');
});

/**
 * Cambia la contraseña (usuario autenticado)
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(req.user._id, currentPassword, newPassword);

  logger.info(`Usuario ${req.user.email} cambió su contraseña`);

  return successResponse(res, null, 'Contraseña cambiada exitosamente');
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
