const mongoose = require('mongoose');
const { ACTIVITY_TYPES, NETWORK_TYPES } = require('../utils/constants');

const locationSchema = new mongoose.Schema(
  {
    // Relaciones
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
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
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: [true, 'Coordinates are required'],
        validate: {
          validator: function (coords) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: 'Invalid coordinates',
        },
      },
    },

    // Datos GPS detallados
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: -180,
      max: 180,
    },
    accuracy: {
      type: Number,
      required: [true, 'Accuracy is required'],
      min: 0,
    },
    altitude: {
      type: Number,
      default: null,
    },
    altitudeAccuracy: {
      type: Number,
      default: null,
    },
    heading: {
      type: Number,
      default: null,
      min: 0,
      max: 360,
    },
    speed: {
      type: Number,
      default: null,
      min: 0,
    },
    speedAccuracy: {
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
      min: 0,
      max: 100,
    },

    // Información del dispositivo
    batteryLevel: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
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
      required: [true, 'Timestamp is required'], // Timestamp del dispositivo
      index: true,
    },
    serverTimestamp: {
      type: Date,
      default: Date.now, // Timestamp del servidor
      index: true,
    },

    // Metadatos
    metadata: {
      source: {
        type: String,
        enum: ['gps', 'network', 'manual', 'background'],
        default: 'gps',
      },
      deviceId: {
        type: String,
        default: null,
      },
      appVersion: {
        type: String,
        default: null,
      },
      platform: {
        type: String,
        enum: ['android', 'ios', 'web'],
        default: null,
      },
    },
  },
  {
    timestamps: false, // Usamos timestamp y serverTimestamp custom
  }
);

// Índices críticos
locationSchema.index({ location: '2dsphere' }); // Para búsquedas geoespaciales
locationSchema.index({ organizationId: 1, serverTimestamp: -1 });
locationSchema.index({ userId: 1, serverTimestamp: -1 });
locationSchema.index({ organizationId: 1, userId: 1, serverTimestamp: -1 });
locationSchema.index({ timestamp: 1 });

// TTL Index: Auto-eliminar después de X días (configurable)
const ttlSeconds = parseInt(process.env.LOCATION_HISTORY_TTL) || 7776000; // 90 días por defecto
locationSchema.index({ serverTimestamp: 1 }, { expireAfterSeconds: ttlSeconds });

// Pre-save: Sincronizar location.coordinates con lat/lng
locationSchema.pre('save', function (next) {
  this.location.coordinates = [this.longitude, this.latitude];
  next();
});

// Método estático: Obtener última ubicación de un usuario
locationSchema.statics.getLastLocation = async function (userId) {
  return await this.findOne({ userId }).sort({ serverTimestamp: -1 });
};

// Método estático: Obtener historial de un usuario
locationSchema.statics.getHistory = async function (
  userId,
  startDate,
  endDate,
  limit = 100
) {
  const query = {
    userId,
  };

  if (startDate || endDate) {
    query.serverTimestamp = {};
    if (startDate) query.serverTimestamp.$gte = new Date(startDate);
    if (endDate) query.serverTimestamp.$lte = new Date(endDate);
  }

  return await this.find(query)
    .sort({ serverTimestamp: -1 })
    .limit(limit);
};

// Método estático: Obtener ubicaciones cercanas
locationSchema.statics.getNearby = async function (lat, lon, maxDistanceInMeters = 1000) {
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
  });
};

// Método estático: Contar ubicaciones por usuario en un rango
locationSchema.statics.countByUser = async function (userId, startDate, endDate) {
  const query = { userId };

  if (startDate || endDate) {
    query.serverTimestamp = {};
    if (startDate) query.serverTimestamp.$gte = new Date(startDate);
    if (endDate) query.serverTimestamp.$lte = new Date(endDate);
  }

  return await this.countDocuments(query);
};

// Método: Calcular velocidad desde la ubicación anterior
locationSchema.methods.calculateSpeed = async function () {
  const previousLocation = await this.constructor
    .findOne({
      userId: this.userId,
      serverTimestamp: { $lt: this.serverTimestamp },
    })
    .sort({ serverTimestamp: -1 });

  if (!previousLocation) return 0;

  // Calcular distancia usando fórmula de Haversine
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = (previousLocation.latitude * Math.PI) / 180;
  const φ2 = (this.latitude * Math.PI) / 180;
  const Δφ = ((this.latitude - previousLocation.latitude) * Math.PI) / 180;
  const Δλ = ((this.longitude - previousLocation.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // metros

  // Calcular tiempo en segundos
  const timeDiff = (this.serverTimestamp - previousLocation.serverTimestamp) / 1000;

  if (timeDiff === 0) return 0;

  // Velocidad en m/s
  return distance / timeDiff;
};

module.exports = mongoose.model('Location', locationSchema);
