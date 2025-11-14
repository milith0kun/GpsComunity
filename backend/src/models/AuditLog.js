const mongoose = require('mongoose');

/**
 * AuditLog - Registro de auditoría para cumplimiento y seguridad
 * Registra todas las acciones importantes en el sistema
 */
const auditLogSchema = new mongoose.Schema(
  {
    // Relaciones
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Acción realizada
    action: {
      type: String,
      required: true,
      index: true,
      // Ejemplos: 'user.login', 'organization.create', 'member.update', etc.
    },

    // Categoría de la acción
    category: {
      type: String,
      enum: [
        'auth', // Autenticación
        'user', // Gestión de usuarios
        'organization', // Gestión de organizaciones
        'member', // Gestión de miembros
        'group', // Gestión de grupos
        'geofence', // Gestión de geofences
        'location', // Tracking de ubicaciones
        'alert', // Alertas
        'settings', // Configuración
        'subscription', // Suscripciones
        'security', // Eventos de seguridad
        'api', // Llamadas API
        'other',
      ],
      required: true,
      index: true,
    },

    // Resultado de la acción
    result: {
      type: String,
      enum: ['success', 'failure', 'error'],
      default: 'success',
      index: true,
    },

    // Descripción
    description: {
      type: String,
      required: true,
    },

    // Datos relacionados
    metadata: {
      // ID del recurso afectado
      resourceId: {
        type: String,
        default: null,
      },
      resourceType: {
        type: String,
        default: null,
      },
      // Cambios realizados (antes/después)
      changes: {
        before: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
        after: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },
      // Datos adicionales
      extra: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },

    // Información de la request
    request: {
      ip: {
        type: String,
        default: null,
      },
      userAgent: {
        type: String,
        default: null,
      },
      method: {
        type: String,
        default: null,
      },
      endpoint: {
        type: String,
        default: null,
      },
    },

    // Severidad (para eventos de seguridad)
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },

    // Timestamp
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false, // Usamos timestamp custom
  }
);

// Índices
auditLogSchema.index({ organizationId: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ category: 1, timestamp: -1 });
auditLogSchema.index({ result: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL Index: Auto-eliminar logs antiguos (365 días)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Método estático: Registrar acción
auditLogSchema.statics.log = async function (data) {
  try {
    await this.create(data);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // No lanzar error para no afectar la operación principal
  }
};

// Método estático: Registrar login exitoso
auditLogSchema.statics.logLogin = async function (userId, organizationId, req) {
  return await this.log({
    organizationId,
    userId,
    action: 'user.login',
    category: 'auth',
    result: 'success',
    description: 'Usuario inició sesión',
    request: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });
};

// Método estático: Registrar intento de login fallido
auditLogSchema.statics.logFailedLogin = async function (email, req) {
  return await this.log({
    organizationId: null,
    userId: null,
    action: 'user.login.failed',
    category: 'security',
    result: 'failure',
    description: `Intento de login fallido para ${email}`,
    severity: 'medium',
    request: {
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  });
};

// Método estático: Registrar cambio en recurso
auditLogSchema.statics.logResourceChange = async function (
  userId,
  organizationId,
  action,
  resourceType,
  resourceId,
  before,
  after,
  req
) {
  return await this.log({
    organizationId,
    userId,
    action,
    category: resourceType,
    result: 'success',
    description: `${resourceType} ${action.split('.')[1]}`,
    metadata: {
      resourceId: resourceId.toString(),
      resourceType,
      changes: { before, after },
    },
    request: {
      ip: req?.ip,
      userAgent: req?.get('user-agent'),
      method: req?.method,
      endpoint: req?.originalUrl,
    },
  });
};

// Método estático: Obtener logs de una organización
auditLogSchema.statics.getOrganizationLogs = async function (
  organizationId,
  filters = {},
  limit = 100,
  skip = 0
) {
  const query = { organizationId };

  if (filters.category) query.category = filters.category;
  if (filters.action) query.action = filters.action;
  if (filters.userId) query.userId = filters.userId;
  if (filters.result) query.result = filters.result;

  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = new Date(filters.startDate);
    if (filters.endDate) query.timestamp.$lte = new Date(filters.endDate);
  }

  return await this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'displayName email');
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
