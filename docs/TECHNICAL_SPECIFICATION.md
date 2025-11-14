# INFORME TÉCNICO: SISTEMA DE RASTREO DE UBICACIÓN EN TIEMPO REAL

## 1. RESUMEN EJECUTIVO

### 1.1 Descripción del Proyecto
Sistema multiplataforma de rastreo y monitoreo de ubicación en tiempo real diseñado para entornos laborales y gestión de equipos. La aplicación permite a organizaciones de cualquier tamaño rastrear la ubicación de sus colaboradores o miembros de equipo con consentimiento explícito, ofreciendo transparencia total y cumplimiento de normativas de privacidad.

### 1.2 Objetivos del Proyecto
- Desarrollar un producto mínimo viable (MVP) funcional para publicación en Play Store y App Store
- Implementar sistema de rastreo de alta precisión con almacenamiento histórico
- Crear arquitectura escalable que soporte desde pequeñas empresas hasta organizaciones grandes
- Establecer modelo de monetización basado en planes con funcionalidades diferenciadas
- Garantizar cumplimiento de regulaciones de privacidad y protección de datos

### 1.3 Stack Tecnológico Principal
- **Frontend:** Flutter (multiplataforma: Android, iOS, Web)
- **Backend:** Node.js con Express (API REST)
- **Base de Datos:** MongoDB Atlas
- **Infraestructura:** Amazon Web Services (AWS)
- **Mapas:** Google Maps Platform / OpenStreetMap
- **Autenticación:** Firebase Authentication / Auth0
- **Notificaciones:** Firebase Cloud Messaging (FCM)

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAPA DE CLIENTE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Android    │    │     iOS      │    │   Web Panel  │    │
│  │   (Flutter)  │    │  (Flutter)   │    │  (Flutter)   │    │
│  └──────────────┘    └──────────────┘    └──────────────┘    │
│                                                                 │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             │ HTTPS / WSS
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                     AWS INFRASTRUCTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AWS API Gateway                              │  │
│  │         (Gestión de APIs y Rate Limiting)                │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │          AWS Application Load Balancer (ALB)             │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │         AWS ECS / Fargate (Contenedores)                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   API REST   │  │  WebSocket   │  │   Worker     │   │  │
│  │  │   Service    │  │   Service    │  │   Service    │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────┴─────────────────────────────────┐  │
│  │              MongoDB Atlas (Cloud Database)              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Replica    │  │   Replica    │  │   Replica    │   │  │
│  │  │   Primary    │  │  Secondary   │  │  Secondary   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                AWS S3 (Almacenamiento)                    │  │
│  │         (Backups, Logs, Archivos estáticos)              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          AWS CloudWatch (Monitoreo y Logs)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          AWS ElastiCache (Redis - Caché)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                   SERVICIOS EXTERNOS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Firebase   │  │  Google Maps │  │   Stripe /   │         │
│  │     Auth     │  │   Platform   │  │   Payment    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Componentes del Sistema

#### 2.2.1 Capa de Cliente (Frontend)
**Aplicación Flutter Multiplataforma**
- Interfaz unificada para Android, iOS y Web
- Comunicación en tiempo real mediante WebSockets
- Gestión de permisos de ubicación nativos
- Caché local para funcionamiento offline limitado
- Sincronización automática al recuperar conexión

#### 2.2.2 Capa de API (Backend)
**API REST Service**
- Gestión de autenticación y autorización
- CRUD de usuarios, grupos y organizaciones
- Manejo de configuraciones y permisos
- Procesamiento de datos de ubicación
- Generación de reportes y estadísticas

**WebSocket Service**
- Transmisión de ubicaciones en tiempo real
- Notificaciones push instantáneas
- Actualizaciones de estado de usuarios
- Sincronización de eventos entre dispositivos

**Worker Service**
- Procesamiento asíncrono de datos históricos
- Generación de reportes programados
- Limpieza de datos antiguos
- Cálculos de estadísticas y métricas

#### 2.2.3 Capa de Datos
**MongoDB Atlas**
- Base de datos principal con replica set
- Índices geoespaciales para consultas de ubicación
- Almacenamiento de datos históricos
- Escalabilidad horizontal automática

**Redis (ElastiCache)**
- Caché de sesiones activas
- Almacenamiento temporal de ubicaciones en tiempo real
- Rate limiting y control de acceso
- Caché de consultas frecuentes

#### 2.2.4 Infraestructura AWS
**API Gateway**
- Punto de entrada único para todas las peticiones
- Rate limiting por usuario/plan
- Autenticación de peticiones
- Transformación de solicitudes/respuestas

**ECS/Fargate**
- Contenedores Docker para servicios
- Auto-escalado según demanda
- Alta disponibilidad con múltiples instancias
- Despliegue continuo sin downtime

**S3**
- Almacenamiento de backups automáticos
- Logs de aplicación y auditoría
- Archivos exportados (reportes PDF, CSV)

**CloudWatch**
- Monitoreo de métricas del sistema
- Alertas automáticas
- Logs centralizados
- Dashboards de rendimiento

---

## 3. MODELO DE DATOS (MongoDB)

### 3.1 Colección: users

```javascript
{
  _id: ObjectId,
  email: String,              // Único, índice
  phone: String,              // Opcional
  password: String,           // Hash bcrypt
  displayName: String,
  photoURL: String,
  authProvider: String,       // "email", "google", "apple"
  authProviderId: String,
  
  status: String,             // "active", "inactive", "suspended"
  emailVerified: Boolean,
  phoneVerified: Boolean,
  
  preferences: {
    language: String,         // "es", "en", "pt"
    notifications: {
      push: Boolean,
      email: Boolean,
      locationAlerts: Boolean
    },
    privacy: {
      shareLocationHistory: Boolean,
      visibleToOthers: Boolean
    }
  },
  
  deviceInfo: [{
    deviceId: String,
    deviceName: String,
    platform: String,         // "android", "ios", "web"
    osVersion: String,
    appVersion: String,
    lastActive: Date,
    pushToken: String,        // FCM token
    isActive: Boolean
  }],
  
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date,
  deletedAt: Date             // Soft delete
}
```

**Índices:**
- `email: 1` (único)
- `authProviderId: 1`
- `status: 1`
- `createdAt: -1`

### 3.2 Colección: organizations

```javascript
{
  _id: ObjectId,
  name: String,
  displayName: String,
  description: String,
  
  owner: ObjectId,            // Ref: users._id
  
  subscription: {
    plan: String,             // "free", "basic", "pro", "enterprise"
    status: String,           // "active", "trial", "expired", "cancelled"
    startDate: Date,
    endDate: Date,
    billingCycle: String,     // "monthly", "annual"
    maxUsers: Number,
    features: [String],       // ["historical_tracking", "geofencing", "reports"]
    
    payment: {
      method: String,         // "stripe", "paypal"
      customerId: String,
      subscriptionId: String,
      lastPayment: Date,
      nextPayment: Date
    }
  },
  
  settings: {
    trackingInterval: Number,  // Segundos
    trackingAccuracy: String,  // "high", "balanced", "low"
    workingHours: {
      enabled: Boolean,
      schedule: [{
        day: String,          // "monday", "tuesday", ...
        startTime: String,    // "08:00"
        endTime: String       // "18:00"
      }]
    },
    geofencing: {
      enabled: Boolean,
      zones: [{
        _id: ObjectId,
        name: String,
        type: String,         // "office", "warehouse", "client_location"
        coordinates: {
          type: String,       // "Polygon"
          coordinates: [[[Number]]]  // GeoJSON
        },
        radius: Number,       // Metros
        alerts: {
          onEnter: Boolean,
          onExit: Boolean,
          onStay: Boolean,
          stayDuration: Number  // Minutos
        }
      }]
    },
    privacy: {
      dataRetention: Number,  // Días
      allowHistoryExport: Boolean,
      requireConsent: Boolean
    }
  },
  
  branding: {
    logo: String,
    primaryColor: String,
    secondaryColor: String
  },
  
  status: String,             // "active", "suspended", "deleted"
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date
}
```

**Índices:**
- `owner: 1`
- `subscription.plan: 1`
- `subscription.status: 1`
- `status: 1`
- `createdAt: -1`

### 3.3 Colección: groups

