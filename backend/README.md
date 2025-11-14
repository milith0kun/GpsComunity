# 🚀 GPS Community Backend

Backend API para GPS Community - Sistema de rastreo de ubicación en tiempo real.

## 📋 Stack Tecnológico

- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.x
- **Base de Datos:** MongoDB Atlas
- **WebSocket:** Socket.io
- **Autenticación:** JWT + Firebase Admin (opcional)
- **Cache:** Redis (opcional)
- **Validación:** express-validator
- **Logging:** Winston + Morgan
- **Seguridad:** Helmet, CORS, Rate Limiting

## 🏗️ Arquitectura

```
backend/
├── src/
│   ├── config/          # Configuraciones (DB, Firebase, Redis)
│   ├── models/          # Modelos de MongoDB (Mongoose)
│   ├── controllers/     # Controladores (lógica de negocio)
│   ├── routes/          # Rutas de la API
│   ├── middleware/      # Middlewares (auth, RBAC, error, etc.)
│   ├── services/        # Servicios (lógica compleja)
│   ├── utils/           # Utilidades (logger, validators, etc.)
│   ├── websocket/       # Servidor WebSocket
│   ├── jobs/            # Jobs programados
│   ├── validators/      # Esquemas de validación
│   └── app.js          # Configuración de Express
├── tests/               # Tests
├── scripts/             # Scripts de utilidad
├── server.js           # Punto de entrada
├── package.json
└── .env.example        # Ejemplo de variables de entorno
```

## 🚀 Quick Start

### 1. Requisitos Previos

- Node.js 18+ y npm
- MongoDB Atlas (cuenta configurada)
- Git

### 2. Instalación

```bash
# Clonar el repositorio (si aún no lo hiciste)
cd backend

# Instalar dependencias
npm install
```

### 3. Configuración

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
NODE_ENV=development
PORT=3000

# MongoDB Atlas URI (CAMBIAR POR TU URI)
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxx.mongodb.net/gps_community_dev?retryWrites=true&w=majority

# JWT Secret (GENERAR UNO NUEVO)
JWT_SECRET=tu-super-secret-key-aqui-muy-largo-y-seguro
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

**⚠️ IMPORTANTE:**
- Reemplaza `MONGODB_URI` con tu URI real de MongoDB Atlas
- Genera un `JWT_SECRET` fuerte (min 32 caracteres)
- En producción, usa variables de entorno seguras (no commits .env)

### 4. Iniciar Servidor

```bash
# Desarrollo (con auto-reload)
npm run dev

# Producción
npm start
```

El servidor estará disponible en:
- **API:** http://localhost:3000/api/v1
- **Health:** http://localhost:3000/health
- **WebSocket:** ws://localhost:3000

## 📊 MongoDB Atlas - Configuración

### Obtener tu URI de MongoDB

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Crea un cluster (si no lo tienes)
3. Crea un usuario de base de datos:
   - Database Access → Add New Database User
   - Username: `gps_user`
   - Password: (genera una segura)
4. Whitelist tu IP:
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
5. Obtén la URI de conexión:
   - Clusters → Connect → Connect your application
   - Copia la URI: `mongodb+srv://gps_user:<password>@cluster0.xxxx.mongodb.net/`

### Configurar Bases de Datos

El backend crea automáticamente las siguientes bases de datos según el ambiente:

- `gps_community_dev` - Desarrollo
- `gps_community_test` - Testing
- `gps_community_staging` - Staging
- `gps_community_prod` - Producción

Los índices y colecciones se crean automáticamente cuando se guardan documentos.

## 🔑 Variables de Entorno

### Esenciales

```env
NODE_ENV=development           # Ambiente: development, test, production
PORT=3000                      # Puerto del servidor
MONGODB_URI=mongodb+srv://...  # URI de MongoDB Atlas
JWT_SECRET=your-secret-key     # Secret para JWT
FRONTEND_URL=http://...        # URL del frontend (CORS)
```

