const geofenceService = require('../services/geofence.service');
const {
  successResponse,
  createdResponse,
  errorResponse,
} = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Geofences
 */

/**
 * Crea un nuevo geofence
 * POST /api/v1/geofences
 */
const createGeofence = asyncHandler(async (req, res) => {
  const geofenceData = req.body;
  const userId = req.user._id;

  const geofence = await geofenceService.createGeofence(geofenceData, userId);

  logger.info(`Geofence creado: ${geofence.name} por usuario ${userId}`);

  return createdResponse(res, geofence, 'Geofence creado exitosamente');
});

/**
 * Obtiene los geofences de una organización
 * GET /api/v1/organizations/:orgId/geofences
 */
const getOrganizationGeofences = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const filters = req.query;

  const geofences = await geofenceService.getOrganizationGeofences(orgId, filters);

  return successResponse(res, geofences, 'Geofences de la organización');
});

/**
 * Obtiene un geofence por ID
 * GET /api/v1/geofences/:id
 */
const getGeofenceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const geofence = await geofenceService.getGeofenceById(id);

  return successResponse(res, geofence, 'Geofence encontrado');
});

/**
 * Actualiza un geofence
 * PATCH /api/v1/geofences/:id
 */
const updateGeofence = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const geofence = await geofenceService.updateGeofence(id, updates);

  logger.info(`Geofence actualizado: ${id}`);

  return successResponse(res, geofence, 'Geofence actualizado exitosamente');
});

/**
 * Elimina un geofence
 * DELETE /api/v1/geofences/:id
 */
const deleteGeofence = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await geofenceService.deleteGeofence(id);

  logger.info(`Geofence eliminado: ${id}`);

  return successResponse(res, null, 'Geofence eliminado exitosamente');
});

/**
 * Verifica si un punto está dentro de algún geofence
 * GET /api/v1/geofences/check?lat=X&lon=Y&organizationId=Z
 */
const checkGeofences = asyncHandler(async (req, res) => {
  const { lat, lon, organizationId } = req.query;

  if (!lat || !lon || !organizationId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PARAMETERS',
        message: 'Se requieren lat, lon y organizationId',
      },
    });
  }

  const geofences = await geofenceService.findContainingGeofences(
    parseFloat(lat),
    parseFloat(lon),
    organizationId
  );

  return successResponse(
    res,
    {
      inside: geofences.length > 0,
      geofences,
    },
    'Verificación de geofences completada'
  );
});

/**
 * Limpia la caché de estados de geofences (admin only)
 * POST /api/v1/geofences/cache/clear
 */
const clearCache = asyncHandler(async (req, res) => {
  geofenceService.clearGeofenceStatesCache();

  logger.info(`Caché de geofences limpiada por usuario ${req.user._id}`);

  return successResponse(res, null, 'Caché limpiada exitosamente');
});

module.exports = {
  createGeofence,
  getOrganizationGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
  checkGeofences,
  clearCache,
};