```javascript
{
  _id: ObjectId,
  organization: ObjectId,     // Ref: organizations._id
  name: String,
  description: String,
  
  type: String,               // "department", "team", "project", "custom"
  
  settings: {
    trackingEnabled: Boolean,
    inheritFromOrg: Boolean,
    customTrackingInterval: Number,
    notifications: {
      enabled: Boolean,
      events: [String]        // ["member_arrived", "member_left", "sos"]
    }
  },
  
  status: String,             // "active", "archived"
  createdBy: ObjectId,        // Ref: users._id
  createdAt: Date,
  updatedAt: Date
}
```

**Índices:**
- `organization: 1`
- `status: 1`
- Compuesto: `{organization: 1, status: 1}`

### 3.4 Colección: members

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Ref: users._id
  organization: ObjectId,     // Ref: organizations._id
  groups: [ObjectId],         // Ref: groups._id
  
  role: String,               // "owner", "admin", "manager", "member"
  
  permissions: {
    canViewAll: Boolean,
    canViewHistory: Boolean,
    canExportData: Boolean,
    canManageMembers: Boolean,
    canManageGroups: Boolean,
    canManageSettings: Boolean,
    canCreateGeofences: Boolean
  },
  
  trackingConsent: {
    given: Boolean,
    date: Date,
    ipAddress: String,
    userAgent: String,
    withdrawnDate: Date
  },
  
  trackingStatus: {
    isActive: Boolean,
    mode: String,             // "always", "working_hours", "manual"
    lastUpdate: Date,
    currentLocation: {
      type: String,           // "Point"
      coordinates: [Number],  // [longitude, latitude]
      accuracy: Number,
      altitude: Number,
      heading: Number,
      speed: Number
    }
  },
  
  status: String,             // "active", "inactive", "pending", "removed"
  invitedBy: ObjectId,        // Ref: users._id
  invitedAt: Date,
  joinedAt: Date,
  lastActiveAt: Date,
  removedAt: Date
}
```

**Índices:**
- Compuesto único: `{user: 1, organization: 1}`
- `organization: 1`
- `groups: 1`
- `role: 1`
- `status: 1`
- `trackingStatus.isActive: 1`
- Geoespacial: `trackingStatus.currentLocation: "2dsphere"`

### 3.5 Colección: location_history

```javascript
{
  _id: ObjectId,
  user: ObjectId,             // Ref: users._id
  organization: ObjectId,     // Ref: organizations._id
  
  location: {
    type: String,             // "Point"
    coordinates: [Number]     // [longitude, latitude]
  },
  
  accuracy: Number,           // Metros
  altitude: Number,           // Metros
  altitudeAccuracy: Number,
  heading: Number,            // Grados (0-360)
  speed: Number,              // m/s
  speedAccuracy: Number,
  
  activity: {
    type: String,             // "still", "walking", "running", "driving", "cycling"
    confidence: Number        // 0-100
  },
  
  battery: {
    level: Number,            // 0-100
    isCharging: Boolean
  },
  
  network: {
    type: String,             // "wifi", "cellular", "none"
    quality: String           // "excellent", "good", "fair", "poor"
  },
  
  metadata: {
    source: String,           // "gps", "network", "fused"
    provider: String,         // "android", "ios"
    deviceId: String,
    appVersion: String
  },
  
  processed: {
    isProcessed: Boolean,
    processedAt: Date,
    isAnomaly: Boolean,
    withinGeofence: [ObjectId],  // Refs: organizations.settings.geofencing.zones._id
    distanceFromPrevious: Number, // Metros
    timeFromPrevious: Number      // Segundos
  },
  
  timestamp: Date,            // Hora de captura
  serverTimestamp: Date,      // Hora de recepción en servidor
  createdAt: Date
}
```

**Índices:**
- Compuesto: `{user: 1, timestamp: -1}`
- Compuesto: `{organization: 1, timestamp: -1}`
- Geoespacial: `location: "2dsphere"`
- `timestamp: -1` (con TTL index según retention policy)
- `processed.isProcessed: 1`

**Particionamiento:**
Esta colección se debe particionar por rango de fechas (sharding) para optimizar consultas históricas y distribución de carga.

### 3.6 Colección: location_snapshots (Optimización tiempo real)

```javascript
{
  _id: ObjectId,              // user._id (mismo ID que el usuario)
  organization: ObjectId,
  
  currentLocation: {
    type: String,             // "Point"
    coordinates: [Number]
  },
  accuracy: Number,
  heading: Number,
  speed: Number,
  activity: String,
  
  lastUpdate: Date,
  isOnline: Boolean,
  battery: Number,
  
  // Cache de última ubicación para consultas rápidas
  expiresAt: Date             // TTL index
}
```

**Índices:**
- `_id: 1` (primary key = user._id)
- `organization: 1`
- Geoespacial: `currentLocation: "2dsphere"`
- TTL: `expiresAt: 1`

### 3.7 Colección: alerts

```javascript
{
  _id: ObjectId,
  organization: ObjectId,
  user: ObjectId,
  
  type: String,               // "geofence_enter", "geofence_exit", "sos", "battery_low", "speed_limit"
  severity: String,           // "info", "warning", "critical"
  
  title: String,
  message: String,
  
  relatedData: {
    geofenceId: ObjectId,
    location: {
      type: String,
      coordinates: [Number]
    },
    speed: Number,
    battery: Number
  },
  
  status: String,             // "new", "acknowledged", "resolved", "dismissed"
  acknowledgedBy: ObjectId,
  acknowledgedAt: Date,
  
  notificationSent: {
    push: Boolean,
    email: Boolean,
    sentAt: Date
  },
  
  timestamp: Date,
  createdAt: Date,
  expiresAt: Date             // TTL para limpieza automática
}
```

**Índices:**
- Compuesto: `{organization: 1, status: 1, timestamp: -1}`
- `user: 1`
- `type: 1`
- TTL: `expiresAt: 1`

### 3.8 Colección: audit_logs

```javascript
{
  _id: ObjectId,
  organization: ObjectId,
  user: ObjectId,             // Usuario que realizó la acción
  
  action: String,             // "user_added", "permission_changed", "data_exported", "settings_updated"
  entity: String,             // "user", "group", "organization", "geofence"
  entityId: ObjectId,
  
  changes: {
    before: Object,
    after: Object
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceId: String
  },
  
  timestamp: Date,
  expiresAt: Date             // TTL según política de retención
}
```

**Índices:**
- Compuesto: `{organization: 1, timestamp: -1}`
- `user: 1`
- `action: 1`
- TTL: `expiresAt: 1`

### 3.9 Colección: reports

```javascript
{
  _id: ObjectId,
  organization: ObjectId,
  
  type: String,               // "daily", "weekly", "monthly", "custom"
  title: String,
  
  parameters: {
    dateRange: {
      start: Date,
      end: Date
    },
    users: [ObjectId],
    groups: [ObjectId],
    metrics: [String]         // ["distance", "time_tracked", "stops", "geofence_visits"]
  },
  
  data: {
    summary: Object,
    details: [Object],
    charts: [Object]
  },
  
  fileUrl: String,            // URL S3 del PDF/CSV generado
  fileType: String,           // "pdf", "csv", "excel"
  
  generatedBy: ObjectId,
  generatedAt: Date,
  
  status: String,             // "generating", "completed", "failed"
  
  expiresAt: Date             // TTL para limpieza de reportes antiguos
}
```

**Índices:**
- Compuesto: `{organization: 1, generatedAt: -1}`
- `generatedBy: 1`
- `status: 1`
- TTL: `expiresAt: 1`

---

## 4. SISTEMA DE ROLES Y PERMISOS

### 4.1 Jerarquía de Roles

#### Nivel 1: Owner (Propietario de Organización)
**Descripción:** Creador de la organización con control total.

**Permisos:**
- Todas las funcionalidades sin restricción
- Gestión de suscripción y pagos
- Eliminar organización
- Transferir propiedad
- Asignar/revocar roles de administrador
- Acceso a logs de auditoría completos

#### Nivel 2: Admin (Administrador)
**Descripción:** Gestiona la configuración y usuarios de la organización.

**Permisos:**
- Invitar/remover usuarios
- Crear/editar/eliminar grupos
- Configurar ajustes de rastreo
- Crear/editar geofences
- Ver historial completo de ubicaciones
- Generar reportes
- Ver todas las alertas
- Gestionar permisos de managers y members
- Acceso a logs de auditoría propios

**Restricciones:**
- No puede cambiar plan de suscripción
- No puede eliminar la organización
- No puede remover al Owner

#### Nivel 3: Manager (Supervisor)
**Descripción:** Supervisa grupos específicos y puede ver ubicaciones de su equipo.

**Permisos:**
- Ver ubicación en tiempo real de miembros de sus grupos
- Ver historial de ubicaciones (según plan)
- Recibir alertas de su equipo
- Generar reportes de su equipo
- Ver geofences
- Exportar datos limitados

**Restricciones:**
- No puede modificar configuraciones
- No puede crear/eliminar geofences
- No puede invitar usuarios
- Solo ve datos de grupos asignados

#### Nivel 4: Member (Miembro)
**Descripción:** Usuario rastreado que puede ver su propia información.

**Permisos:**
- Ver su propia ubicación e historial
- Ver miembros de sus grupos (solo nombres y estado online/offline)
- Activar/desactivar rastreo (si está permitido por configuración)
- Ver geofences (opcional según configuración)
- Exportar su propio historial

**Restricciones:**
- No puede ver ubicación detallada de otros
- No puede modificar configuraciones
- No puede acceder a reportes organizacionales

### 4.2 Matriz de Permisos

| Funcionalidad | Owner | Admin | Manager | Member |
|--------------|-------|-------|---------|--------|
| **Gestión de Organización** |
| Modificar configuración org | ✓ | ✓ | ✗ | ✗ |
| Gestionar suscripción | ✓ | ✗ | ✗ | ✗ |
| Eliminar organización | ✓ | ✗ | ✗ | ✗ |
| Ver logs de auditoría | ✓ | ✓ (limitado) | ✗ | ✗ |
| **Gestión de Usuarios** |
| Invitar usuarios | ✓ | ✓ | ✗ | ✗ |
| Remover usuarios | ✓ | ✓ | ✗ | ✗ |
| Cambiar roles | ✓ | ✓ (excepto Owner) | ✗ | ✗ |
| **Gestión de Grupos** |
| Crear grupos | ✓ | ✓ | ✗ | ✗ |
| Editar grupos | ✓ | ✓ | ✗ | ✗ |
| Asignar miembros a grupos | ✓ | ✓ | ✗ | ✗ |
| **Rastreo** |
| Ver ubicación tiempo real (todos) | ✓ | ✓ | ✓ (su grupo) | ✗ |
| Ver historial completo | ✓ | ✓ | ✓ (su grupo) | ✓ (propio) |
| Configurar intervalo rastreo | ✓ | ✓ | ✗ | ✗ |
| Activar/desactivar rastreo propio | ✓ | ✓ | ✓ | ✓ (si permitido) |
| **Geofencing** |
| Crear geofences | ✓ | ✓ | ✗ | ✗ |
| Editar geofences | ✓ | ✓ | ✗ | ✗ |
| Ver geofences | ✓ | ✓ | ✓ | ✓ (si permitido) |
| **Reportes y Exportación** |
| Generar reportes org | ✓ | ✓ | ✗ | ✗ |
| Generar reportes grupo | ✓ | ✓ | ✓ | ✗ |
| Exportar datos completos | ✓ | ✓ | ✗ | ✗ |
| Exportar datos propios | ✓ | ✓ | ✓ | ✓ |
| **Alertas** |
| Configurar alertas | ✓ | ✓ | ✗ | ✗ |
| Recibir alertas (todos) | ✓ | ✓ | ✗ | ✗ |
| Recibir alertas (su grupo) | ✓ | ✓ | ✓ | ✗ |
| Enviar alerta SOS | ✓ | ✓ | ✓ | ✓ |

### 4.3 Flujo de Invitación y Consentimiento

```
1. Admin/Owner invita usuario
   ↓
