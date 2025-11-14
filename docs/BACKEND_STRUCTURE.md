# 🚀 GPS Community - Estructura del Backend

## 📋 Índice

1. [Ubicación del Backend](#ubicación-del-backend)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Base de Datos MongoDB](#base-de-datos-mongodb)
5. [Modelos y Esquemas](#modelos-y-esquemas)
6. [API Endpoints](#api-endpoints)
7. [Autenticación y Autorización](#autenticación-y-autorización)
8. [WebSocket para Tiempo Real](#websocket-para-tiempo-real)
9. [Configuración Inicial](#configuración-inicial)
10. [Deployment](#deployment)

---

## 📍 Ubicación del Backend

### Opción 1: Monorepo (Recomendado para MVP)

Crear una carpeta `backend/` en el proyecto actual:

```
GpsComunity/
├── lib/                    # Flutter app (Frontend)
├── android/
├── ios/
├── backend/               # ⭐ Node.js Backend
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── ...
├── docs/
├── README.md
└── pubspec.yaml
```

**Ventajas:**
- ✅ Un solo repositorio para frontend y backend
- ✅ Fácil coordinación de cambios
- ✅ Documentación centralizada
- ✅ Ideal para equipos pequeños

**Desventajas:**
- ❌ Repositorio puede crecer mucho
- ❌ CI/CD más complejo

### Opción 2: Repositorios Separados (Recomendado para Producción)

Crear un nuevo repositorio: `GpsComunity-Backend`

```
GpsComunity/              # Repo 1: Frontend
└── lib/

GpsComunity-Backend/      # Repo 2: Backend
├── src/
├── tests/
└── ...
```

**Ventajas:**
- ✅ Separación de responsabilidades
- ✅ Deployments independientes
- ✅ Equipos pueden trabajar independientemente
- ✅ Mejor escalabilidad

**Desventajas:**
- ❌ Más complejo de sincronizar
- ❌ Dos repositorios que mantener

### 🎯 Recomendación Final

**Para este proyecto: Opción 1 (Monorepo)**

Razones:
- El frontend ya está bien estructurado
- Facilita el desarrollo inicial
- Puedes migrar a repos separados más adelante si es necesario

---

## 🛠️ Stack Tecnológico

### Backend Core
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js 4.x
- **Lenguaje:** JavaScript (ES6+) o TypeScript (Recomendado)

### Base de Datos
- **Principal:** MongoDB Atlas (ya configurado)
- **ODM:** Mongoose 7.x
- **Cache:** Redis (opcional, para sesiones y rate limiting)

### Autenticación
- **JWT:** jsonwebtoken
- **Firebase Admin SDK:** Para integración con Flutter
- **Bcrypt:** Para hash de passwords

### Tiempo Real
- **WebSocket:** socket.io o ws
- **Alternativa:** Server-Sent Events (SSE)

### Validación y Seguridad
- **Validación:** express-validator o Joi
- **Rate Limiting:** express-rate-limit
- **CORS:** cors
- **Helmet:** Para headers de seguridad
- **Sanitización:** express-mongo-sanitize

### Logging y Monitoreo
- **Logger:** Winston o Pino
- **Monitoreo:** PM2 (producción)
- **Error Tracking:** Sentry (opcional)

### Testing
- **Framework:** Jest
- **Mocking:** Supertest (para APIs)
- **Coverage:** Istanbul

### Documentación
- **API Docs:** Swagger/OpenAPI

---

## 📁 Estructura del Proyecto

### Estructura Completa

```
backend/
├── src/
│   ├── config/                    # Configuración de la aplicación
│   │   ├── database.js           # Conexión a MongoDB
│   │   ├── redis.js              # Configuración de Redis (opcional)
│   │   ├── firebase.js           # Firebase Admin SDK
│   │   ├── environment.js        # Variables de entorno
│   │   └── swagger.js            # Configuración de Swagger
│   │
│   ├── models/                    # Esquemas de MongoDB (Mongoose)
│   │   ├── User.js
│   │   ├── Organization.js
│   │   ├── Member.js
│   │   ├── Location.js
│   │   ├── Group.js
│   │   ├── Geofence.js
│   │   ├── Alert.js
│   │   ├── Report.js
│   │   └── AuditLog.js
│   │
│   ├── controllers/               # Controladores (lógica de negocio)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── organization.controller.js
│   │   ├── member.controller.js
│   │   ├── tracking.controller.js
│   │   ├── group.controller.js
│   │   ├── geofence.controller.js
│   │   ├── alert.controller.js
│   │   ├── report.controller.js
│   │   └── dashboard.controller.js
│   │
│   ├── routes/                    # Rutas de la API
│   │   ├── index.js              # Router principal
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── organization.routes.js
│   │   ├── member.routes.js
│   │   ├── tracking.routes.js
│   │   ├── group.routes.js
│   │   ├── geofence.routes.js
│   │   ├── alert.routes.js
│   │   ├── report.routes.js
│   │   └── dashboard.routes.js
│   │
│   ├── middleware/                # Middlewares
│   │   ├── auth.middleware.js    # Verificación de JWT
│   │   ├── rbac.middleware.js    # Control de acceso basado en roles
│   │   ├── validate.middleware.js # Validación de datos
│   │   ├── rateLimit.middleware.js
│   │   ├── error.middleware.js   # Manejo de errores
│   │   └── logger.middleware.js  # Logging de requests
│   │
│   ├── services/                  # Servicios (lógica de negocio compleja)
│   │   ├── auth.service.js       # Autenticación, tokens
│   │   ├── location.service.js   # Procesamiento de ubicaciones
│   │   ├── geofence.service.js   # Detección de entrada/salida
│   │   ├── notification.service.js # Envío de notificaciones
│   │   ├── email.service.js      # Envío de emails
│   │   ├── report.service.js     # Generación de reportes
│   │   └── subscription.service.js # Gestión de suscripciones
│   │
│   ├── utils/                     # Utilidades
│   │   ├── logger.js             # Configuración de Winston/Pino
│   │   ├── validators.js         # Validadores personalizados
│   │   ├── geospatial.js         # Funciones geoespaciales
│   │   ├── dateHelpers.js        # Helpers de fechas
│   │   ├── responseHandler.js    # Formato estándar de respuestas
│   │   └── constants.js          # Constantes de la app
│   │
│   ├── websocket/                 # Servidor WebSocket
│   │   ├── index.js              # Configuración principal
│   │   ├── locationSocket.js     # Socket de ubicaciones
│   │   ├── handlers/             # Manejadores de eventos
│   │   │   ├── connection.handler.js
│   │   │   ├── location.handler.js
│   │   │   └── subscription.handler.js
│   │   └── middleware/
│   │       └── socketAuth.middleware.js
│   │
│   ├── jobs/                      # Jobs programados (cron)
│   │   ├── cleanup.job.js        # Limpieza de datos antiguos
│   │   ├── subscription.job.js   # Verificación de suscripciones
│   │   └── report.job.js         # Generación automática de reportes
│   │
│   ├── validators/                # Esquemas de validación
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── organization.validator.js
│   │   ├── location.validator.js
│   │   └── ...
│   │
│   └── app.js                     # Configuración de Express
│
├── tests/                         # Tests
│   ├── unit/                     # Tests unitarios
│   │   ├── services/
│   │   ├── controllers/
│   │   └── utils/
│   ├── integration/              # Tests de integración
│   │   ├── auth.test.js
│   │   ├── tracking.test.js
│   │   └── ...
│   └── setup.js                  # Configuración de tests
│
├── scripts/                       # Scripts de utilidad
│   ├── seed.js                   # Poblar DB con datos de prueba
│   ├── migrate.js                # Migraciones
│   └── cleanup.js                # Limpieza de datos
│
├── docs/                          # Documentación del backend
│   ├── API.md                    # Documentación de endpoints
│   ├── DEPLOYMENT.md             # Guía de deployment
│   └── DEVELOPMENT.md            # Guía de desarrollo
│
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore
├── .eslintrc.js                  # Configuración de ESLint
├── .prettierrc                   # Configuración de Prettier
├── jest.config.js                # Configuración de Jest
├── package.json
├── package-lock.json
├── README.md
└── server.js                      # Punto de entrada de la aplicación
```

---

## 🗄️ Base de Datos MongoDB

### Conexión a MongoDB Atlas

Ya tienes configurado MongoDB Atlas:
- **Cluster:** Cluster0
- **Usuario:** milith0dev_db_user
- **URI:** `mongodb+srv://milith0dev_db_user:1997281qA@cluster0.cpt00yd.mongodb.net/?appName=Cluster0`

### Configuración de Base de Datos

#### 1. Bases de Datos por Ambiente

```javascript
// config/database.js
const DATABASES = {
  development: 'gps_community_dev',
  test: 'gps_community_test',
  staging: 'gps_community_staging',
  production: 'gps_community_prod'
};
```

#### 2. Colecciones Principales

```
gps_community_prod/
├── users                    # Usuarios de la aplicación
├── organizations           # Organizaciones
├── members                 # Relación usuario-organización
├── groups                  # Grupos dentro de organizaciones
├── location_history        # Historial de ubicaciones (TTL 90 días)
├── location_snapshots      # Última ubicación de cada usuario
├── geofences              # Geovallas
├── geofence_events        # Eventos de entrada/salida
├── alerts                 # Alertas y notificaciones
├── reports                # Reportes generados
├── subscriptions          # Suscripciones activas
├── audit_logs            # Logs de auditoría
└── sessions              # Sesiones activas (TTL 30 días)
```

#### 3. Índices Críticos

**Geoespaciales (2dsphere):**
```javascript
// Para búsquedas de ubicación
location_history: { location: '2dsphere' }
location_snapshots: { location: '2dsphere' }
geofences: { geometry: '2dsphere' }
```

**Compuestos:**
```javascript
// Para queries frecuentes
location_history: { organizationId: 1, timestamp: -1 }
location_history: { userId: 1, timestamp: -1 }
members: { organizationId: 1, userId: 1 }
geofence_events: { organizationId: 1, timestamp: -1 }
```

**TTL (Time To Live):**
```javascript
// Auto-eliminar datos antiguos
location_history: { createdAt: 1 }, { expireAfterSeconds: 7776000 } // 90 días
sessions: { expiresAt: 1 }, { expireAfterSeconds: 0 }
```

**Únicos:**
```javascript
users: { email: 1 }, { unique: true }
organizations: { slug: 1 }, { unique: true }
members: { organizationId: 1, userId: 1 }, { unique: true }
```

---

## 📊 Modelos y Esquemas

### 1. User Schema

```javascript
// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Identificación
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true, // Para usuarios que no usan Firebase
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },

  // Información personal
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    default: null
  },

  // Autenticación local (si no usa Firebase)
  password: {
    type: String,
    select: false // No incluir en queries por defecto
  },

  // Verificación
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },

  // Seguridad
  lastLoginAt: {
    type: Date,
    default: null
  },
  lastPasswordChange: {
    type: Date,
    default: null
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
  },

  // Preferencias
  preferences: {
    language: {
      type: String,
      enum: ['es', 'en', 'pt'],
      default: 'es'
    },
    timezone: {
      type: String,
      default: 'America/Lima'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },

  // Estado
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active',
    index: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ firebaseUid: 1 }, { unique: true, sparse: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1 });

// Virtual: memberships
userSchema.virtual('memberships', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'userId'
});

module.exports = mongoose.model('User', userSchema);
```

### 2. Organization Schema

```javascript
// src/models/Organization.js
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  // Información básica
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  logoURL: {
    type: String,
    default: null
  },

  // Propietario
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Suscripción
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'pro', 'enterprise'],
      default: 'free',
      index: true
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'expired', 'cancelled'],
      default: 'trial',
      index: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 días
    },
    maxUsers: {
      type: Number,
      default: 5 // Plan free
    },
    stripeCustomerId: {
      type: String,
      default: null
    },
    stripeSubscriptionId: {
      type: String,
      default: null
    }
  },

  // Configuración de tracking
  settings: {
    tracking: {
      defaultInterval: {
        type: Number,
        default: 60, // segundos
        min: 10,
        max: 3600
      },
      defaultAccuracy: {
        type: String,
        enum: ['low', 'medium', 'high', 'best'],
        default: 'high'
      },
      enableBackgroundTracking: {
        type: Boolean,
        default: true
      },
      dataRetentionDays: {
        type: Number,
        default: 90,
        min: 7,
        max: 365
      }
    },
    geofencing: {
      enabled: {
        type: Boolean,
        default: true
      },
      alertOnEnter: {
        type: Boolean,
        default: true
      },
      alertOnExit: {
        type: Boolean,
        default: true
      }
    },
    alerts: {
      sosEnabled: {
        type: Boolean,
        default: true
      },
      batteryLowThreshold: {
        type: Number,
        default: 15,
        min: 5,
        max: 30
      },
      inactivityAlertMinutes: {
        type: Number,
        default: 60,
        min: 15
      }
    },
    privacy: {
      allowHistoryAccess: {
        type: Boolean,
        default: true
      },
      requireLocationConsent: {
        type: Boolean,
        default: true
      },
      showRealNames: {
        type: Boolean,
        default: true
      }
    }
  },

  // Estadísticas
  stats: {
    totalMembers: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    },
    totalGroups: {
      type: Number,
      default: 0
    },
    totalGeofences: {
      type: Number,
      default: 0
    }
  },

  // Estado
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active',
    index: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices
organizationSchema.index({ slug: 1 }, { unique: true });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });
organizationSchema.index({ status: 1 });

// Virtuals
organizationSchema.virtual('members', {
  ref: 'Member',
  localField: '_id',
  foreignField: 'organizationId'
});

organizationSchema.virtual('groups', {
  ref: 'Group',
  localField: '_id',
  foreignField: 'organizationId'
});

module.exports = mongoose.model('Organization', organizationSchema);
```

### 3. Member Schema

```javascript
// src/models/Member.js
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // Relaciones
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Rol y permisos
  role: {
    type: String,
    enum: ['owner', 'admin', 'manager', 'member'],
    default: 'member',
    index: true
  },

  // Permisos específicos (override del rol)
  permissions: {
    canViewAllLocations: { type: Boolean, default: null }, // null = usar default del rol
    canViewLocationHistory: { type: Boolean, default: null },
    canManageMembers: { type: Boolean, default: null },
    canManageGroups: { type: Boolean, default: null },
    canManageGeofences: { type: Boolean, default: null },
    canManageSettings: { type: Boolean, default: null },
    canViewReports: { type: Boolean, default: null },
    canGenerateReports: { type: Boolean, default: null },
    canManageSubscription: { type: Boolean, default: null }
  },

  // Tracking
  tracking: {
    enabled: {
      type: Boolean,
      default: false
    },
    consentGiven: {
      type: Boolean,
      default: false
    },
    consentDate: {
      type: Date,
      default: null
    },
    lastLocationAt: {
      type: Date,
      default: null
    },
    isOnline: {
      type: Boolean,
      default: false
    }
  },

  // Información adicional
  displayName: {
    type: String,
    default: null // Si null, usar el del User
  },
  position: {
    type: String,
    default: null // Cargo/puesto
  },
  department: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },

  // Grupos a los que pertenece
  groupIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],

  // Invitación
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  invitedAt: {
    type: Date,
    default: null
  },
  inviteAcceptedAt: {
    type: Date,
    default: null
  },

  // Estado
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'removed'],
    default: 'pending',
    index: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  removedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices
memberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });
memberSchema.index({ organizationId: 1, status: 1 });
memberSchema.index({ userId: 1, status: 1 });
memberSchema.index({ role: 1 });

// Método para verificar permisos
memberSchema.methods.hasPermission = function(permission) {
  // Si el permiso está explícitamente configurado, usar ese valor
  if (this.permissions[permission] !== null) {
    return this.permissions[permission];
  }

  // Si no, usar los defaults del rol
  const rolePermissions = {
    owner: {
      canViewAllLocations: true,
      canViewLocationHistory: true,
      canManageMembers: true,
      canManageGroups: true,
      canManageGeofences: true,
      canManageSettings: true,
      canViewReports: true,
      canGenerateReports: true,
      canManageSubscription: true
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
      canManageSubscription: false
    },
    manager: {
      canViewAllLocations: true,
      canViewLocationHistory: false, // Solo últimos 7 días
      canManageMembers: false,
      canManageGroups: true,
      canManageGeofences: true,
      canManageSettings: false,
      canViewReports: true,
      canGenerateReports: false,
      canManageSubscription: false
    },
    member: {
      canViewAllLocations: false, // Solo su grupo
      canViewLocationHistory: false,
      canManageMembers: false,
      canManageGroups: false,
      canManageGeofences: false,
      canManageSettings: false,
      canViewReports: false,
      canGenerateReports: false,
      canManageSubscription: false
    }
  };

  return rolePermissions[this.role]?.[permission] || false;
};

module.exports = mongoose.model('Member', memberSchema);
```

### 4. Location Schema (El más crítico)

```javascript
// src/models/Location.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  // Relaciones
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },

  // Ubicación geoespacial
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 &&
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },

  // Datos GPS detallados
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0
  },
  altitude: {
    type: Number,
    default: null
  },
  altitudeAccuracy: {
    type: Number,
    default: null
  },
  heading: {
    type: Number,
    default: null,
    min: 0,
    max: 360
  },
  speed: {
    type: Number,
    default: null,
    min: 0
  },
  speedAccuracy: {
    type: Number,
    default: null
  },

  // Actividad
  activityType: {
    type: String,
    enum: ['still', 'walking', 'running', 'driving', 'cycling', 'unknown'],
    default: 'unknown'
  },
  activityConfidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Información del dispositivo
  batteryLevel: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  isCharging: {
    type: Boolean,
    default: false
  },
  networkType: {
    type: String,
    enum: ['wifi', '4g', '5g', '3g', '2g', 'offline', 'unknown'],
    default: 'unknown'
  },

  // Timestamps
  timestamp: {
    type: Date,
    required: true, // Timestamp del dispositivo
    index: true
  },
  serverTimestamp: {
    type: Date,
    default: Date.now, // Timestamp del servidor
    index: true
  },

  // Metadatos
  metadata: {
    source: {
      type: String,
      enum: ['gps', 'network', 'manual', 'background'],
      default: 'gps'
    },
    deviceId: {
      type: String,
      default: null
    },
    appVersion: {
      type: String,
      default: null
    }
  }
}, {
  timestamps: false // Usamos timestamp y serverTimestamp custom
});

// Índices críticos
locationSchema.index({ location: '2dsphere' }); // Para búsquedas geoespaciales
locationSchema.index({ organizationId: 1, serverTimestamp: -1 });
locationSchema.index({ userId: 1, serverTimestamp: -1 });
locationSchema.index({ organizationId: 1, userId: 1, serverTimestamp: -1 });

// TTL Index: Auto-eliminar después de 90 días (configurable por org)
locationSchema.index(
  { serverTimestamp: 1 },
  { expireAfterSeconds: 7776000 } // 90 días
);

// Pre-save: Sincronizar location.coordinates con lat/lng
locationSchema.pre('save', function(next) {
  this.location.coordinates = [this.longitude, this.latitude];
  next();
});

module.exports = mongoose.model('Location', locationSchema);
```

### 5. LocationSnapshot Schema (Última ubicación)

```javascript
// src/models/LocationSnapshot.js
const mongoose = require('mongoose');

// Similar a Location pero solo guarda la última ubicación de cada usuario
const locationSnapshotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Solo UNA ubicación por usuario
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },

  // Mismos campos que Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number] // [longitude, latitude]
  },

  latitude: Number,
  longitude: Number,
  accuracy: Number,
  altitude: Number,
  heading: Number,
  speed: Number,
  activityType: String,
  batteryLevel: Number,
  isCharging: Boolean,

  timestamp: Date,
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índices
locationSnapshotSchema.index({ userId: 1 }, { unique: true });
locationSnapshotSchema.index({ organizationId: 1 });
locationSnapshotSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LocationSnapshot', locationSnapshotSchema);
```

### 6. Geofence Schema

```javascript
// src/models/Geofence.js
const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
  // Relaciones
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Información básica
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  color: {
    type: String,
    default: '#3B82F6' // Hex color
  },

  // Geometría (GeoJSON)
  geometry: {
    type: {
      type: String,
      enum: ['Polygon', 'Circle'],
      required: true
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    // Para círculos
    center: {
      type: [Number], // [longitude, latitude]
      default: null
    },
    radius: {
      type: Number, // metros
      default: null
    }
  },

  // Configuración
  config: {
    alertOnEnter: {
      type: Boolean,
      default: true
    },
    alertOnExit: {
      type: Boolean,
      default: true
    },
    allowedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedGroups: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group'
    }],
    schedule: {
      enabled: {
        type: Boolean,
        default: false
      },
      days: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      }],
      startTime: {
        type: String, // "HH:mm"
        default: '00:00'
      },
      endTime: {
        type: String,
        default: '23:59'
      }
    }
  },

  // Estado
  active: {
    type: Boolean,
    default: true,
    index: true
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
geofenceSchema.index({ organizationId: 1, active: 1 });
geofenceSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Geofence', geofenceSchema);
```

### 7. Alert Schema

```javascript
// src/models/Alert.js
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  // Relaciones
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Tipo de alerta
  type: {
    type: String,
    enum: [
      'sos',
      'geofence_enter',
      'geofence_exit',
      'battery_low',
      'offline',
      'speed_limit',
      'inactivity',
      'custom'
    ],
    required: true,
    index: true
  },

  // Severidad
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info',
    index: true
  },

  // Contenido
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },

  // Datos relacionados
  relatedData: {
    geofenceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Geofence',
      default: null
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number]
    }
  },

  // Estado
  status: {
    type: String,
    enum: ['new', 'acknowledged', 'resolved', 'dismissed'],
    default: 'new',
    index: true
  },
  acknowledgedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  acknowledgedAt: {
    type: Date,
    default: null
  },

  // Notificaciones enviadas
  notificationsSent: {
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false },
    sms: { type: Boolean, default: false }
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices
alertSchema.index({ organizationId: 1, createdAt: -1 });
alertSchema.index({ userId: 1, createdAt: -1 });
alertSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
```

---

## 🔌 API Endpoints

### Estructura Base de Respuestas

```javascript
// Success
{
  "success": true,
  "data": { /* datos */ },
  "message": "Operación exitosa",
  "timestamp": "2024-11-14T10:30:45.123Z"
}

// Error
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Token inválido",
    "field": "authorization",
    "details": {}
  },
  "timestamp": "2024-11-14T10:30:45.123Z"
}

// Con paginación
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 1. Autenticación (/api/v1/auth)

```
POST   /auth/register
Body: { email, password, displayName }
Response: { accessToken, refreshToken, user }

POST   /auth/login
Body: { email, password }
Response: { accessToken, refreshToken, user }

POST   /auth/refresh-token
Body: { refreshToken }
Response: { accessToken, refreshToken }

POST   /auth/logout
Headers: Authorization: Bearer {token}
Response: { message }

GET    /auth/me
Headers: Authorization: Bearer {token}
Response: { user }

POST   /auth/forgot-password
Body: { email }
Response: { message }

POST   /auth/reset-password
Body: { token, newPassword }
Response: { message }

POST   /auth/verify-email
Body: { token }
Response: { message }

POST   /auth/firebase-login
Body: { firebaseToken }
Response: { accessToken, refreshToken, user }
```

### 2. Usuarios (/api/v1/users)

```
GET    /users
Query: page, limit, search, status
Headers: Authorization
Response: { users[], pagination }

GET    /users/:id
Headers: Authorization
Response: { user }

PATCH  /users/:id
Headers: Authorization
Body: { displayName?, photoURL?, phone?, preferences? }
Response: { user }

DELETE /users/:id
Headers: Authorization
Response: { message }

POST   /users/:id/upload-photo
Headers: Authorization, Content-Type: multipart/form-data
Body: FormData { photo: File }
Response: { photoURL }

GET    /users/:id/preferences
Headers: Authorization
Response: { preferences }

PATCH  /users/:id/preferences
Headers: Authorization
Body: { language?, timezone?, notifications? }
Response: { preferences }
```

### 3. Organizaciones (/api/v1/organizations)

```
GET    /organizations
Query: page, limit, search
Headers: Authorization
Response: { organizations[], pagination }

POST   /organizations
Headers: Authorization
Body: { name, description?, settings? }
Response: { organization }

GET    /organizations/:id
Headers: Authorization
Response: { organization }

PATCH  /organizations/:id
Headers: Authorization
Body: { name?, description?, logoURL?, settings? }
Response: { organization }

DELETE /organizations/:id
Headers: Authorization
Response: { message }

GET    /organizations/:id/settings
Headers: Authorization
Response: { settings }

PATCH  /organizations/:id/settings
Headers: Authorization
Body: { tracking?, geofencing?, alerts?, privacy? }
Response: { settings }

GET    /organizations/:id/subscription
Headers: Authorization
Response: { subscription }

PATCH  /organizations/:id/subscription
Headers: Authorization
Body: { plan }
Response: { subscription }
```

### 4. Miembros (/api/v1/organizations/:orgId/members)

```
GET    /organizations/:orgId/members
Query: page, limit, role, status, groupId
Headers: Authorization
Response: { members[], pagination }

POST   /organizations/:orgId/members
Headers: Authorization
Body: { email, role?, displayName? }
Response: { member, inviteUrl }

GET    /organizations/:orgId/members/:memberId
Headers: Authorization
Response: { member }

PATCH  /organizations/:orgId/members/:memberId
Headers: Authorization
Body: { role?, permissions?, displayName?, position?, groupIds? }
Response: { member }

DELETE /organizations/:orgId/members/:memberId
Headers: Authorization
Response: { message }

PATCH  /organizations/:orgId/members/:memberId/tracking-status
Headers: Authorization
Body: { enabled, consentGiven? }
Response: { tracking }

GET    /organizations/:orgId/members/:memberId/location
Headers: Authorization
Response: { location }
```

### 5. Tracking (/api/v1/locations)

**⚠️ CRÍTICO: Este es el endpoint más usado (miles de requests/min)**

```
POST   /locations
Headers: Authorization
Body: LocationData (ver modelo Location)
Response: { message, locationId }

POST   /locations/batch
Headers: Authorization
Body: { locations: LocationData[] }
Response: { message, insertedCount, failedCount }

GET    /locations/current/:userId
Headers: Authorization
Response: { location }

GET    /locations/history/:userId
Query: startDate, endDate, limit, page
Headers: Authorization
Response: { locations[], pagination }

GET    /organizations/:orgId/locations/live
Headers: Authorization
Response: { locations[] } // Últimas ubicaciones de todos

GET    /organizations/:orgId/locations/history
Query: userId?, startDate, endDate, limit, page
Headers: Authorization
Response: { locations[], pagination }

GET    /organizations/:orgId/locations/heatmap
Query: startDate, endDate, bounds
Headers: Authorization
Response: { points: { lat, lng, weight }[] }
```

### 6. Geofences (/api/v1/organizations/:orgId/geofences)

```
GET    /organizations/:orgId/geofences
Query: page, limit, active
Headers: Authorization
Response: { geofences[], pagination }

POST   /organizations/:orgId/geofences
Headers: Authorization
Body: { name, description, geometry, config }
Response: { geofence }

GET    /organizations/:orgId/geofences/:geofenceId
Headers: Authorization
Response: { geofence }

PATCH  /organizations/:orgId/geofences/:geofenceId
Headers: Authorization
Body: { name?, geometry?, config?, active? }
Response: { geofence }

DELETE /organizations/:orgId/geofences/:geofenceId
Headers: Authorization
Response: { message }

GET    /organizations/:orgId/geofences/:geofenceId/events
Query: startDate, endDate, eventType, page, limit
Headers: Authorization
Response: { events[], pagination }
```

### 7. Alertas (/api/v1/alerts)

```
GET    /organizations/:orgId/alerts
Query: type, severity, status, page, limit
Headers: Authorization
Response: { alerts[], pagination }

POST   /alerts/sos
Headers: Authorization
Body: { location, message? }
Response: { alert }

GET    /alerts/:alertId
Headers: Authorization
Response: { alert }

PATCH  /alerts/:alertId/acknowledge
Headers: Authorization
Response: { alert }

PATCH  /alerts/:alertId/resolve
Headers: Authorization
Body: { resolution? }
Response: { alert }

DELETE /alerts/:alertId
Headers: Authorization
Response: { message }
```

### 8. Dashboard (/api/v1/organizations/:orgId/dashboard)

```
GET    /organizations/:orgId/dashboard
Headers: Authorization
Response: {
  stats: {
    totalMembers,
    activeMembers,
    onlineNow,
    totalAlerts,
    unresolvedAlerts
  },
  recentActivity: [...],
  criticalAlerts: [...]
}

GET    /organizations/:orgId/metrics/summary
Query: startDate, endDate
Headers: Authorization
Response: {
  totalLocations,
  averageAccuracy,
  totalDistance,
  activeTime
}
```

---

## 🔐 Autenticación y Autorización

### JWT Token Structure

```javascript
// Access Token (corta duración: 15 min)
{
  userId: "507f1f77bcf86cd799439011",
  email: "user@example.com",
  type: "access",
  iat: 1699966800,
  exp: 1699967700 // 15 min después
}

// Refresh Token (larga duración: 30 días)
{
  userId: "507f1f77bcf86cd799439011",
  type: "refresh",
  iat: 1699966800,
  exp: 1702558800 // 30 días después
}
```

### Middleware de Autenticación

```javascript
// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_001',
          message: 'Token no proporcionado'
        }
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verificar que sea access token
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_002',
          message: 'Token inválido'
        }
      });
    }

    // 4. Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_003',
          message: 'Usuario no encontrado o inactivo'
        }
      });
    }

    // 5. Adjuntar usuario a request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_004',
          message: 'Token inválido'
        }
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTH_005',
          message: 'Token expirado'
        }
      });
    }
    next(error);
  }
};

