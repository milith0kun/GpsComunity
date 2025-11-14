const locationService = require('../services/location.service');
const geofenceService = require('../services/geofence.service');
const { emitLocationUpdate, emitGeofenceEvent } = require('../websocket');
const {
  successResponse,
  createdResponse,
  paginatedResponse,
} = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Tracking/Ubicaciones
 */

/**
 * Envía una nueva ubicación
 * POST /api/v1/locations
 */
const createLocation = asyncHandler(async (req, res) => {
  const locationData = req.body;
  const userId = req.user._id;

  // Guardar ubicación
  const location = await locationService.saveLocation(locationData, userId);

  // Procesar geofences
  const geofenceEvents = await geofenceService.processLocationForGeofences(
    locationData,
    userId,
    locationData.organizationId
  );

  // Emitir evento WebSocket
  const io = req.app.get('io');
  if (io) {
    emitLocationUpdate(io, locationData.organizationId, location);

    // Emitir eventos de geofence
    for (const event of geofenceEvents) {
      emitGeofenceEvent(io, locationData.organizationId, {
        type: event.type,
        userId,
        geofenceId: event.geofence._id,
        geofenceName: event.geofence.name,
      });
    }
  }

  return createdResponse(
    res,
    { locationId: location._id, geofenceEvents },
    'Ubicación guardada exitosamente'
  );
});

/**
 * Envía múltiples ubicaciones (batch)
 * POST /api/v1/locations/batch
 */
const createBatchLocations = asyncHandler(async (req, res) => {
  const { locations } = req.body;
  const userId = req.user._id;

  if (!locations || !Array.isArray(locations)) {
    return errorResponse(res, 'Debe enviar un array de ubicaciones', 'INVALID_BATCH', 400);
  }

  const result = await locationService.saveBatchLocations(locations, userId);

  // Emitir la última ubicación por WebSocket
  if (result.lastLocation) {
    const io = req.app.get('io');
    if (io) {
      emitLocationUpdate(io, result.lastLocation.organizationId, result.lastLocation);
    }
  }

  return successResponse(
    res,
    result,
    `Batch procesado: ${result.insertedCount} exitosas, ${result.failedCount} fallidas`
  );
});

/**
 * Obtiene la ubicación actual de un usuario
 * GET /api/v1/locations/current/:userId
 */
const getCurrentLocation = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const snapshot = await locationService.getCurrentLocation(userId);

  if (!snapshot) {
    return successResponse(res, null, 'No hay ubicación disponible');
  }

  return successResponse(res, snapshot, 'Ubicación actual');
});

/**
 * Obtiene el historial de ubicaciones de un usuario
 * GET /api/v1/locations/history/:userId
 */
const getLocationHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate, limit, page } = req.query;

  const offset = page ? (parseInt(page) - 1) * parseInt(limit || 100) : 0;

  const result = await locationService.getLocationHistory(userId, {
    startDate,
    endDate,
    limit: parseInt(limit) || 100,
    offset,
  });

  return paginatedResponse(
    res,
    result.locations,
    result.page,
    parseInt(limit) || 100,
    result.total,
    'Historial de ubicaciones'
  );
});

/**
 * Obtiene ubicaciones en vivo de una organización
 * GET /api/v1/organizations/:orgId/locations/live
 */
const getOrganizationLiveLocations = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const filters = req.query;

  const snapshots = await locationService.getOrganizationLiveLocations(orgId, filters);

  return successResponse(res, snapshots, 'Ubicaciones en vivo');
});

/**
 * Obtiene historial de ubicaciones de una organización
 * GET /api/v1/organizations/:orgId/locations/history
 */
const getOrganizationLocationHistory = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const { userId, startDate, endDate, limit, page } = req.query;

  const result = await locationService.getOrganizationLocationHistory(orgId, {
    userId,
    startDate,
    endDate,
    limit: parseInt(limit) || 100,
    page: parseInt(page) || 1,
  });

  return successResponse(res, result, 'Historial de ubicaciones de la organización');
});

/**
 * Obtiene ubicaciones cercanas a un punto
 * GET /api/v1/locations/nearby
 */
const getNearbyLocations = asyncHandler(async (req, res) => {
  const { lat, lon, radius, organizationId } = req.query;

  if (!lat || !lon) {
    return errorResponse(res, 'Latitud y longitud requeridas', 'MISSING_COORDS', 400);
  }

  const snapshots = await locationService.getNearbyLocations(
    parseFloat(lat),
    parseFloat(lon),
    parseInt(radius) || 1000,
    organizationId
  );

  return successResponse(res, snapshots, 'Ubicaciones cercanas');
});

/**
 * Obtiene estadísticas de ubicaciones de un usuario
 * GET /api/v1/locations/stats/:userId
 */
const getUserLocationStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { startDate, endDate } = req.query;

  const stats = await locationService.getUserLocationStats(
    userId,
    startDate ? new Date(startDate) : new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate ? new Date(endDate) : new Date()
  );

  return successResponse(res, stats, 'Estadísticas de ubicaciones');
});

module.exports = {
  createLocation,
  createBatchLocations,
  getCurrentLocation,
  getLocationHistory,
  getOrganizationLiveLocations,
  getOrganizationLocationHistory,
  getNearbyLocations,
  getUserLocationStats,
};