2. Usuario recibe invitación (email/SMS)
   ↓
3. Usuario descarga app y se registra
   ↓
4. Sistema muestra política de privacidad y términos
   ↓
5. Usuario acepta términos y otorga consentimiento de rastreo
   ↓
6. Usuario solicita permisos de ubicación al SO
   ↓
7. Sistema registra consentimiento con timestamp e IP
   ↓
8. Usuario activo en organización
```

**Importante:** El consentimiento debe ser:
- Explícito y documentado
- Revocable en cualquier momento
- Con explicación clara del uso de datos
- Registrado con evidencia (fecha, hora, IP, términos aceptados)

---

## 5. REQUERIMIENTOS FUNCIONALES

### 5.1 Módulo de Autenticación (RF-AUTH)

**RF-AUTH-001: Registro de usuario**
- El sistema debe permitir registro mediante email y contraseña
- El sistema debe validar formato de email y fortaleza de contraseña
- El sistema debe enviar correo de verificación
- Prioridad: Alta | Tipo: Esencial

**RF-AUTH-002: Autenticación mediante proveedores OAuth**
- El sistema debe permitir login con Google
- El sistema debe permitir login con Apple (iOS)
- El sistema debe sincronizar datos del perfil del proveedor
- Prioridad: Alta | Tipo: Esencial

**RF-AUTH-003: Recuperación de contraseña**
- El sistema debe permitir reseteo de contraseña mediante email
- El link de recuperación debe expirar en 1 hora
- Prioridad: Media | Tipo: Esencial

**RF-AUTH-004: Gestión de sesiones**
- El sistema debe mantener sesión activa mediante tokens JWT
- Los tokens deben expirar después de 7 días de inactividad
- El sistema debe permitir logout en todos los dispositivos
- Prioridad: Alta | Tipo: Esencial

### 5.2 Módulo de Organizaciones (RF-ORG)

**RF-ORG-001: Creación de organización**
- Un usuario registrado puede crear una organización
- El creador se convierte automáticamente en Owner
- Se debe asignar plan gratuito inicial (trial 14 días)
- Prioridad: Alta | Tipo: Esencial

**RF-ORG-002: Configuración de organización**
- Owner/Admin puede configurar nombre, logo, colores
- Se puede configurar horarios laborales
- Se puede definir intervalo de rastreo (mín: 30 seg, máx: 10 min)
- Prioridad: Media | Tipo: Importante

**RF-ORG-003: Gestión de suscripción**
- Owner puede cambiar de plan
- Sistema debe validar límites del plan antes de permitir acciones
- Se debe notificar 7 días antes del vencimiento
- Prioridad: Alta | Tipo: Esencial

**RF-ORG-004: Invitación de miembros**
- Admin/Owner puede invitar mediante email
- Se genera link único de invitación con expiración de 72 horas
- Se puede asignar rol y grupos en la invitación
- Prioridad: Alta | Tipo: Esencial

### 5.3 Módulo de Grupos (RF-GROUP)

**RF-GROUP-001: Creación de grupos**
- Admin puede crear grupos ilimitados (según plan)
- Cada grupo tiene nombre, descripción y tipo
- Se pueden heredar configuraciones de la organización
- Prioridad: Media | Tipo: Importante

**RF-GROUP-002: Asignación de miembros**
- Admin puede asignar usuarios a múltiples grupos
- Un usuario puede pertenecer a varios grupos simultáneamente
- Se debe validar límite de usuarios según plan
- Prioridad: Alta | Tipo: Esencial

**RF-GROUP-003: Configuración personalizada de grupo**
- Se puede personalizar intervalo de rastreo por grupo
- Se pueden configurar notificaciones específicas del grupo
- Prioridad: Baja | Tipo: Opcional

### 5.4 Módulo de Rastreo (RF-TRACK)

**RF-TRACK-001: Captura de ubicación**
- La app debe capturar ubicación según intervalo configurado
- Se debe obtener: latitud, longitud, precisión, altitud, velocidad, rumbo
- Captura debe funcionar en background (con permiso del SO)
- Prioridad: Alta | Tipo: Esencial

**RF-TRACK-002: Envío de ubicación al servidor**
- Las ubicaciones deben enviarse en tiempo real cuando hay conexión
- Se deben almacenar localmente si no hay conexión
- Sincronización automática al recuperar conexión
- Batch de hasta 50 ubicaciones por envío
- Prioridad: Alta | Tipo: Esencial

**RF-TRACK-003: Visualización en tiempo real**
- Mapa debe mostrar ubicación actual de usuarios activos
- Actualización automática cada 30 segundos (configurable)
- Indicador visual de última actualización (hace X segundos)
- Prioridad: Alta | Tipo: Esencial

**RF-TRACK-004: Algoritmo de precisión de ubicación**
- Filtrar ubicaciones con precisión mayor a 100 metros
- Detectar y descartar ubicaciones anómalas (saltos ilógicos)
- Interpolar trayectos para suavizar recorridos
- Algoritmo de dead reckoning en túneles o zonas sin señal
- Prioridad: Alta | Tipo: Importante

**RF-TRACK-005: Historial de ubicaciones**
- Admin puede consultar historial con filtros de fecha y usuario
- Visualización de recorrido en mapa con timeline
- Reproducción de recorrido con controles (play/pause/velocidad)
- Prioridad: Alta | Tipo: Esencial

**RF-TRACK-006: Modo manual de rastreo**
- Member puede activar/desactivar rastreo (si permitido)
- Estado visible para Admin/Manager
- Log de activaciones/desactivaciones
- Prioridad: Media | Tipo: Importante

**RF-TRACK-007: Optimización de batería**
- Ajuste automático de frecuencia según nivel de batería
- Modo de ahorro de energía (rastreo reducido bajo 20%)
- Detección de actividad (still/moving) para ajustar frecuencia
- Prioridad: Alta | Tipo: Importante

### 5.5 Módulo de Geofencing (RF-GEO)

**RF-GEO-001: Creación de geocercas**
- Admin puede crear zonas circulares o poligonales
- Mínimo: radio de 50 metros
- Cada zona tiene nombre, tipo y color
- Prioridad: Media | Tipo: Importante

**RF-GEO-002: Alertas de geocerca**
- Sistema detecta entrada/salida de zonas
- Notificación push inmediata a Admin/Manager
- Log de eventos con timestamp
- Prioridad: Media | Tipo: Importante

**RF-GEO-003: Estadísticas de geocercas**
- Tiempo de permanencia por zona
- Número de visitas por usuario
- Horarios de entrada/salida
- Prioridad: Baja | Tipo: Opcional

### 5.6 Módulo de Notificaciones (RF-NOTIF)

**RF-NOTIF-001: Notificaciones push**
- Envío mediante Firebase Cloud Messaging
- Notificaciones en tiempo real
- Configuración de preferencias por usuario
- Prioridad: Alta | Tipo: Esencial

**RF-NOTIF-002: Tipos de alertas**
- Entrada/salida de geocerca
- Batería baja del dispositivo
- Usuario desconectado por tiempo prolongado
- SOS/Emergencia
- Prioridad: Media | Tipo: Importante

**RF-NOTIF-003: Alerta SOS**
- Botón de pánico visible en app
- Envío inmediato a Admin/Owner con ubicación exacta
- Notificación de alta prioridad
- Log de alertas SOS
- Prioridad: Alta | Tipo: Esencial

### 5.7 Módulo de Reportes (RF-REPORT)

**RF-REPORT-001: Generación de reportes**
- Reportes de actividad diaria/semanal/mensual
- Métricas: distancia recorrida, tiempo activo, paradas, zonas visitadas
- Exportación en PDF y CSV
- Prioridad: Media | Tipo: Importante

**RF-REPORT-002: Reportes programados**
- Generación automática semanal/mensual
- Envío por email a Admin
- Prioridad: Baja | Tipo: Opcional

**RF-REPORT-003: Dashboard de métricas**
- Estadísticas en tiempo real de la organización
- Gráficos de actividad
- KPIs configurables
- Prioridad: Media | Tipo: Importante

### 5.8 Módulo de Privacidad y Cumplimiento (RF-PRIV)

**RF-PRIV-001: Consentimiento de rastreo**
- Consentimiento explícito al unirse a organización
- Documento de términos y condiciones
- Registro de aceptación con evidencia
- Prioridad: Alta | Tipo: Esencial

**RF-PRIV-002: Revocación de consentimiento**
- Usuario puede revocar consentimiento en cualquier momento
- Sistema deja de rastrear inmediatamente
- Prioridad: Alta | Tipo: Esencial

**RF-PRIV-003: Derecho al olvido**
- Usuario puede solicitar eliminación de sus datos
- Proceso de eliminación completo en 30 días
- Prioridad: Alta | Tipo: Esencial

**RF-PRIV-004: Exportación de datos personales**
- Usuario puede descargar todos sus datos
- Formato JSON estructurado
- Prioridad: Media | Tipo: Importante

**RF-PRIV-005: Logs de auditoría**
- Registro de accesos a datos de ubicación
- Registro de cambios de permisos
- Retención de logs por 1 año
- Prioridad: Alta | Tipo: Esencial

---

## 6. REQUERIMIENTOS NO FUNCIONALES

### 6.1 Rendimiento (RNF-PERF)

**RNF-PERF-001: Tiempo de respuesta API**
- 95% de las peticiones deben responder en menos de 500ms
- 99% de las peticiones deben responder en menos de 1 segundo
- Timeout máximo: 30 segundos

**RNF-PERF-002: Actualización en tiempo real**
- Latencia máxima de ubicación en tiempo real: 5 segundos
- Actualización de mapa: máximo 30 segundos de retraso

**RNF-PERF-003: Carga de mapa**
- Tiempo de carga inicial del mapa: menos de 3 segundos
- Renderizado de 100 usuarios simultáneos: menos de 2 segundos

**RNF-PERF-004: Procesamiento de ubicaciones**
- Capacidad de procesar 10,000 puntos de ubicación por minuto
- Cola de procesamiento con máximo 5 minutos de retraso

**RNF-PERF-005: Base de datos**
- Consultas de lectura: menos de 100ms (90% de casos)
- Escrituras de ubicación: menos de 50ms
- Índices optimizados para consultas geoespaciales

### 6.2 Escalabilidad (RNF-SCAL)

**RNF-SCAL-001: Usuarios concurrentes**
- Soporte para 10,000 usuarios activos simultáneos en MVP
- Arquitectura preparada para escalar a 100,000+ usuarios
- Auto-escalado de servicios en AWS según demanda

**RNF-SCAL-002: Organizaciones**
- Soporte para 1,000 organizaciones activas en MVP
- Sin límite técnico en número de organizaciones

**RNF-SCAL-003: Puntos de ubicación**
- Almacenamiento de 500 millones de puntos de ubicación
- Particionamiento automático de datos históricos
- Archivado de datos antiguos según política de retención

**RNF-SCAL-004: Ancho de banda**
- Estimación: 1KB por punto de ubicación
- Con 10,000 usuarios activos reportando cada 60 segundos:
  - 10,000 puntos/minuto = ~10MB/minuto
  - ~14.4GB/día
  - CDN para distribución de assets estáticos

### 6.3 Disponibilidad (RNF-AVAIL)

**RNF-AVAIL-001: Uptime**
- Disponibilidad del 99.5% mensual (≈3.6 horas de downtime permitido)
- SLA: 99.9% para planes Enterprise (≈43 minutos de downtime)

**RNF-AVAIL-002: Recuperación ante desastres**
- RTO (Recovery Time Objective): 4 horas
- RPO (Recovery Point Objective): 1 hora
- Backups automáticos cada 6 horas

**RNF-AVAIL-003: Redundancia**
- Base de datos con replica set (1 primary + 2 secondary)
- Servicios distribuidos en mínimo 2 zonas de disponibilidad
- Load balancer con health checks cada 30 segundos

**RNF-AVAIL-004: Manejo de errores**
- Reintentos automáticos en fallos de red (máx 3 intentos)
- Fallback a caché cuando API no disponible
- Mensajes de error descriptivos para el usuario

### 6.4 Seguridad (RNF-SEC)

**RNF-SEC-001: Autenticación**
- JWT con expiración de 7 días
- Refresh tokens con rotación
- Bloqueo de cuenta tras 5 intentos fallidos
- Desbloqueo automático tras 15 minutos o por email

**RNF-SEC-002: Cifrado**
- TLS 1.3 para todas las comunicaciones
- Cifrado en reposo de datos sensibles (AES-256)
- Hashing de contraseñas con bcrypt (cost factor 12)

**RNF-SEC-003: Autorización**
- Validación de permisos en cada petición
- Rate limiting: 100 peticiones/minuto por usuario
- Validación de tokens en cada request

**RNF-SEC-004: Protección de datos**
- Anonimización de IPs en logs
- Encriptación de datos personales en BD
- Acceso a ubicaciones mediante autorización JWT

**RNF-SEC-005: Auditoría**
- Logs de todos los accesos a datos de ubicación
- Logs de cambios en permisos y roles
- Detección de anomalías en accesos

**RNF-SEC-006: Compliance**
- Cumplimiento GDPR (Unión Europea)
- Cumplimiento LGPD (Brasil)
- Términos de servicio claros y transparentes

### 6.5 Usabilidad (RNF-USAB)

**RNF-USAB-001: Interfaz intuitiva**
- Onboarding completo en menos de 3 minutos
- Máximo 3 clicks para acceder a funcionalidad principal
- Diseño responsive para tablets y teléfonos

**RNF-USAB-002: Accesibilidad**
- Cumplimiento WCAG 2.1 nivel AA
- Soporte para lectores de pantalla
- Contraste mínimo 4.5:1 en textos

**RNF-USAB-003: Internacionalización**
- Soporte para español, inglés y portugués en MVP
- Formato de fechas según locale
- Unidades de medida configurables (km/millas)

**RNF-USAB-004: Mensajes de error**
- Errores descriptivos y accionables
- Sugerencias de solución cuando sea posible
- Sin códigos técnicos visibles al usuario

### 6.6 Compatibilidad (RNF-COMP)

**RNF-COMP-001: Plataformas móviles**
- Android 8.0 (API 26) o superior
- iOS 13.0 o superior
- Optimizado para pantallas de 5" a 6.7"

**RNF-COMP-002: Navegadores web**
- Chrome 90+ (desktop y móvil)
- Safari 14+ (desktop y móvil)
- Firefox 88+
- Edge 90+

**RNF-COMP-003: Servicios de mapas**
- Google Maps como proveedor principal
- OpenStreetMap como alternativa
- Mapbox para personalización avanzada (futura)

### 6.7 Mantenibilidad (RNF-MAINT)

**RNF-MAINT-001: Código**
- Cobertura de tests unitarios: mínimo 70%
- Documentación de API con OpenAPI/Swagger
- Código revisado mediante pull requests

**RNF-MAINT-002: Despliegue**
- CI/CD con GitHub Actions
- Despliegue blue-green para zero-downtime
- Rollback automático en caso de errores

**RNF-MAINT-003: Monitoreo**
- Dashboards en tiempo real (CloudWatch/Grafana)
- Alertas automáticas para errores críticos
- Logs centralizados y estructurados

**RNF-MAINT-004: Documentación**
- Documentación técnica actualizada
- Guías de usuario por rol
- FAQ y troubleshooting

### 6.8 Portabilidad (RNF-PORT)

**RNF-PORT-001: Independencia de proveedor**
- Arquitectura que permite migración de cloud provider
- Datos exportables en formatos estándar
- APIs documentadas para integraciones

**RNF-PORT-002: Exportación de datos**
- Exportación completa de organización en JSON
- Backup descargable por Owner
- Formato compatible con importación en otros sistemas

---

## 7. ESPECIFICACIONES TÉCNICAS DE RASTREO

### 7.1 Algoritmo de Captura de Ubicación

#### 7.1.1 Estrategia de Posicionamiento

**Proveedores de Ubicación (en orden de prioridad):**

1. **Fused Location Provider (Android) / Core Location (iOS)**
   - Combina GPS, WiFi, redes celulares y sensores
   - Mayor precisión con optimización de batería
   - Preferencia: Alta precisión cuando app en foreground
   - Preferencia: Balanced cuando app en background

2. **GPS Puro**
   - Activación en situaciones que requieren máxima precisión
   - Mayor consumo de batería
   - Uso limitado a casos específicos (ej: navegación activa)

3. **Network Location**
   - Basado en torres celulares y WiFi
   - Menor precisión pero menor consumo
   - Fallback cuando GPS no disponible

#### 7.1.2 Configuración de Precisión por Contexto

```
Modo High Accuracy (Foreground):
- Intervalo mínimo: 30 segundos
- Distancia mínima: 10 metros
- Precisión requerida: < 20 metros
- Uso: App abierta, navegación activa