module.exports = authMiddleware;
```

### Middleware RBAC (Control de Acceso)

```javascript
// src/middleware/rbac.middleware.js
const Member = require('../models/Member');

const rbacMiddleware = (permission) => {
  return async (req, res, next) => {
    try {
      const { orgId } = req.params;
      const userId = req.user._id;

      // Buscar membership
      const member = await Member.findOne({
        organizationId: orgId,
        userId: userId,
        status: 'active'
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'RBAC_001',
            message: 'No eres miembro de esta organización'
          }
        });
      }

      // Verificar permiso
      if (!member.hasPermission(permission)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'RBAC_002',
            message: 'No tienes permisos para esta acción',
            details: { requiredPermission: permission }
          }
        });
      }

      // Adjuntar member a request
      req.member = member;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Uso:
// router.delete('/organizations/:orgId/members/:memberId',
//   authMiddleware,
//   rbacMiddleware('canManageMembers'),
//   memberController.removeMember
// );

module.exports = rbacMiddleware;
```

---

## ⚡ WebSocket para Tiempo Real

### Configuración del Servidor WebSocket

```javascript
// src/websocket/index.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

function initializeWebSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    },
    path: '/socket.io'
  });

  // Middleware de autenticación para sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('Usuario no encontrado'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Autenticación fallida'));
    }
  });

  // Eventos de conexión
  io.on('connection', (socket) => {
    console.log(`Usuario conectado: ${socket.user.email}`);

    // Unirse a canales de organizaciones
    socket.on('subscribe:organization', async (orgId) => {
      // Verificar que el usuario es miembro
      const member = await Member.findOne({
        organizationId: orgId,
        userId: socket.user._id,
        status: 'active'
      });

      if (member) {
        socket.join(`org:${orgId}`);
        console.log(`Usuario ${socket.user.email} unido a org:${orgId}`);
      }
    });

    // Desuscribirse
    socket.on('unsubscribe:organization', (orgId) => {
      socket.leave(`org:${orgId}`);
    });

    // Heartbeat/ping
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`Usuario desconectado: ${socket.user.email}`);
    });
  });

  return io;
}

