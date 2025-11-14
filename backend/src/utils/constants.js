/**
 * Constantes de la aplicación
 */

// Roles de usuarios en organizaciones
const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
};

// Estados de usuarios
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
};

// Estados de miembros
const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  REMOVED: 'removed',
};

// Estados de organizaciones
const ORGANIZATION_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DELETED: 'deleted',
};

// Planes de suscripción
const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  BASIC: 'basic',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

// Estados de suscripción
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
};

// Límites por plan
const PLAN_LIMITS = {
  free: {
    maxUsers: 5,
    maxGeofences: 3,
    maxGroups: 2,
    dataRetentionDays: 7,
    minTrackingInterval: 60, // segundos
    features: ['basic_tracking', 'basic_map'],
  },
  basic: {
    maxUsers: 25,
    maxGeofences: 10,
    maxGroups: 5,
    dataRetentionDays: 30,
    minTrackingInterval: 30,
    features: ['basic_tracking', 'basic_map', 'geofencing', 'alerts', 'reports_basic'],
  },
  pro: {
    maxUsers: 100,
    maxGeofences: 50,
    maxGroups: 20,
    dataRetentionDays: 90,
    minTrackingInterval: 10,
    features: [
      'basic_tracking',
      'basic_map',
      'geofencing',
      'alerts',
      'reports_advanced',
      'api_access',
      'webhooks',
    ],
  },
  enterprise: {
    maxUsers: -1, // ilimitado
    maxGeofences: -1,
    maxGroups: -1,
    dataRetentionDays: 365,
    minTrackingInterval: 5,
    features: [
      'basic_tracking',
      'basic_map',
      'geofencing',
      'alerts',
      'reports_advanced',
      'api_access',
      'webhooks',
      'custom_integrations',
      'sla',
      'dedicated_support',
    ],
  },
};

// Tipos de actividad (tracking)
const ACTIVITY_TYPES = {
  STILL: 'still',
  WALKING: 'walking',
  RUNNING: 'running',
  DRIVING: 'driving',
  CYCLING: 'cycling',
  UNKNOWN: 'unknown',
};

// Niveles de precisión de ubicación
const ACCURACY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  BEST: 'best',
};

// Tipos de red
const NETWORK_TYPES = {
  WIFI: 'wifi',
  CELLULAR_4G: '4g',
  CELLULAR_5G: '5g',
  CELLULAR_3G: '3g',
  CELLULAR_2G: '2g',
  OFFLINE: 'offline',
  UNKNOWN: 'unknown',
};

// Tipos de alerta
const ALERT_TYPES = {
  SOS: 'sos',
  GEOFENCE_ENTER: 'geofence_enter',
  GEOFENCE_EXIT: 'geofence_exit',
  BATTERY_LOW: 'battery_low',
  OFFLINE: 'offline',
  SPEED_LIMIT: 'speed_limit',
  INACTIVITY: 'inactivity',
  CUSTOM: 'custom',
};

// Severidad de alertas
const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// Estados de alertas
const ALERT_STATUS = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  DISMISSED: 'dismissed',
};

// Tipos de geofence
const GEOFENCE_TYPES = {
  POLYGON: 'Polygon',
  CIRCLE: 'Circle',
};

// Tipos de grupos
const GROUP_TYPES = {
  DEPARTMENT: 'department',
  TEAM: 'team',
  PROJECT: 'project',
  CUSTOM: 'custom',
};

// Idiomas soportados
const LANGUAGES = {
  ES: 'es',
  EN: 'en',
  PT: 'pt',
};

// Timezones comunes
const TIMEZONES = {
  LIMA: 'America/Lima',
  BOGOTA: 'America/Bogota',
  MEXICO_CITY: 'America/Mexico_City',
  SAO_PAULO: 'America/Sao_Paulo',
  BUENOS_AIRES: 'America/Argentina/Buenos_Aires',
  NEW_YORK: 'America/New_York',
  UTC: 'UTC',
};