Modo Balanced (Background Normal):
- Intervalo: 60-120 segundos (configurable)
- Distancia mínima: 50 metros
- Precisión requerida: < 50 metros
- Uso: App en background, jornada laboral

Modo Power Saver (Batería Baja):
- Intervalo: 300 segundos (5 minutos)
- Distancia mínima: 100 metros
- Precisión requerida: < 100 metros
- Activación automática: batería < 20%

Modo Stillness Detection:
- Si usuario inmóvil > 5 minutos: reducir frecuencia a 5 minutos
- Detección mediante acelerómetro y giroscopio
- Reactivación automática al detectar movimiento
```

#### 7.1.3 Filtrado de Ubicaciones

**Criterios de Descarte:**

1. **Precisión Insuficiente**
   ```
   if (accuracy > 100 metros) {
     descartar()
   }
   ```

2. **Saltos Imposibles (Teleportación)**
   ```
   distancia = calcularDistancia(ubicacionActual, ubicacionPrevia)
   tiempoTranscurrido = timestamp - timestampPrevio
   velocidadCalculada = distancia / tiempoTranscurrido
   
   if (velocidadCalculada > 150 km/h && !esCarretera()) {
     marcarComoAnomalia()
     descartar()
   }
   ```

3. **Puntos Outliers**
   ```
   // Si punto está muy desviado de la trayectoria esperada
   if (distanciaDesdeRecorrido > (accuracy * 2)) {
     verificarConSiguientesPuntos(3) // Esperar confirmación
     if (!confirmado) descartar()
   }
   ```

4. **Timestamp Inconsistente**
   ```
   if (timestamp < ultimoTimestamp) {
     descartar() // Ubicación del pasado
   }
   ```

#### 7.1.4 Interpolación de Trayectos

**Suavizado de Recorridos:**

```
Algoritmo Catmull-Rom Spline:
- Interpolar puntos entre ubicaciones para curvas suaves
- Aplicar solo en visualización, no en datos guardados
- Considerar velocidad y dirección entre puntos