module.exports = { initializeWebSocket };
```

### Emisión de Eventos de Ubicación

```javascript
// src/controllers/tracking.controller.js
const Location = require('../models/Location');
const LocationSnapshot = require('../models/LocationSnapshot');

const createLocation = async (req, res) => {
  try {
    const locationData = req.body;
    const userId = req.user._id;

    // Crear ubicación en historial
    const location = new Location({
      ...locationData,
      userId,
      serverTimestamp: new Date()
    });
    await location.save();

    // Actualizar snapshot (última ubicación)
    await LocationSnapshot.findOneAndUpdate(
      { userId },
      {
        ...locationData,
        userId,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // ⚡ Emitir evento WebSocket a la organización
    if (req.app.io && locationData.organizationId) {
      req.app.io.to(`org:${locationData.organizationId}`).emit('location:update', {
        userId: userId.toString(),
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
          activityType: location.activityType,
          batteryLevel: location.batteryLevel
        }
      });
    }

    res.status(201).json({
      success: true,
      data: { locationId: location._id },
      message: 'Ubicación guardada exitosamente'
    });
  } catch (error) {
    console.error('Error creating location:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOCATION_001',
        message: 'Error al guardar ubicación'
      }
    });
  }
};

module.exports = { createLocation };
```

### Eventos WebSocket

```javascript
// Eventos que el servidor emite al cliente:

