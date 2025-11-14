const Alert = require('../models/Alert');
const Member = require('../models/Member');
const Organization = require('../models/Organization');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');
const { AppError } = require('../middleware/error.middleware');

/**
 * Servicio de Alertas
 */

/**
 * Crea una nueva alerta
 */
const createAlert = async (alertData) => {
  try {
    const alert = new Alert(alertData);
    await alert.save();

    logger.info(`Alerta creada: ${alert.type} para usuario ${alert.userId}`);

    // Enviar notificaciones a los administradores de la organización
    await notifyOrganizationAdmins(alert);

    // Emitir evento WebSocket (se manejará desde el servicio que llama)
    return alert;
  } catch (error) {
    logger.error(`Error al crear alerta: ${error.message}`);
    throw new AppError('Error al crear alerta', 500);
  }
};

/**
 * Crea una alerta SOS
 */
const createSOSAlert = async (userId, organizationId, location, metadata = {}) => {
  try {
    const alertData = {
      type: 'sos',
      severity: 'critical',
      userId,
      organizationId,
      title: 'Alerta SOS',
      message: metadata.message || 'Usuario ha enviado una señal de emergencia',
      location: location ? {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        accuracy: location.accuracy,
      } : undefined,
      metadata: {
        ...metadata,
        triggeredBy: 'user',
        platform: metadata.platform || 'unknown',
      },
      status: 'active',
    };

    const alert = await createAlert(alertData);

    logger.warn(`Alerta SOS creada por usuario ${userId}`);

    return alert;
  } catch (error) {
    logger.error(`Error al crear alerta SOS: ${error.message}`);
    throw error;
  }
};

/**
 * Crea una alerta de geofence
 */
const createGeofenceAlert = async (userId, organizationId, geofence, eventType, location) => {
  try {
    const severityMap = {
      enter: geofence.alertSettings?.onEnter?.severity || 'medium',
      exit: geofence.alertSettings?.onExit?.severity || 'medium',
    };

    const alertData = {
      type: 'geofence',
      severity: severityMap[eventType] || 'medium',
      userId,
      organizationId,
      geofenceId: geofence._id,
      title: `Evento de Geofence: ${geofence.name}`,
      message: `Usuario ${eventType === 'enter' ? 'entró a' : 'salió de'} ${geofence.name}`,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        accuracy: location.accuracy,
      },
      metadata: {
        geofenceName: geofence.name,
        eventType,
        triggeredBy: 'system',
      },
      status: 'active',
    };

    const alert = await createAlert(alertData);

    return alert;
  } catch (error) {
    logger.error(`Error al crear alerta de geofence: ${error.message}`);
    throw error;
  }
};

/**
 * Crea una alerta de batería baja
 */
const createLowBatteryAlert = async (userId, organizationId, batteryLevel, location) => {
  try {
    const alertData = {
      type: 'low_battery',
      severity: batteryLevel < 10 ? 'high' : 'medium',
      userId,
      organizationId,
      title: 'Batería Baja',
      message: `El dispositivo tiene ${batteryLevel}% de batería`,
      location: location ? {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        accuracy: location.accuracy,
      } : undefined,
      metadata: {
        batteryLevel,
        triggeredBy: 'system',
      },
      status: 'active',
    };

    const alert = await createAlert(alertData);

    return alert;
  } catch (error) {
    logger.error(`Error al crear alerta de batería: ${error.message}`);
    throw error;
  }
};

/**
 * Obtiene las alertas de una organización
 */