Interpolación en Túneles/Pérdida de Señal:
- Dead Reckoning: estimar posición usando:
  * Última ubicación conocida
  * Velocidad y dirección previas
  * Datos de acelerómetro/giroscopio
- Marcar como "estimado" en UI
- Al recuperar señal GPS, ajustar trayectoria
```

#### 7.1.5 Snap to Roads (Ajuste a Carreteras)

```
if (usuario en vehículo && velocidad > 20 km/h) {
  // Usar Google Roads API o algoritmo map-matching
  ubicacionAjustada = snapToNearestRoad(ubicacion, heading)
  // Mejora la visualización del recorrido
  // No alterar datos originales en BD
}
```

### 7.2 Optimización de Batería

#### 7.2.1 Gestión Inteligente de Frecuencia

```
Lógica de Ajuste Dinámico:

1. Detección de Actividad:
   - STILL (inmóvil): intervalo = 5 minutos
   - WALKING: intervalo = 2 minutos
   - RUNNING: intervalo = 1 minuto
   - DRIVING: intervalo = 30 segundos (alta velocidad requiere precisión)
   - CYCLING: intervalo = 1 minuto

2. Nivel de Batería:
   - 80-100%: frecuencia normal configurada
   - 50-80%: frecuencia normal
   - 20-50%: reducir 50% frecuencia
   - < 20%: modo ahorro (5 minutos mínimo)
   - < 10%: modo crítico (10 minutos + solo WiFi/Network location)

3. Conectividad:
   - WiFi disponible: preferir WiFi location (menor consumo)
   - Solo datos móviles: optimizar según señal
   - Sin conectividad: acumular localmente, enviar al reconectar