// 1. Nueva ubicación
socket.emit('location:update', {
  userId: "507f1f77bcf86cd799439011",
  location: {
    latitude: -13.531912,
    longitude: -71.967512,
    accuracy: 15.5,
    timestamp: "2024-11-14T10:30:45Z",
    batteryLevel: 65
  }
});

// 2. Usuario se conectó/desconectó
socket.emit('user:online', {
  userId: "507f1f77bcf86cd799439011",
  status: "online"
});

socket.emit('user:offline', {
  userId: "507f1f77bcf86cd799439011",
  status: "offline",
  lastSeenAt: "2024-11-14T10:30:45Z"
});

// 3. Nueva alerta
socket.emit('alert:new', {
  alertId: "507f1f77bcf86cd799439011",
  type: "sos",
  severity: "critical",
  userId: "...",
  message: "SOS activado",
  location: { ... }
});

// 4. Evento de geofence
socket.emit('geofence:event', {
  eventType: "enter", // o "exit"
  userId: "...",
  geofenceId: "...",
  geofenceName: "Oficina Principal",
  timestamp: "..."
});
```

---

## ⚙️ Configuración Inicial

### 1. package.json

```json
{
  "name": "gps-community-backend",
  "version": "1.0.0",
  "description": "Backend API for GPS Community",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "format": "prettier --write \"src/**/*.js\"",
    "seed": "node scripts/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.6.3",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.1",
    "express-mongo-sanitize": "^2.2.0",
    "socket.io": "^4.7.2",
    "winston": "^3.11.0",
    "firebase-admin": "^11.11.0",
    "ioredis": "^5.3.2",
    "nodemailer": "^6.9.7",
    "multer": "^1.4.5-lts.1",
    "sharp": "^0.32.6",
    "swagger-ui-express": "^5.0.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.52.0",
    "prettier": "^3.0.3"
  }
}
```

### 2. .env.example

```bash
# Entorno
NODE_ENV=development
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://milith0dev_db_user:1997281qA@cluster0.cpt00yd.mongodb.net/gps_community_dev?retryWrites=true&w=majority&appName=Cluster0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000

