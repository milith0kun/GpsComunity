const alertService = require('../services/alert.service');
const {
  successResponse,
  createdResponse,
  paginatedResponse,
} = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Alertas
 */

/**
 * Crea una alerta SOS
 * POST /api/v1/alerts/sos
 */
const createSOSAlert = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { organizationId, location, message } = req.body;

  const alert = await alertService.createSOSAlert(
    userId,
    organizationId,
    location,
    { message }
  );

  logger.warn(`Alerta SOS creada por usuario ${userId}`);

  return createdResponse(res, alert, 'Alerta SOS enviada exitosamente');
});

/**
 * Obtiene las alertas de una organización
 * GET /api/v1/organizations/:orgId/alerts
 */
const getOrganizationAlerts = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const filters = req.query;

  const result = await alertService.getOrganizationAlerts(orgId, filters);

  return paginatedResponse(
    res,
    result.alerts,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Alertas de la organización'
  );
});

/**
 * Obtiene las alertas de un usuario
 * GET /api/v1/users/:userId/alerts
 */
const getUserAlerts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const filters = req.query;

  // Validar que el usuario solo pueda ver sus propias alertas (a menos que sea admin)
  if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'No tienes permiso para ver estas alertas',
      },
    });
  }

  const result = await alertService.getUserAlerts(userId, filters);

  return paginatedResponse(
    res,
    result.alerts,
    result.pagination.page,
    result.pagination.limit,
    result.pagination.total,
    'Alertas del usuario'
  );
});

/**
 * Obtiene una alerta por ID
 * GET /api/v1/alerts/:id
 */
const getAlertById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const alert = await alertService.getAlertById(id);

  return successResponse(res, alert, 'Alerta encontrada');
});

/**
 * Actualiza una alerta
 * PATCH /api/v1/alerts/:id
 */
const updateAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Campos permitidos para actualización
  const allowedUpdates = ['metadata', 'notes'];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const alert = await alertService.updateAlert(id, updateData);

  return successResponse(res, alert, 'Alerta actualizada');
});

/**
 * Reconoce una alerta
 * POST /api/v1/alerts/:id/acknowledge
 */
const acknowledgeAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const alert = await alertService.acknowledgeAlert(id, userId);

  logger.info(`Alerta ${id} reconocida por usuario ${userId}`);

  return successResponse(res, alert, 'Alerta reconocida exitosamente');
});

/**
 * Resuelve una alerta
 * POST /api/v1/alerts/:id/resolve
 */
const resolveAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { notes } = req.body;

  const alert = await alertService.resolveAlert(id, userId, { notes });

  logger.info(`Alerta ${id} resuelta por usuario ${userId}`);

  return successResponse(res, alert, 'Alerta resuelta exitosamente');
});

/**
 * Elimina una alerta
 * DELETE /api/v1/alerts/:id
 */
const deleteAlert = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await alertService.deleteAlert(id);

  logger.info(`Alerta ${id} eliminada`);

  return successResponse(res, null, 'Alerta eliminada exitosamente');
});

module.exports = {
  createSOSAlert,
  getOrganizationAlerts,
  getUserAlerts,
  getAlertById,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
};
