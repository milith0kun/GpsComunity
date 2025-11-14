const mongoose = require('mongoose');
const { GEOFENCE_TYPES } = require('../utils/constants');

const geofenceSchema = new mongoose.Schema(
  {
    // Relaciones
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization is required'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },

    // Información básica
    name: {
      type: String,
      required: [true, 'Geofence name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3B82F6', // Hex color
    },

    // Geometría (GeoJSON)
    geometry: {
      type: {
        type: String,
        enum: Object.values(GEOFENCE_TYPES),
        required: true,
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
      },
      // Para círculos
      center: {
        type: [Number], // [longitude, latitude]
        default: null,
      },
      radius: {
        type: Number, // metros
        default: null,
      },
    },

    // Configuración
    config: {
      alertOnEnter: {
        type: Boolean,
        default: true,
      },
      alertOnExit: {
        type: Boolean,
        default: true,
      },
      // Usuarios permitidos (vacío = todos)
      allowedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      // Grupos permitidos (vacío = todos)
      allowedGroups: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Group',
        },
      ],
      // Programación
      schedule: {
        enabled: {
          type: Boolean,
          default: false,
        },
        days: [
          {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
        ],
        startTime: {
          type: String, // "HH:mm"
          default: '00:00',
        },
        endTime: {
          type: String,
          default: '23:59',
        },
      },
    },

    // Estadísticas
    stats: {
      totalEvents: {
        type: Number,
        default: 0,
      },
      totalEnters: {
        type: Number,
        default: 0,
      },
      totalExits: {
        type: Number,
        default: 0,
      },
      lastEventAt: {
        type: Date,
        default: null,
      },
    },

    // Estado
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Timestamps
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índices
geofenceSchema.index({ organizationId: 1, active: 1 });
geofenceSchema.index({ 'geometry.type': 1 });
geofenceSchema.index({ createdAt: -1 });

// Para geofences de tipo Polygon, crear índice geoespacial
geofenceSchema.index(
  { 'geometry.coordinates': '2dsphere' },
  {
    partialFilterExpression: { 'geometry.type': 'Polygon' },
  }
);

// Método: Verificar si está activo según horario
geofenceSchema.methods.isActiveNow = function () {
  if (!this.active) return false;
  if (!this.config.schedule.enabled) return true;

  const now = new Date();
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    now.getDay()
  ];

  // Verificar si hoy está en los días programados
  if (!this.config.schedule.days.includes(dayOfWeek)) {
    return false;
  }

  // Verificar hora
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  return (
    currentTime >= this.config.schedule.startTime && currentTime <= this.config.schedule.endTime
  );
};

// Método: Verificar si un usuario tiene acceso
geofenceSchema.methods.hasUserAccess = function (userId) {
  // Si no hay restricciones, todos tienen acceso
  if (this.config.allowedUsers.length === 0 && this.config.allowedGroups.length === 0) {
    return true;
  }

  // Verificar si el usuario está en la lista de permitidos
  if (this.config.allowedUsers.length > 0) {
    return this.config.allowedUsers.some((id) => id.toString() === userId.toString());
  }

  // TODO: Verificar si el usuario pertenece a algún grupo permitido
  return false;
};

// Método: Incrementar contador de eventos
geofenceSchema.methods.incrementEvent = async function (eventType) {
  this.stats.totalEvents += 1;
  if (eventType === 'enter') {
    this.stats.totalEnters += 1;
  } else if (eventType === 'exit') {
    this.stats.totalExits += 1;
  }
  this.stats.lastEventAt = new Date();
  await this.save();
};

// Método estático: Obtener geofences que contienen un punto
geofenceSchema.statics.findContainingPoint = async function (lat, lon, organizationId) {
  // Buscar geofences de tipo Polygon que contengan el punto
  const polygons = await this.find({
    organizationId,
    active: true,
    'geometry.type': 'Polygon',
    'geometry.coordinates': {
      $geoIntersects: {
        $geometry: {
          type: 'Point',
          coordinates: [lon, lat],
        },
      },
    },
  });

  // Buscar geofences de tipo Circle manualmente
  const circles = await this.find({
    organizationId,
    active: true,
    'geometry.type': 'Circle',
  });

  const containingCircles = circles.filter((geofence) => {
    const [centerLon, centerLat] = geofence.geometry.center;
    const distance = calculateDistance(lat, lon, centerLat, centerLon);
    return distance <= geofence.geometry.radius;
  });

  return [...polygons, ...containingCircles];
};

// Helper: Calcular distancia (Haversine)
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

module.exports = mongoose.model('Geofence', geofenceSchema);