# Firebase (opcional)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Redis (opcional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=
EMAIL_FROM=noreply@gpscommunity.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=debug
```

### 3. server.js (Punto de Entrada)

```javascript
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const { initializeWebSocket } = require('./src/websocket');
const routes = require('./src/routes');
const errorMiddleware = require('./src/middleware/error.middleware');
const logger = require('./src/utils/logger');

const app = express();
const server = http.createServer(app);

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Seguridad
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(mongoSanitize());

// Rutas
app.use('/api/v1', routes);

// Manejo de errores
app.use(errorMiddleware);

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('✅ Conectado a MongoDB Atlas');

    // Inicializar WebSocket
    const io = initializeWebSocket(server);
    app.io = io; // Hacer io accesible desde controllers

    // Iniciar servidor
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📍 Ambiente: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    logger.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  });

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});
```

### 4. Estructura de Rutas Principal

```javascript
// src/routes/index.js
const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const organizationRoutes = require('./organization.routes');
const trackingRoutes = require('./tracking.routes');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GPS Community API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Montar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/locations', trackingRoutes);

module.exports = router;
```

---

## 🚀 Deployment

### Opción 1: Railway (Recomendado para MVP)

1. **Configurar proyecto:**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Agregar MongoDB Atlas URL como variable de entorno
railway variables set MONGODB_URI="mongodb+srv://..."

# Deploy
railway up
```