// Códigos de error
const ERROR_CODES = {
  // Auth
  AUTH_001: 'AUTH_001', // Token no proporcionado
  AUTH_002: 'AUTH_002', // Token inválido
  AUTH_003: 'AUTH_003', // Usuario no encontrado
  AUTH_004: 'AUTH_004', // Token malformado
  AUTH_005: 'AUTH_005', // Token expirado
  AUTH_006: 'AUTH_006', // Credenciales inválidas
  AUTH_007: 'AUTH_007', // Cuenta bloqueada
  AUTH_008: 'AUTH_008', // Email no verificado

  // RBAC
  RBAC_001: 'RBAC_001', // No es miembro de la organización
  RBAC_002: 'RBAC_002', // Sin permisos para esta acción

  // Validación
  VAL_001: 'VAL_001', // Datos de entrada inválidos
  VAL_002: 'VAL_002', // Campo requerido faltante

  // Recursos
  RES_001: 'RES_001', // Recurso no encontrado
  RES_002: 'RES_002', // Recurso ya existe
  RES_003: 'RES_003', // Límite de recursos alcanzado

  // Database
  DB_001: 'DB_001', // Error de conexión
  DB_002: 'DB_002', // Error en query
  DB_003: 'DB_003', // Violación de constraint

  // Location
  LOC_001: 'LOC_001', // Error al guardar ubicación
  LOC_002: 'LOC_002', // Coordenadas inválidas
  LOC_003: 'LOC_003', // Intervalo mínimo no respetado

  // Geofence
  GEO_001: 'GEO_001', // Geometría inválida
  GEO_002: 'GEO_002', // Límite de geofences alcanzado

  // Subscription
  SUB_001: 'SUB_001', // Suscripción expirada
  SUB_002: 'SUB_002', // Límite del plan alcanzado
  SUB_003: 'SUB_003', // Upgrade requerido

  // General
  GEN_001: 'GEN_001', // Error interno del servidor
  GEN_002: 'GEN_002', // Servicio no disponible
};

// Permisos por rol (default)
const ROLE_PERMISSIONS = {
  owner: {
    canViewAllLocations: true,
    canViewLocationHistory: true,
    canManageMembers: true,
    canManageGroups: true,
    canManageGeofences: true,
    canManageSettings: true,
    canViewReports: true,
    canGenerateReports: true,
    canManageSubscription: true,
  },
  admin: {
    canViewAllLocations: true,
    canViewLocationHistory: true,
    canManageMembers: true,
    canManageGroups: true,
    canManageGeofences: true,
    canManageSettings: true,
    canViewReports: true,
    canGenerateReports: true,
    canManageSubscription: false,
  },
  manager: {
    canViewAllLocations: true,
    canViewLocationHistory: false,
    canManageMembers: false,
    canManageGroups: true,
    canManageGeofences: true,
    canManageSettings: false,
    canViewReports: true,
    canGenerateReports: false,
    canManageSubscription: false,
  },
  member: {
    canViewAllLocations: false,
    canViewLocationHistory: false,
    canManageMembers: false,
    canManageGroups: false,
    canManageGeofences: false,
    canManageSettings: false,
    canViewReports: false,
    canGenerateReports: false,
    canManageSubscription: false,
  },
};

module.exports = {
  ROLES,
  USER_STATUS,
  MEMBER_STATUS,
  ORGANIZATION_STATUS,
  SUBSCRIPTION_PLANS,
  SUBSCRIPTION_STATUS,
  PLAN_LIMITS,
  ACTIVITY_TYPES,
  ACCURACY_LEVELS,
  NETWORK_TYPES,
  ALERT_TYPES,
  ALERT_SEVERITY,
  ALERT_STATUS,
  GEOFENCE_TYPES,
  GROUP_TYPES,
  LANGUAGES,
  TIMEZONES,
  ERROR_CODES,
  ROLE_PERMISSIONS,
};
