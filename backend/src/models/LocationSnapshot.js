const mongoose = require('mongoose');
const { ACTIVITY_TYPES, NETWORK_TYPES } = require('../utils/constants');

/**
 * LocationSnapshot - Guarda solo la última ubicación de cada usuario
 * para acceso rápido en tiempo real (sin necesidad de buscar en todo el historial)
 */
const locationSnapshotSchema = new mongoose.Schema(
  {
    // Relaciones
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      unique: true, // Solo UNA ubicación por usuario
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },

    // Ubicación geoespacial (GeoJSON Point)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: [Number], // [longitude, latitude]
    },

    // Datos GPS
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    altitude: {
      type: Number,
      default: null,
    },
    heading: {
      type: Number,
      default: null,
    },
    speed: {
      type: Number,
      default: null,
    },

    // Actividad
    activityType: {
      type: String,
      enum: Object.values(ACTIVITY_TYPES),
      default: ACTIVITY_TYPES.UNKNOWN,
    },
    activityConfidence: {
      type: Number,
      default: 0,
    },

    // Dispositivo
    batteryLevel: {
      type: Number,
      default: null,
    },
    isCharging: {
      type: Boolean,
      default: false,
    },
    networkType: {
      type: String,
      enum: Object.values(NETWORK_TYPES),
      default: NETWORK_TYPES.UNKNOWN,
    },

    // Timestamps
    timestamp: {
      type: Date,
      required: true, // Timestamp del dispositivo
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Última actualización
    },

    // Metadata
    metadata: {
      source: {
        type: String,
        enum: ['gps', 'network', 'manual', 'background'],
        default: 'gps',
      },
      deviceId: String,
      appVersion: String,
      platform: String,
    },
  },
  {
    timestamps: false, // Usamos updatedAt custom
  }
);

// Índices
locationSnapshotSchema.index({ userId: 1 }, { unique: true });
locationSnapshotSchema.index({ organizationId: 1 });
locationSnapshotSchema.index({ location: '2dsphere' });
locationSnapshotSchema.index({ updatedAt: -1 });

// Pre-save: Sincronizar coordinates
locationSnapshotSchema.pre('save', function (next) {
  this.location.coordinates = [this.longitude, this.latitude];
  this.updatedAt = new Date();
  next();
});

// Método estático: Actualizar o crear snapshot
locationSnapshotSchema.statics.updateSnapshot = async function (locationData) {
  const { userId, organizationId } = locationData;

  return await this.findOneAndUpdate(
    { userId },
    {
      ...locationData,
      organizationId,
      updatedAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
};

// Método estático: Obtener todas las ubicaciones actuales de una organización
locationSnapshotSchema.statics.getOrganizationSnapshots = async function (
  organizationId,
  filters = {}
) {
  const query = { organizationId };

  // Filtrar por batería baja
  if (filters.lowBattery) {
    query.batteryLevel = { $lt: 20 };
  }

  // Filtrar por actividad
  if (filters.activityType) {
    query.activityType = filters.activityType;
  }

  return await this.find(query).populate('userId', 'displayName photoURL email');
};

// Método estático: Obtener snapshots cercanos a una ubicación
locationSnapshotSchema.statics.getNearby = async function (lat, lon, maxDistanceInMeters = 1000) {
  return await this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        $maxDistance: maxDistanceInMeters,
      },
    },
  }).populate('userId', 'displayName photoURL');
};

// Método estático: Contar usuarios online en una organización
locationSnapshotSchema.statics.countOnlineUsers = async function (
  organizationId,
  minutesThreshold = 5
) {
  const threshold = new Date();
  threshold.setMinutes(threshold.getMinutes() - minutesThreshold);

  return await this.countDocuments({
    organizationId,
    updatedAt: { $gte: threshold },
  });
};

module.exports = mongoose.model('LocationSnapshot', locationSnapshotSchema);