2. **Variables de entorno en Railway:**
- Ir a Settings → Variables
- Agregar todas las variables de `.env.example`

### Opción 2: Heroku

```bash
# Login
heroku login

# Crear app
heroku create gps-community-api

# Agregar variables de entorno
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main
```

### Opción 3: AWS (Producción)

**Servicios a usar:**
- **ECS/Fargate:** Para containers
- **MongoDB Atlas:** Database (ya configurado)
- **ElastiCache (Redis):** Cache y sessions
- **Application Load Balancer:** Para distribución de tráfico
- **CloudWatch:** Logging y monitoring
- **S3:** Para uploads de archivos

---

## 📝 Checklist de Implementación

### Fase 1: Setup Básico (Semana 1)
- [ ] Crear directorio `backend/` en el proyecto
- [ ] Inicializar proyecto Node.js (`npm init`)
- [ ] Instalar dependencias base
- [ ] Configurar MongoDB Atlas (ya tienes URI)
- [ ] Crear modelos básicos (User, Organization, Member)
- [ ] Implementar autenticación JWT
- [ ] Crear endpoints básicos de auth

### Fase 2: Core Features (Semanas 2-3)
- [ ] Implementar endpoints de Organizations
- [ ] Implementar endpoints de Members
- [ ] Crear modelo Location con índices geoespaciales
- [ ] Implementar POST /locations (crítico)
- [ ] Implementar GET /locations/live
- [ ] Configurar WebSocket básico
- [ ] Implementar RBAC middleware