const getOrganizationAlerts = async (organizationId, filters = {}) => {
  try {
    const query = { organizationId };

    // Filtros
    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.severity) {
      query.severity = filters.severity;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.userId) {
      query.userId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const limit = parseInt(filters.limit) || 50;
    const page = parseInt(filters.page) || 1;
    const skip = (page - 1) * limit;

    const alerts = await Alert.find(query)
      .populate('userId', 'displayName email photoURL')
      .populate('geofenceId', 'name type')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Alert.countDocuments(query);

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error al obtener alertas: ${error.message}`);
    throw new AppError('Error al obtener alertas', 500);
  }
};

/**
 * Obtiene las alertas de un usuario
 */
const getUserAlerts = async (userId, filters = {}) => {
  try {
    const query = { userId };

    if (filters.type) {
      query.type = filters.type;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const limit = parseInt(filters.limit) || 50;
    const page = parseInt(filters.page) || 1;
    const skip = (page - 1) * limit;

    const alerts = await Alert.find(query)
      .populate('geofenceId', 'name type')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Alert.countDocuments(query);

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error(`Error al obtener alertas del usuario: ${error.message}`);
    throw new AppError('Error al obtener alertas', 500);
  }
};

/**
 * Obtiene una alerta por ID
 */
const getAlertById = async (alertId) => {
  try {
    const alert = await Alert.findById(alertId)
      .populate('userId', 'displayName email photoURL')
      .populate('organizationId', 'name')
      .populate('geofenceId', 'name type')
      .populate('acknowledgedBy', 'displayName email')
      .populate('resolvedBy', 'displayName email');

    if (!alert) {
      throw new AppError('Alerta no encontrada', 404);
    }

    return alert;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error al obtener alerta: ${error.message}`);
    throw new AppError('Error al obtener alerta', 500);
  }
};

/**
 * Actualiza una alerta
 */
const updateAlert = async (alertId, updateData) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!alert) {
      throw new AppError('Alerta no encontrada', 404);
    }

    logger.info(`Alerta actualizada: ${alertId}`);

    return alert;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error al actualizar alerta: ${error.message}`);
    throw new AppError('Error al actualizar alerta', 500);
  }
};

/**
 * Marca una alerta como reconocida
 */
const acknowledgeAlert = async (alertId, userId) => {
  try {
    const alert = await Alert.findById(alertId);

    if (!alert) {
      throw new AppError('Alerta no encontrada', 404);
    }

    if (alert.status === 'resolved') {
      throw new AppError('La alerta ya está resuelta', 400);
    }

    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();

    await alert.save();

    logger.info(`Alerta ${alertId} reconocida por usuario ${userId}`);

    return alert;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error al reconocer alerta: ${error.message}`);
    throw new AppError('Error al reconocer alerta', 500);
  }
};

/**
 * Marca una alerta como resuelta
 */
const resolveAlert = async (alertId, userId, resolution = {}) => {
  try {
    const alert = await Alert.findById(alertId);

    if (!alert) {
      throw new AppError('Alerta no encontrada', 404);
    }

    if (alert.status === 'resolved') {
      throw new AppError('La alerta ya está resuelta', 400);
    }

    alert.status = 'resolved';
    alert.resolvedBy = userId;
    alert.resolvedAt = new Date();

    if (resolution.notes) {
      alert.metadata = {
        ...alert.metadata,
        resolutionNotes: resolution.notes,
      };
    }

    await alert.save();

    logger.info(`Alerta ${alertId} resuelta por usuario ${userId}`);

    return alert;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error al resolver alerta: ${error.message}`);
    throw new AppError('Error al resolver alerta', 500);
  }
};

/**
 * Elimina una alerta
 */
const deleteAlert = async (alertId) => {
  try {
    const alert = await Alert.findByIdAndDelete(alertId);

    if (!alert) {
      throw new AppError('Alerta no encontrada', 404);
    }

    logger.info(`Alerta eliminada: ${alertId}`);

    return alert;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error(`Error al eliminar alerta: ${error.message}`);
    throw new AppError('Error al eliminar alerta', 500);
  }
};

/**
 * Envía notificaciones a los administradores de la organización
 */
const notifyOrganizationAdmins = async (alert) => {
  try {
    // Obtener administradores y managers de la organización
    const members = await Member.find({
      organizationId: alert.organizationId,
      role: { $in: ['owner', 'admin', 'manager'] },
      status: 'active',
    }).populate('userId', 'email displayName');

    // Enviar notificaciones
    for (const member of members) {
      if (member.userId && member.userId.email) {
        await notificationService.sendAlertNotification(alert, [member.userId]);
      }
    }
  } catch (error) {
    logger.error(`Error al notificar administradores: ${error.message}`);
    // No lanzar error, solo log
  }
};

module.exports = {
  createAlert,
  createSOSAlert,
  createGeofenceAlert,
  createLowBatteryAlert,
  getOrganizationAlerts,
  getUserAlerts,
  getAlertById,
  updateAlert,
  acknowledgeAlert,
  resolveAlert,
  deleteAlert,
};