```

#### 7.2.2 Batching de Ubicaciones

```
Estrategia de Agrupación:
- Acumular hasta 50 ubicaciones antes de enviar
- O enviar cada 5 minutos (lo que ocurra primero)
- En tiempo real crítico (Admin viendo mapa): envío inmediato
- Comprimir payload con gzip antes de enviar
```

### 7.3 Gestión de Conectividad

#### 7.3.1 Modo Offline

```
Persistencia Local:
- SQLite local en dispositivo
- Almacenar hasta 1000 ubicaciones offline
- Prioridad FIFO si se llena el buffer
- Sincronización automática al recuperar conexión

Sincronización:
- Envío en lotes de 50 ubicaciones
- Reintentos con backoff exponencial (1s, 2s, 4s, 8s)
- Máximo 3 reintentos por lote
- Si falla, esperar a siguiente ventana de sincronización
```

#### 7.3.2 Manejo de Reconexión

```
Al Detectar Conexión:
1. Verificar integridad de datos locales
2. Ordenar por timestamp
3. Enviar lotes más antiguos primero
4. Mostrar progreso en UI ("Sincronizando 45/120 ubicaciones")
5. Limpiar datos locales solo tras confirmación del servidor
```

### 7.4 Geofencing Eficiente

#### 7.4.1 Detección de Entrada/Salida

```
Algoritmo de Detección:

1. Mantener caché local de geofences cercanas (radio 5km)
2. Por cada ubicación capturada:
   
   for each geofence in caché {
     distancia = calcularDistancia(ubicacion, geofence.centro)
     
     if (geofence.tipo == "circular") {
       dentroDeLaZona = (distancia <= geofence.radio)
     } else if (geofence.tipo == "poligonal") {
       dentroDeLaZona = puntoEnPoligono(ubicacion, geofence.coordenadas)
     }
     
     if (dentroDeLaZona && !estadoPrevio.dentroDeZona) {
       // ENTRADA
       registrarEvento("geofence_enter", geofence.id)
       enviarAlerta(geofence.alertasEntrada)
     } else if (!dentroDeLaZona && estadoPrevio.dentroDeZona) {
       // SALIDA
       registrarEvento("geofence_exit", geofence.id)
       enviarAlerta(geofence.alertasSalida)
     }
   }
```

#### 7.4.2 Optimización de Consultas Geoespaciales

```
MongoDB Geospatial Index:
- Index 2dsphere en campo location
- Consulta de geofences cercanas:
  
  db.geofences.find({
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [lng, lat]
        },
        $maxDistance: 5000  // 5km
      }
    },
    organization: organizationId
  })
```

### 7.5 Cálculos y Métricas

#### 7.5.1 Distancia Recorrida

```
Algoritmo Haversine:
- Calcular distancia entre puntos consecutivos
- Sumar solo si distancia > 10 metros (evitar ruido GPS)
- Descartar si velocidad implícita > 150 km/h

function calcularDistanciaHaversine(lat1, lon1, lat2, lon2) {
  R = 6371000; // Radio de la Tierra en metros
  φ1 = lat1 * Math.PI / 180;
  φ2 = lat2 * Math.PI / 180;
  Δφ = (lat2 - lat1) * Math.PI / 180;
  Δλ = (lon2 - lon1) * Math.PI / 180;
  
  a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ/2) * Math.sin(Δλ/2);
  
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c; // Distancia en metros
}
```

#### 7.5.2 Tiempo en Movimiento vs Paradas

```
Detección de Paradas:
- Si velocidad < 5 km/h durante > 3 minutos: considerar parada
- Si radio de ubicaciones < 50 metros durante > 3 minutos: confirmar parada
- Registrar duración y ubicación de cada parada

Métricas Calculadas:
- Tiempo total rastreado
- Tiempo en movimiento (velocidad > 5 km/h)
- Tiempo en paradas
- Número de paradas
- Duración promedio de paradas
```

### 7.6 Comunicación en Tiempo Real

#### 7.6.1 WebSocket para Actualizaciones Live

```
Protocolo WebSocket:

Cliente → Servidor:
{
  "type": "subscribe",
  "channel": "organization:${orgId}",
  "token": "JWT_TOKEN"
}

Servidor → Cliente (ubicación):
{
  "type": "location_update",
  "userId": "...",
  "location": {
    "lat": -13.5319,
    "lng": -71.9675,
    "accuracy": 12,
    "heading": 45,
    "speed": 15.5
  },
  "timestamp": "2024-11-13T10:30:45Z",
  "battery": 85,
  "activity": "driving"
}

Heartbeat:
- Cliente envía ping cada 30 segundos
- Servidor responde con pong
- Si no hay pong en 60 segundos: reconectar
```

#### 7.6.2 Compresión de Datos

```
Optimización de Payload:
- Usar coordenadas con máximo 6 decimales (~10cm precisión)
- Comprimir arrays con MessagePack o Protocol Buffers
- Transmitir solo cambios significativos (delta encoding)

Ejemplo:
En lugar de: {"lat": -13.531912345, "lng": -71.967512345}
Enviar: {"lat": -13.531912, "lng": -71.967512}
Ahorro: ~30% en tamaño de payload
```

---

## 8. PLANES DE MONETIZACIÓN

### 8.1 Estructura de Planes

#### Plan FREE (Gratuito)
**Precio:** $0/mes

**Límites:**
- Hasta 5 usuarios
- 1 organización
- Grupos ilimitados
- Rastreo en tiempo real
- Historial de 7 días
- Soporte por email (48 horas)

**Restricciones:**
- Sin geofencing
- Sin reportes automatizados
- Sin exportación de datos
- Sin personalización de marca
- Publicidad discreta en app (banner inferior)

**Objetivo:** Captar usuarios, validar producto, base para conversión

---

#### Plan BASIC (Básico)
**Precio:** $19/mes por organización + $2/usuario adicional

**Incluye:**
- Hasta 15 usuarios incluidos (luego $2/usuario)
- Rastreo en tiempo real
- Historial de 30 días
- 5 geofences
- Reportes semanales básicos (PDF)
- Exportación de datos (CSV)
- Soporte por email (24 horas)
- Sin publicidad

**Ideal para:** Pequeñas empresas, equipos de campo pequeños

---

#### Plan PRO (Profesional)
**Precio:** $49/mes por organización + $3/usuario adicional

**Incluye:**
- Hasta 50 usuarios incluidos (luego $3/usuario)
- Todo de BASIC +
- Historial de 90 días
- Geofences ilimitadas
- Alertas personalizadas
- Reportes automáticos diarios/semanales/mensuales
- Dashboard de métricas avanzadas
- Exportación avanzada (Excel, PDF con gráficos)
- API de integración
- Soporte por email y chat (12 horas)
- Personalización de marca básica (logo, colores)
- 2 roles personalizados

**Ideal para:** Empresas medianas, logística, servicios de campo

---

#### Plan ENTERPRISE (Empresarial)
**Precio:** Personalizado (desde $199/mes)

**Incluye:**
- Usuarios ilimitados
- Todo de PRO +
- Historial ilimitado (o personalizable)
- Prioridad en actualizaciones
- SLA 99.9% uptime
- Servidor dedicado (opcional)
- Integración personalizada
- Soporte 24/7 (teléfono, chat, email)
- Onboarding personalizado
- Account manager dedicado
- Personalización completa de marca
- Roles y permisos personalizados ilimitados
- Cumplimiento normativo específico (HIPAA, SOC2)
- Backups personalizados
- Reportes personalizados

**Ideal para:** Grandes corporaciones, gobierno, flotas grandes

---

### 8.2 Add-ons Opcionales (Para todos los planes)

**Almacenamiento Extendido:**
- +180 días de historial: $10/mes
- +365 días de historial: $20/mes
- Historial ilimitado: $30/mes

**Usuarios Adicionales (Paquetes):**
- +10 usuarios: $15/mes (BASIC), $25/mes (PRO)
- +50 usuarios: $60/mes (BASIC), $100/mes (PRO)

**Funcionalidades Premium:**
- Reportes personalizados avanzados: $15/mes
- Integración con software específico: $25/mes
- Dashboard web adicional: $10/mes

---

### 8.3 Comparativa de Planes

| Característica | FREE | BASIC | PRO | ENTERPRISE |
|----------------|------|-------|-----|------------|
| **Usuarios incluidos** | 5 | 15 | 50 | Ilimitado |
| **Precio por usuario extra** | - | $2 | $3 | Personalizado |
| **Historial** | 7 días | 30 días | 90 días | Ilimitado |
| **Geofences** | ✗ | 5 | Ilimitados | Ilimitados |
| **Rastreo en tiempo real** | ✓ | ✓ | ✓ | ✓ |
| **Reportes básicos** | ✗ | Semanal | Diario/Semanal/Mensual | Personalizados |
| **Exportación datos** | ✗ | CSV | CSV, Excel, PDF | Todos + API |
| **API de integración** | ✗ | ✗ | ✓ | ✓ |
| **Alertas personalizadas** | ✗ | ✗ | ✓ | ✓ |
| **Personalización marca** | ✗ | ✗ | Básica | Completa |
| **Soporte** | Email 48h | Email 24h | Email/Chat 12h | 24/7 Phone/Chat/Email |
| **SLA** | - | - | - | 99.9% |
| **Publicidad** | Sí | No | No | No |

---

### 8.4 Estrategia de Crecimiento

**Fase 1: Lanzamiento (Meses 1-3)**
- Free plan agresivo para captar usuarios
- Trial de 14 días de plan PRO para nuevos registros
- Onboarding guiado para convertir free a basic

**Fase 2: Consolidación (Meses 4-12)**
- Casos de éxito y testimonios
- Referral program (mes gratis por referido que pague)
- Descuentos por pago anual (2 meses gratis)

**Fase 3: Expansión (Año 2+)**
- Vertical específica (logística, salud, construcción)
- White label para revendedores
- Integraciones con ERP/CRM populares

---

## 9. ARQUITECTURA API REST

### 9.1 Endpoints Principales

#### 9.1.1 Autenticación

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
GET    /api/v1/auth/me
```