### Fase 3: Features Avanzadas (Semana 4)
- [ ] Implementar Geofences
- [ ] Sistema de Alertas
- [ ] Batch endpoint para ubicaciones
- [ ] Rate limiting
- [ ] Logging con Winston
- [ ] Tests básicos

### Fase 4: Producción (Semana 5+)
- [ ] Deployment en Railway/Heroku
- [ ] Documentación con Swagger
- [ ] Monitoring y alertas
- [ ] CI/CD con GitHub Actions
- [ ] Load testing

---

## 🎯 Prioridades

### Crítico (Must Have - MVP):
1. ✅ Autenticación JWT
2. ✅ CRUD de Organizations
3. ✅ CRUD de Members
4. ✅ POST /locations (guardar ubicación)
5. ✅ GET /locations/live (ubicaciones en vivo)
6. ✅ WebSocket básico
7. ✅ RBAC (control de acceso)

### Importante (Should Have):
8. Geofences
9. Sistema de Alertas
10. Batch locations endpoint
11. Rate limiting
12. Error handling robusto

### Deseable (Nice to Have):
13. Reports
14. Dashboard metrics
15. Email notifications
16. File uploads
17. Audit logs

---

## 📚 Recursos

### Documentación Oficial:
- **Express.js:** https://expressjs.com/
- **Mongoose:** https://mongoosejs.com/
- **Socket.io:** https://socket.io/
- **MongoDB Atlas:** https://www.mongodb.com/docs/atlas/