### Opcionales

```env
# Firebase (para autenticación con Firebase)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Redis (para cache)
REDIS_ENABLED=false
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (para notificaciones)
EMAIL_ENABLED=false
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=
EMAIL_PASSWORD=

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_LOGIN_MAX=10

# Logging
LOG_LEVEL=debug
```

Ver `.env.example` para lista completa.

## 🔐 Autenticación

El backend usa **JWT (JSON Web Tokens)** para autenticación:

### Flujo de Autenticación

1. Usuario se registra o hace login
2. Backend genera dos tokens:
   - **Access Token** (15 min) - Para requests normales
   - **Refresh Token** (30 días) - Para renovar access token
3. Cliente envía access token en cada request:
   ```
   Authorization: Bearer <access_token>
   ```

### Endpoints de Autenticación

```
POST   /api/v1/auth/register          - Registrar usuario
POST   /api/v1/auth/login             - Login
POST   /api/v1/auth/refresh-token     - Renovar access token
POST   /api/v1/auth/logout            - Logout
GET    /api/v1/auth/me                - Obtener usuario actual
POST   /api/v1/auth/forgot-password   - Recuperar contraseña
```

## 🛡️ Control de Acceso (RBAC)

El sistema implementa **RBAC (Role-Based Access Control)** con 4 roles:

### Roles

1. **Owner** - Propietario de la organización
   - Todos los permisos
   - Puede eliminar la organización
   - Puede gestionar suscripción

2. **Admin** - Administrador
   - Casi todos los permisos
   - No puede eliminar org ni gestionar suscripción

3. **Manager** - Gerente
   - Ver todas las ubicaciones
   - Gestionar grupos y geofences
   - Ver reportes

4. **Member** - Miembro
   - Solo ver su propia ubicación
   - Permisos muy limitados

### Permisos por Rol

Ver `src/utils/constants.js` → `ROLE_PERMISSIONS` para matriz completa.

## 📍 API Endpoints

### Health Check

```
GET /health
Response: { success: true, message: "API is running", uptime: 123 }
```

### Autenticación

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Tracking (TODO: Implementar controladores)

```
POST   /api/v1/locations              - Enviar ubicación
POST   /api/v1/locations/batch        - Enviar múltiples ubicaciones
GET    /api/v1/locations/current/:userId
GET    /api/v1/locations/history/:userId
GET    /api/v1/organizations/:orgId/locations/live
```

### Organizaciones (TODO: Implementar controladores)

```
GET    /api/v1/organizations
POST   /api/v1/organizations
GET    /api/v1/organizations/:id
PATCH  /api/v1/organizations/:id
DELETE /api/v1/organizations/:id
```

*Ver `docs/BACKEND_STRUCTURE.md` para lista completa de endpoints.*

## 🔌 WebSocket

El backend incluye un servidor WebSocket para comunicación en tiempo real.

### Conectar

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: '<access_token>' // JWT access token
  }
});
```

### Eventos del Cliente → Servidor

```javascript
// Suscribirse a organización
socket.emit('subscribe:organization', organizationId);

// Desuscribirse
socket.emit('unsubscribe:organization', organizationId);

// Heartbeat
socket.emit('ping');
```

### Eventos del Servidor → Cliente

```javascript
// Confirmación de suscripción
socket.on('subscribed:organization', (data) => {
  console.log('Suscrito a:', data.organizationId);
});

// Nueva ubicación
socket.on('location:update', (data) => {
  console.log('Nueva ubicación:', data.location);
});

// Nueva alerta
socket.on('alert:new', (data) => {
  console.log('Nueva alerta:', data.type);
});

// Usuario online/offline
socket.on('user:online', (data) => {
  console.log('Usuario conectado:', data.userId);
});