#### 9.1.2 Usuarios

```
GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
POST   /api/v1/users/:id/upload-photo
GET    /api/v1/users/:id/preferences
PATCH  /api/v1/users/:id/preferences
```

#### 9.1.3 Organizaciones

```
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/:id
PATCH  /api/v1/organizations/:id
DELETE /api/v1/organizations/:id
GET    /api/v1/organizations/:id/settings
PATCH  /api/v1/organizations/:id/settings
POST   /api/v1/organizations/:id/invite
GET    /api/v1/organizations/:id/subscription
PATCH  /api/v1/organizations/:id/subscription
```

#### 9.1.4 Miembros

```
GET    /api/v1/organizations/:orgId/members
POST   /api/v1/organizations/:orgId/members
GET    /api/v1/organizations/:orgId/members/:memberId
PATCH  /api/v1/organizations/:orgId/members/:memberId
DELETE /api/v1/organizations/:orgId/members/:memberId
PATCH  /api/v1/organizations/:orgId/members/:memberId/role
GET    /api/v1/organizations/:orgId/members/:memberId/tracking-status
PATCH  /api/v1/organizations/:orgId/members/:memberId/tracking-status
```

#### 9.1.5 Grupos

```
GET    /api/v1/organizations/:orgId/groups
POST   /api/v1/organizations/:orgId/groups
GET    /api/v1/organizations/:orgId/groups/:groupId
PATCH  /api/v1/organizations/:orgId/groups/:groupId
DELETE /api/v1/organizations/:orgId/groups/:groupId
POST   /api/v1/organizations/:orgId/groups/:groupId/members
DELETE /api/v1/organizations/:orgId/groups/:groupId/members/:memberId
```

#### 9.1.6 Ubicaciones

```
POST   /api/v1/locations                     // Enviar ubicación (desde app)
POST   /api/v1/locations/batch               // Enviar múltiples ubicaciones
GET    /api/v1/locations/current/:userId     // Ubicación actual de usuario
GET    /api/v1/locations/history/:userId     // Historial de usuario
GET    /api/v1/organizations/:orgId/locations/live  // Todas las ubicaciones en tiempo real
GET    /api/v1/organizations/:orgId/locations/history  // Historial de organización
```

#### 9.1.7 Geofences

```
GET    /api/v1/organizations/:orgId/geofences
POST   /api/v1/organizations/:orgId/geofences
GET    /api/v1/organizations/:orgId/geofences/:geofenceId
PATCH  /api/v1/organizations/:orgId/geofences/:geofenceId
DELETE /api/v1/organizations/:orgId/geofences/:geofenceId
GET    /api/v1/organizations/:orgId/geofences/:geofenceId/events
```

#### 9.1.8 Alertas

```
GET    /api/v1/organizations/:orgId/alerts
GET    /api/v1/alerts/:alertId
PATCH  /api/v1/alerts/:alertId/acknowledge
DELETE /api/v1/alerts/:alertId
POST   /api/v1/alerts/sos                    // Enviar alerta SOS
```

#### 9.1.9 Reportes

```
GET    /api/v1/organizations/:orgId/reports
POST   /api/v1/organizations/:orgId/reports/generate
GET    /api/v1/reports/:reportId
GET    /api/v1/reports/:reportId/download
DELETE /api/v1/reports/:reportId
```

#### 9.1.10 Dashboards y Métricas

```
GET    /api/v1/organizations/:orgId/dashboard
GET    /api/v1/organizations/:orgId/metrics/summary
GET    /api/v1/organizations/:orgId/metrics/activity
GET    /api/v1/users/:userId/metrics
```

### 9.2 Formato de Respuestas

#### Respuesta Exitosa

```json
{
  "success": true,
  "data": {
    // Datos solicitados
  },
  "message": "Operación exitosa",
  "timestamp": "2024-11-13T10:30:45Z"
}
```

#### Respuesta con Paginación

```json
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

#### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "El email proporcionado no es válido",
    "field": "email",
    "details": {}
  },
  "timestamp": "2024-11-13T10:30:45Z"
}
```

### 9.3 Códigos de Error Personalizados

```
AUTH_001: Token inválido o expirado
AUTH_002: Credenciales incorrectas
AUTH_003: Usuario no verificado
AUTH_004: Cuenta bloqueada

PERM_001: Permiso denegado
PERM_002: Rol insuficiente
PERM_003: Organización suspendida

LIMIT_001: Límite de usuarios alcanzado
LIMIT_002: Límite de geofences alcanzado
LIMIT_003: Límite de almacenamiento alcanzado

DATA_001: Recurso no encontrado
DATA_002: Datos duplicados
DATA_003: Validación fallida
```

---

## 10. CONSIDERACIONES DE SEGURIDAD Y PRIVACIDAD

### 10.1 Cumplimiento Legal

**GDPR (Reglamento General de Protección de Datos - UE)**
- Consentimiento explícito y documentado
- Derecho al olvido implementado
- Portabilidad de datos
- Notificación de brechas en 72 horas
- DPO (Data Protection Officer) designado para Enterprise

**LGPD (Lei Geral de Proteção de Dados - Brasil)**
- Similar a GDPR
- Consentimiento específico y destacado
- Bases legales para tratamiento de datos
- Canal de comunicación con titular de datos

**Privacidad Laboral**
- Rastreo solo durante horarios laborales (configurable)
- Transparencia total con empleados
- No rastreo en áreas sensibles (baños, comedores) mediante geofences de exclusión
- Política de uso aceptable clara

### 10.2 Mejores Prácticas de Seguridad

**Autenticación Robusta**
- 2FA opcional para Admin/Owner
- Políticas de contraseñas fuertes
- Sesiones con timeout automático
- Logout automático tras 30 días de inactividad

**Encriptación**
- TLS 1.3 en todas las comunicaciones
- Certificados SSL con renovación automática
- Datos sensibles encriptados en BD
- Backups encriptados con AES-256

**Auditoría y Logs**
- Logs inmutables de accesos a ubicaciones
- Registro de cambios en permisos
- Retención de logs según regulaciones
- Anonimización de datos en logs

**Rate Limiting**
- Protección contra ataques DDoS
- Límites por IP y por usuario
- Bloqueo temporal tras intentos sospechosos

### 10.3 Transparencia con Usuarios