### Tutoriales Recomendados:
- Node.js REST API Best Practices
- MongoDB Geospatial Queries
- JWT Authentication in Express
- Socket.io Real-time Apps

---

## 🔒 Seguridad

### Consideraciones Importantes:

1. **Variables de Entorno:**
   - ❌ NUNCA commitear `.env` a Git
   - ✅ Usar `.env.example` como template
   - ✅ Rotar secretos regularmente

2. **MongoDB:**
   - ✅ Usar MongoDB Atlas con autenticación
   - ✅ Whitelist de IPs en Atlas
   - ✅ Usar conexiones SSL/TLS

3. **JWT:**
   - ✅ Secret key fuerte (min 32 caracteres)
   - ✅ Access tokens cortos (15 min)
   - ✅ Refresh tokens en httpOnly cookies (opcional)

4. **Rate Limiting:**
   - ✅ 100 requests/min por IP general
   - ✅ 10 requests/min para /auth/login
   - ✅ 1000 locations/min por organización

5. **Validación:**
   - ✅ Validar TODOS los inputs
   - ✅ Sanitizar datos antes de guardar
   - ✅ Usar express-validator

---

## ✅ Siguiente Paso

**Recomendación:** Empezar con la **Fase 1** creando el directorio `backend/` dentro del proyecto actual (Opción Monorepo).

¿Deseas que proceda con la implementación inicial del backend?
