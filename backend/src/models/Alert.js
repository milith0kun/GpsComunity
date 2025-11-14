const mongoose = require('mongoose');
const { ALERT_TYPES, ALERT_SEVERITY, ALERT_STATUS } = require('../utils/constants');

const alertSchema = new mongoose.Schema(
  {
    // Relaciones
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },

    // Tipo de alerta
    type: {
      type: String,
      enum: Object.values(ALERT_TYPES),
      required: [true, 'Alert type is required'],
      index: true,
    },

    // Severidad
    severity: {
      type: String,
      enum: Object.values(ALERT_SEVERITY),
      default: ALERT_SEVERITY.INFO,
      index: true,
    },

    // Contenido
    title: {
      type: String,
      required: [true, 'Alert title is required'],
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
    },

    // Datos relacionados
    relatedData: {
      geofenceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Geofence',
        default: null,
      },
      locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null,
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: [Number], // [longitude, latitude]
      },
      // Datos adicionales según el tipo de alerta
      customData: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    // Estado
    status: {
      type: String,
      enum: Object.values(ALERT_STATUS),
      default: ALERT_STATUS.NEW,
      index: true,
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: String,
      default: null,
    },

    // Notificaciones enviadas
    notificationsSent: {
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      webhook: { type: Boolean, default: false },
    },

    // Prioridad (para ordenar alertas)
    priority: {
      type: Number,
      default: 0, // Mayor número = mayor prioridad
    },

    // Expiración (para alertas temporales)
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
alertSchema.index({ organizationId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ severity: 1, status: 1 });
alertSchema.index({ status: 1, createdAt: -1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL para alertas temporales

// Método: Marcar como reconocida
alertSchema.methods.acknowledge = async function (userId) {
  this.status = ALERT_STATUS.ACKNOWLEDGED;
  this.acknowledgedBy = userId;
  this.acknowledgedAt = new Date();
  await this.save();
};

// Método: Marcar como resuelta
alertSchema.methods.resolve = async function (userId, resolution = null) {
  this.status = ALERT_STATUS.RESOLVED;
  this.resolvedBy = userId;
  this.resolvedAt = new Date();
  if (resolution) {
    this.resolution = resolution;
  }
  await this.save();
};

// Método: Marcar como descartada
alertSchema.methods.dismiss = async function () {
  this.status = ALERT_STATUS.DISMISSED;
  await this.save();
};

// Método: Marcar notificación como enviada
alertSchema.methods.markNotificationSent = async function (channel) {
  if (this.notificationsSent.hasOwnProperty(channel)) {
    this.notificationsSent[channel] = true;
    await this.save();
  }
};

// Método estático: Crear alerta SOS
alertSchema.statics.createSOS = async function (userId, organizationId, location, message = '') {
  return await this.create({
    userId,
    organizationId,
    type: ALERT_TYPES.SOS,
    severity: ALERT_SEVERITY.CRITICAL,
    title: '🆘 Alerta SOS',
    message: message || 'Usuario activó alerta de emergencia',
    relatedData: {
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
    },
    priority: 100, // Máxima prioridad
  });
};

// Método estático: Crear alerta de geofence
alertSchema.statics.createGeofenceAlert = async function (
  userId,
  organizationId,
  geofenceId,
  eventType,
  location
) {
  const isEnter = eventType === 'enter';

  return await this.create({
    userId,
    organizationId,
    type: isEnter ? ALERT_TYPES.GEOFENCE_ENTER : ALERT_TYPES.GEOFENCE_EXIT,
    severity: ALERT_SEVERITY.INFO,
    title: isEnter ? '📍 Entrada a geofence' : '📍 Salida de geofence',
    message: `Usuario ${isEnter ? 'entró a' : 'salió de'} la zona`,
    relatedData: {
      geofenceId,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
    },
    priority: 50,
  });
};

// Método estático: Crear alerta de batería baja
alertSchema.statics.createBatteryLowAlert = async function (
  userId,
  organizationId,
  batteryLevel,
  location
) {
  return await this.create({
    userId,
    organizationId,
    type: ALERT_TYPES.BATTERY_LOW,
    severity: ALERT_SEVERITY.WARNING,
    title: '🔋 Batería baja',
    message: `Batería en ${batteryLevel}%`,
    relatedData: {
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      customData: { batteryLevel },
    },
    priority: 30,
  });
};

// Método estático: Obtener alertas activas de una organización
alertSchema.statics.getActiveAlerts = async function (organizationId, filters = {}) {
  const query = {
    organizationId,
    status: { $in: [ALERT_STATUS.NEW, ALERT_STATUS.ACKNOWLEDGED] },
  };

  if (filters.type) query.type = filters.type;
  if (filters.severity) query.severity = filters.severity;
  if (filters.userId) query.userId = filters.userId;

  return await this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .populate('userId', 'displayName photoURL')
    .populate('geofenceId', 'name color');
};

module.exports = mongoose.model('Alert', alertSchema);
