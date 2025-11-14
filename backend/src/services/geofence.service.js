const Geofence = require('../models/Geofence');
const Alert = require('../models/Alert');
const logger = require('../utils/logger');
const { isPointInGeofence } = require('../utils/geospatial');

/**
 * Servicio de Geofences
 * Maneja detección de entrada/salida de geofences
 */

// Cache de estados de usuarios en geofences (en memoria)
// Formato: { userId: { geofenceId: true/false } }
const userGeofenceStates = new Map();

/**
 * Procesa una ubicación y detecta eventos de geofence
 * @param {Object} location - Ubicación del usuario
 * @param {string} userId - ID del usuario
 * @param {string} organizationId - ID de la organización
 * @returns {Promise<Array>} Array de eventos detectados
 */
const processLocationForGeofences = async (location, userId, organizationId) => {
  try {
    const { latitude, longitude } = location;

    // Obtener geofences activos de la organización
    const geofences = await Geofence.find({
      organizationId,
      active: true,
    });

    if (geofences.length === 0) {
      return [];
    }

    const events = [];

    // Verificar cada geofence
    for (const geofence of geofences) {
      // Verificar si el geofence está activo según horario
      if (!geofence.isActiveNow()) {
        continue;
      }

      // Verificar si el usuario tiene acceso a este geofence
      if (!geofence.hasUserAccess(userId)) {
        continue;
      }

      // Verificar si el punto está dentro del geofence
      const isInside = isPointInGeofence(latitude, longitude, geofence);

      // Obtener estado anterior del usuario en este geofence
      const userStates = userGeofenceStates.get(userId.toString()) || {};
      const wasInside = userStates[geofence._id.toString()] || false;

      // Detectar eventos
      if (isInside && !wasInside) {
        // ENTRADA a geofence
        if (geofence.config.alertOnEnter) {
          const alert = await Alert.createGeofenceAlert(
            userId,
            organizationId,
            geofence._id,
            'enter',
            location
          );

          events.push({
            type: 'enter',
            geofence: geofence,
            alert,
          });

          // Incrementar contador
          await geofence.incrementEvent('enter');
        }
      } else if (!isInside && wasInside) {
        // SALIDA de geofence
        if (geofence.config.alertOnExit) {
          const alert = await Alert.createGeofenceAlert(
            userId,
            organizationId,
            geofence._id,
            'exit',
            location
          );

          events.push({
            type: 'exit',
            geofence: geofence,
            alert,
          });

          // Incrementar contador
          await geofence.incrementEvent('exit');
        }
      }

      // Actualizar estado
      userStates[geofence._id.toString()] = isInside;
    }

    // Guardar estado actualizado
    userGeofenceStates.set(userId.toString(), userStates);

    if (events.length > 0) {
      logger.info(`Detectados ${events.length} eventos de geofence para usuario ${userId}`);
    }

    return events;
  } catch (error) {
    logger.error('Error en processLocationForGeofences:', error);
    throw error;
  }
};

/**
 * Crea un nuevo geofence
 * @param {Object} geofenceData - Datos del geofence
 * @param {string} userId - ID del creador
 * @returns {Promise<Object>} Geofence creado
 */
const createGeofence = async (geofenceData, userId) => {
  try {
    const geofence = new Geofence({
      ...geofenceData,
      createdBy: userId,
    });

    await geofence.save();

    logger.info(`Geofence creado: ${geofence.name} por usuario ${userId}`);

    return geofence;
  } catch (error) {
    logger.error('Error en createGeofence:', error);
    throw error;
  }
};

/**
 * Obtiene geofences de una organización
 * @param {string} organizationId
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de geofences
 */
const getOrganizationGeofences = async (organizationId, filters = {}) => {
  try {
    const query = { organizationId };

    // Filtro de activo/inactivo
    if (filters.active !== undefined) {
      query.active = filters.active === 'true' || filters.active === true;
    }

    const geofences = await Geofence.find(query).sort({ createdAt: -1 });

    return geofences;
  } catch (error) {
    logger.error('Error en getOrganizationGeofences:', error);
    throw error;
  }
};

/**
 * Obtiene un geofence por ID
 * @param {string} geofenceId
 * @returns {Promise<Object>} Geofence
 */
const getGeofenceById = async (geofenceId) => {
  try {
    const geofence = await Geofence.findById(geofenceId).populate(
      'createdBy',
      'displayName email'
    );

    if (!geofence) {
      throw {
        statusCode: 404,
        code: 'GEOFENCE_NOT_FOUND',
        message: 'Geofence no encontrado',
      };
    }

    return geofence;
  } catch (error) {
    logger.error('Error en getGeofenceById:', error);
    throw error;
  }
};

/**
 * Actualiza un geofence
 * @param {string} geofenceId
 * @param {Object} updateData
 * @returns {Promise<Object>} Geofence actualizado
 */
const updateGeofence = async (geofenceId, updateData) => {
  try {
    const geofence = await Geofence.findByIdAndUpdate(
      geofenceId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!geofence) {
      throw {
        statusCode: 404,
        code: 'GEOFENCE_NOT_FOUND',
        message: 'Geofence no encontrado',
      };
    }

    logger.info(`Geofence actualizado: ${geofence.name}`);

    return geofence;
  } catch (error) {
    logger.error('Error en updateGeofence:', error);
    throw error;
  }
};

/**
 * Elimina un geofence
 * @param {string} geofenceId
 * @returns {Promise<void>}
 */
const deleteGeofence = async (geofenceId) => {
  try {
    const geofence = await Geofence.findByIdAndDelete(geofenceId);

    if (!geofence) {
      throw {
        statusCode: 404,
        code: 'GEOFENCE_NOT_FOUND',
        message: 'Geofence no encontrado',
      };
    }

    logger.info(`Geofence eliminado: ${geofence.name}`);
  } catch (error) {
    logger.error('Error en deleteGeofence:', error);
    throw error;
  }
};

/**
 * Verifica si un punto está dentro de algún geofence de una organización
 * @param {number} lat
 * @param {number} lon
 * @param {string} organizationId
 * @returns {Promise<Array>} Array de geofences que contienen el punto
 */
const findContainingGeofences = async (lat, lon, organizationId) => {
  try {
    const geofences = await Geofence.findContainingPoint(lat, lon, organizationId);

    return geofences;
  } catch (error) {
    logger.error('Error en findContainingGeofences:', error);
    throw error;
  }
};

/**
 * Limpia el cache de estados de geofences (útil para testing)
 */
const clearGeofenceStatesCache = () => {
  userGeofenceStates.clear();
  logger.info('Cache de estados de geofences limpiado');
};

module.exports = {
  processLocationForGeofences,
  createGeofence,
  getOrganizationGeofences,
  getGeofenceById,
  updateGeofence,
  deleteGeofence,
  findContainingGeofences,
  clearGeofenceStatesCache,
};