**Información Clara sobre Rastreo**
- Notificación persistente en dispositivo mientras se rastrea
- Indicador visual en app
- Centro de privacidad en configuración
- Historial de accesos a ubicación

**Control del Usuario**
- Pausar rastreo temporalmente (si permitido)
- Ver quién accedió a su ubicación
- Descargar sus datos en cualquier momento
- Revocar consentimiento fácilmente

---

## 11. ROADMAP DE DESARROLLO

### 11.1 MVP (Meses 1-3)

**Mes 1: Infraestructura y Base**
- Configuración de AWS (ECS, MongoDB Atlas, S3)
- Estructura de proyecto Flutter
- Sistema de autenticación básico
- Modelo de datos inicial

**Mes 2: Funcionalidades Core**
- Rastreo de ubicación en tiempo real
- Mapa con usuarios activos
- Sistema de roles básico (Owner, Admin, Member)
- Invitación de usuarios
- Almacenamiento de historial

**Mes 3: Pulido y Lanzamiento**
- UI/UX refinado
- Tests de integración
- Optimización de batería
- Documentación de usuario
- Publicación en Play Store (beta cerrada)

### 11.2 Post-MVP (Meses 4-6)

**Funcionalidades Avanzadas**
- Geofencing completo
- Reportes automatizados
- Dashboard de métricas
- Sistema de alertas
- Exportación de datos
- Plan PRO implementado

### 11.3 Futuras Mejoras (Meses 7-12)

**Optimizaciones**
- WebSocket para tiempo real
- Algoritmos avanzados de filtrado
- Integración con Waze/Google Traffic
- Modo offline mejorado
- Push notifications avanzadas

**Nuevas Funcionalidades**
- Chat interno entre miembros
- Asignación de tareas geolocalizadas
- Reconocimiento de actividad (conducir, caminar, correr)
- Integración con ERP/CRM
- API pública para integraciones

---

## 12. ESTIMACIÓN DE COSTOS (AWS)

### 12.1 Infraestructura Mensual (Estimación para 1000 usuarios activos)

**Compute (ECS Fargate)**
- 4 tareas (containers): 0.5 vCPU, 1GB RAM cada una
- Costo estimado: $50/mes

**Base de Datos (MongoDB Atlas)**
- Cluster M10 (replica set)
- 10GB storage, 2GB RAM
- Costo estimado: $57/mes

**Almacenamiento (S3)**
- 100GB datos
- 50,000 requests/mes
- Costo estimado: $3/mes

**API Gateway**
- 1M requests/mes
- Costo estimado: $3.50/mes

**CloudWatch (Logs y Monitoreo)**
- Logs básicos
- Costo estimado: $10/mes

**ElastiCache (Redis)**
- t3.micro
- Costo estimado: $12/mes

**Data Transfer**
- 100GB salida
- Costo estimado: $9/mes

**TOTAL ESTIMADO:** ~$145/mes

**Nota:** Costos escalan con usuarios. Para 10,000 usuarios activos, estimar ~$800-$1000/mes.

### 12.2 Servicios Externos

**Firebase (Autenticación + Notificaciones)**
- Plan Blaze (pago por uso)
- Estimado: $20-30/mes

**Google Maps Platform**
- Maps JavaScript API
- 100,000 cargas de mapa/mes
- Con crédito mensual de $200: $0-50/mes

**Stripe (Pagos)**
- 2.9% + $0.30 por transacción
- Variable según ingresos

**Email (SendGrid / Postmark)**
- 10,000 emails/mes
- Estimado: $10-15/mes

---

## 13. MÉTRICAS DE ÉXITO (KPIs)

### 13.1 Métricas de Producto

**Adopción**
- Usuarios registrados
- Organizaciones activas
- Tasa de conversión Free → Basic/Pro
- DAU/MAU ratio (Daily/Monthly Active Users)

**Engagement**
- Tiempo promedio en app
- Frecuencia de uso semanal
- Ubicaciones rastreadas por usuario
- Uso de funcionalidades premium

**Retención**
- Tasa de retención a 7, 30, 90 días
- Churn rate mensual
- Lifetime Value (LTV) por usuario

### 13.2 Métricas Técnicas

**Performance**
- Latencia promedio de API (< 500ms)
- Uptime (> 99.5%)
- Tasa de errores (< 0.1%)
- Tiempo de carga de mapa (< 3s)

**Precisión de Rastreo**
- Precisión promedio de ubicaciones (< 20m)
- Tasa de ubicaciones descartadas (< 5%)
- Puntos anómalos detectados

---

## 14. DOCUMENTACIÓN TÉCNICA

### 14.1 Estructura de Documentación

```
docs/
├── api/
│   ├── authentication.md
│   ├── endpoints.md
│   ├── websockets.md
│   └── errors.md
├── architecture/
│   ├── system-design.md
│   ├── database-schema.md
│   └── infrastructure.md
├── guides/
│   ├── getting-started.md
│   ├── admin-guide.md
│   ├── user-guide.md
│   └── developer-guide.md
├── deployment/
│   ├── aws-setup.md
│   ├── ci-cd.md
│   └── monitoring.md
└── compliance/
    ├── gdpr.md
    ├── privacy-policy.md
    └── terms-of-service.md
```

### 14.2 Documentación de Código

**Estándares:**
- Comentarios en funciones complejas
- JSDoc para funciones públicas de API
- Dartdoc para código Flutter
- README en cada módulo

---

## 15. TESTING Y CALIDAD

### 15.1 Estrategia de Testing

**Unit Tests**
- Cobertura mínima: 70%
- Funciones críticas: 90%
- Algoritmos de rastreo: 95%

**Integration Tests**
- Flujos completos de usuario
- Integración con APIs externas
- Sincronización de datos

**E2E Tests**
- Flujos críticos (registro, rastreo, reportes)
- Pruebas en dispositivos reales
- Pruebas de regresión automatizadas

**Performance Tests**
- Load testing (1000 usuarios concurrentes)
- Stress testing (picos de tráfico)
- Pruebas de latencia

### 15.2 Herramientas

- Flutter: flutter_test, integration_test
- Backend: Jest, Supertest
- E2E: Detox, Maestro
- Load Testing: k6, Artillery
- Monitoring: Sentry, Firebase Crashlytics

---

## 16. CONSIDERACIONES FINALES

### 16.1 Riesgos Identificados

**Técnicos:**
- Precisión de GPS en interiores
- Consumo excesivo de batería
- Sincronización en zonas con mala conectividad
- Escalabilidad de WebSockets con muchos usuarios

**De Negocio:**
- Competencia con apps establecidas (Life360, Find My Friends)
- Resistencia de usuarios a ser rastreados
- Complejidad de cumplimiento legal por región
- Costos de infraestructura creciendo más rápido que ingresos

**Mitigaciones:**
- MVP enfocado en nicho específico (empresas, no consumidores)
- Transparencia y control total para usuarios rastreados
- Arquitectura escalable desde el inicio
- Modelo de monetización validado antes de escalar

### 16.2 Próximos Pasos

1. **Validación de Mercado**
   - Entrevistas con potenciales clientes (pequeñas empresas)
   - Beta privada con 10-20 empresas
   - Iteración basada en feedback

2. **Desarrollo Iterativo**
   - Sprints de 2 semanas
   - Demos semanales con stakeholders
   - Retrospectivas y ajustes

3. **Go-to-Market**
   - Landing page con captación de leads
   - Contenido educativo sobre beneficios del rastreo laboral
   - Casos de éxito y testimonios
   - Estrategia de SEO y SEM

---

## ANEXOS

### A. Glosario de Términos

- **Geofencing:** Perímetro virtual en un área geográfica real
- **Dead Reckoning:** Estimación de posición basada en dirección y velocidad previas
- **Haversine:** Fórmula para calcular distancia entre dos puntos en una esfera
- **Rate Limiting:** Limitación de número de peticiones por tiempo
- **Sharding:** Particionamiento horizontal de base de datos
- **TTL (Time To Live):** Tiempo de vida de un registro antes de ser eliminado automáticamente

### B. Referencias

- Google Maps Platform Documentation
- Flutter Location Plugin Documentation
- MongoDB Geospatial Queries Documentation
- GDPR Official Text
- AWS Best Practices for Location-Based Services
- Firebase Cloud Messaging Documentation

