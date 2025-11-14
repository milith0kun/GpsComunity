const Location = require('../models/Location');
const LocationSnapshot = require('../models/LocationSnapshot');
const Member = require('../models/Member');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');
const { ALERT_TYPES } = require('../utils/constants');

/**
 * Servicio de ubicaciones
 * Maneja procesamiento de ubicaciones, historial, y snapshots
 */

/**
 * Guarda una nueva ubicación
 * @param {Object} locationData - Datos de ubicación
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Location guardada
 */
const saveLocation = async (locationData, userId) => {
  try {
    const { organizationId, latitude, longitude, accuracy, batteryLevel } = locationData;

    // Validar datos básicos
    if (!organizationId || !latitude || !longitude || !accuracy) {
      throw {
        statusCode: 400,
        code: 'INVALID_LOCATION_DATA',
        message: 'Datos de ubicación incompletos',
      };
    }

    // Verificar que el usuario es miembro de la organización
    const member = await Member.findOne({
      userId,
      organizationId,
      status: 'active',
    });

    if (!member) {
      throw {
        statusCode: 403,
        code: 'NOT_MEMBER',
        message: 'No eres miembro de esta organización',
      };
    }

    // Verificar que el tracking está habilitado
    if (!member.tracking.enabled) {
      throw {
        statusCode: 403,
        code: 'TRACKING_DISABLED',
        message: 'El tracking está deshabilitado para este miembro',
      };
    }

    // Crear ubicación
    const location = new Location({
      ...locationData,
      userId,
      organizationId,
      serverTimestamp: new Date(),
    });

    await location.save();

    // Actualizar snapshot (última ubicación)
    await LocationSnapshot.updateSnapshot({
      userId,
      organizationId,
      ...locationData,
    });

    // Actualizar estado online del miembro
    await member.updateOnlineStatus(true);

    // Verificar alertas (batería baja)
    if (batteryLevel !== null && batteryLevel !== undefined) {
      const threshold = member.organizationId?.settings?.alerts?.batteryLowThreshold || 15;

      if (batteryLevel <= threshold) {
        await Alert.createBatteryLowAlert(userId, organizationId, batteryLevel, location);
      }
    }

    logger.debug(`Ubicación guardada para usuario ${userId}`);

    return location;
  } catch (error) {
    logger.error('Error en saveLocation service:', error);
    throw error;
  }
};

/**
 * Guarda múltiples ubicaciones (batch)
 * @param {Array} locationsData - Array de ubicaciones
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} { insertedCount, failedCount }
 */
const saveBatchLocations = async (locationsData, userId) => {
  try {
    if (!Array.isArray(locationsData) || locationsData.length === 0) {
      throw {
        statusCode: 400,
        code: 'INVALID_BATCH',
        message: 'Batch de ubicaciones inválido',
      };
    }

    // Limitar tamaño del batch
    const maxBatchSize = parseInt(process.env.MAX_BATCH_LOCATIONS) || 100;
    if (locationsData.length > maxBatchSize) {
      throw {
        statusCode: 400,
        code: 'BATCH_TOO_LARGE',
        message: `Batch demasiado grande. Máximo ${maxBatchSize} ubicaciones`,
      };
    }

    let insertedCount = 0;
    let failedCount = 0;
    let lastLocation = null;

    // Procesar cada ubicación
    for (const locationData of locationsData) {
      try {
        const location = await saveLocation(locationData, userId);
        insertedCount++;
        lastLocation = location;
      } catch (error) {
        logger.error('Error guardando ubicación en batch:', error);
        failedCount++;
      }
    }

    logger.info(
      `Batch procesado: ${insertedCount} exitosas, ${failedCount} fallidas`
    );

    return {
      insertedCount,
      failedCount,
      lastLocation,
    };
  } catch (error) {
    logger.error('Error en saveBatchLocations service:', error);
    throw error;
  }
};

/**
 * Obtiene la última ubicación de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object|null>} LocationSnapshot
 */
const getCurrentLocation = async (userId) => {
  try {
    const snapshot = await LocationSnapshot.findOne({ userId }).populate(
      'userId',
      'displayName photoURL'
    );

    return snapshot;
  } catch (error) {
    logger.error('Error en getCurrentLocation service:', error);
    throw error;
  }
};

/**
 * Obtiene el historial de ubicaciones de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} filters - Filtros
 * @returns {Promise<Array>} Array de ubicaciones
 */