socket.on('user:offline', (data) => {
  console.log('Usuario desconectado:', data.userId);
});
```

## 📦 Modelos de Datos

### User
- Email, password, displayName
- Preferencias (idioma, timezone, notificaciones)
- Estado de la cuenta

### Organization
- Nombre, slug, descripción
- Suscripción (plan, status, límites)
- Configuración de tracking
- Estadísticas

### Member
- Relación User ↔ Organization
- Rol (owner, admin, manager, member)
- Permisos personalizados
- Estado de tracking

### Location
- Coordenadas GPS (lat, lng)
- Precisión, altitud, velocidad
- Tipo de actividad
- Batería del dispositivo
- **Índice geoespacial 2dsphere**
- **TTL de 90 días**

### LocationSnapshot
- Última ubicación de cada usuario
- Acceso rápido sin buscar en historial

### Geofence
- Geometría (Polygon o Circle)
- Configuración de alertas
- Programación (días y horarios)

### Alert
- Tipo (SOS, geofence, batería baja)
- Severidad (info, warning, critical)
- Estado (new, acknowledged, resolved)

Ver modelos completos en `src/models/`

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm test -- --coverage

# Tests en modo watch
npm run test:watch
```

## 📝 Scripts Disponibles

```bash
npm start        # Iniciar servidor (producción)
npm run dev      # Iniciar con nodemon (desarrollo)
npm test         # Ejecutar tests
npm run lint     # Linter (ESLint)
npm run format   # Formatear código (Prettier)
npm run seed     # Poblar DB con datos de prueba
```

## 🔒 Seguridad

### Implementado

✅ Helmet - Headers de seguridad
✅ CORS - Configuración restrictiva
✅ Rate Limiting - Prevención de fuerza bruta
✅ MongoDB Sanitize - Prevención de NoSQL injection
✅ JWT - Autenticación con tokens
✅ Bcrypt - Hash de contraseñas (10 rounds)
✅ Input Validation - express-validator

### Recomendaciones

- 🔐 Usa HTTPS en producción
- 🔑 Rota secretos regularmente
- 📊 Monitorea logs de seguridad
- 🚨 Configura alertas para eventos sospechosos
- 🔒 Usa variables de entorno, nunca commits secretos

## 📊 Logging

Logs se guardan en:
- `logs/all.log` - Todos los logs
- `logs/error.log` - Solo errores
- Console - Output en desarrollo

Niveles de log:
- `error` - Errores críticos
- `warn` - Advertencias
- `info` - Información general
- `http` - Requests HTTP
- `debug` - Debug detallado

## 🚀 Deployment

### Opción 1: Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Opción 2: Heroku

```bash
# Login
heroku login

# Crear app
heroku create gps-community-api

# Configurar variables
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set JWT_SECRET="..."

# Deploy
git push heroku main
```

### Variables de Entorno en Producción

Asegúrate de configurar TODAS las variables críticas:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `FRONTEND_URL`

## 🐛 Debugging

### Logs

```bash
# Ver logs en tiempo real
tail -f logs/all.log

# Ver solo errores
tail -f logs/error.log
```

### Errores Comunes

**Error: MONGODB_URI is required**
- Solución: Configura `MONGODB_URI` en `.env`

**Error: connect ECONNREFUSED**
- Solución: Verifica que MongoDB esté corriendo

**Error: JWT_SECRET must be changed in production**
- Solución: Cambia `JWT_SECRET` por uno seguro

**Error 401: Token no proporcionado**
- Solución: Incluye header `Authorization: Bearer <token>`

## 📚 Documentación Adicional

- [Estructura del Backend](../docs/BACKEND_STRUCTURE.md) - Arquitectura completa
- [Especificación Técnica](../docs/TECHNICAL_SPECIFICATION.md) - Specs del proyecto

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

---

**Estado:** 🟡 En Desarrollo

**Próximos pasos:**
1. Implementar controladores y servicios
2. Implementar rutas completas
3. Agregar tests
4. Documentar API con Swagger
5. Implementar jobs programados
6. Optimizar performance

Para más información, consulta la [documentación del proyecto](../docs/).