const getLocationHistory = async (userId, filters = {}) => {
  try {
    const { startDate, endDate, limit = 100, offset = 0 } = filters;

    const query = { userId };

    // Filtros de fecha
    if (startDate || endDate) {
      query.serverTimestamp = {};
      if (startDate) query.serverTimestamp.$gte = new Date(startDate);
      if (endDate) query.serverTimestamp.$lte = new Date(endDate);
    }

    const locations = await Location.find(query)
      .sort({ serverTimestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Location.countDocuments(query);

    return {
      locations,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    logger.error('Error en getLocationHistory service:', error);
    throw error;
  }
};

/**
 * Obtiene todas las ubicaciones actuales de una organización
 * @param {string} organizationId - ID de la organización
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de snapshots
 */
const getOrganizationLiveLocations = async (organizationId, filters = {}) => {
  try {
    const snapshots = await LocationSnapshot.getOrganizationSnapshots(
      organizationId,
      filters
    );

    return snapshots;
  } catch (error) {
    logger.error('Error en getOrganizationLiveLocations service:', error);
    throw error;
  }
};

/**
 * Obtiene historial de ubicaciones de una organización
 * @param {string} organizationId - ID de la organización
 * @param {Object} filters - Filtros
 * @returns {Promise<Object>} { locations, total, pagination }
 */
const getOrganizationLocationHistory = async (organizationId, filters = {}) => {
  try {
    const {
      userId,
      startDate,
      endDate,
      limit = 100,
      page = 1,
    } = filters;

    const query = { organizationId };

    // Filtro de usuario específico
    if (userId) {
      query.userId = userId;
    }

    // Filtros de fecha
    if (startDate || endDate) {
      query.serverTimestamp = {};
      if (startDate) query.serverTimestamp.$gte = new Date(startDate);
      if (endDate) query.serverTimestamp.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const locations = await Location.find(query)
      .sort({ serverTimestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('userId', 'displayName photoURL');

    const total = await Location.countDocuments(query);

    return {
      locations,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    logger.error('Error en getOrganizationLocationHistory service:', error);
    throw error;
  }
};

/**
 * Obtiene ubicaciones cercanas a un punto
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @param {number} radiusInMeters - Radio en metros
 * @param {string} organizationId - ID de organización (opcional)
 * @returns {Promise<Array>} Array de ubicaciones cercanas
 */
const getNearbyLocations = async (lat, lon, radiusInMeters = 1000, organizationId = null) => {
  try {
    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lon, lat],
          },
          $maxDistance: radiusInMeters,
        },
      },
    };

    if (organizationId) {
      query.organizationId = organizationId;
    }

    const snapshots = await LocationSnapshot.find(query)
      .limit(50)
      .populate('userId', 'displayName photoURL');

    return snapshots;
  } catch (error) {
    logger.error('Error en getNearbyLocations service:', error);
    throw error;
  }
};

/**
 * Calcula estadísticas de ubicaciones para un usuario
 * @param {string} userId - ID del usuario
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Promise<Object>} Estadísticas
 */
const getUserLocationStats = async (userId, startDate, endDate) => {
  try {
    const query = {
      userId,
      serverTimestamp: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const locations = await Location.find(query).sort({ serverTimestamp: 1 });

    if (locations.length === 0) {
      return {
        totalLocations: 0,
        totalDistance: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        averageAccuracy: 0,
      };
    }

    let totalDistance = 0;
    let totalSpeed = 0;
    let maxSpeed = 0;
    let totalAccuracy = 0;

    // Calcular estadísticas
    for (let i = 1; i < locations.length; i++) {
      const prev = locations[i - 1];
      const curr = locations[i];

      // Calcular distancia usando Haversine
      const distance = calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );

      totalDistance += distance;

      if (curr.speed) {
        totalSpeed += curr.speed;
        if (curr.speed > maxSpeed) {
          maxSpeed = curr.speed;
        }
      }

      totalAccuracy += curr.accuracy;
    }

    return {
      totalLocations: locations.length,
      totalDistance: Math.round(totalDistance), // metros
      averageSpeed: totalSpeed / locations.length, // m/s
      maxSpeed, // m/s
      averageAccuracy: totalAccuracy / locations.length, // metros
    };
  } catch (error) {
    logger.error('Error en getUserLocationStats service:', error);
    throw error;
  }
};

/**
 * Calcula distancia entre dos puntos (Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

module.exports = {
  saveLocation,
  saveBatchLocations,
  getCurrentLocation,
  getLocationHistory,
  getOrganizationLiveLocations,
  getOrganizationLocationHistory,
  getNearbyLocations,
  getUserLocationStats,
};
