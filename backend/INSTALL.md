# 🚀 GPS Community Backend - Instalación Rápida

## ✅ Instalación en 5 Pasos

### 1️⃣ Navegar al directorio del backend

```bash
cd backend
```

### 2️⃣ Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias:
- express, mongoose, socket.io
- jwt, bcrypt, nodemailer
- winston, helmet, cors
- Y más...

### 3️⃣ Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Editar `.env` con tus valores:

```env
NODE_ENV=development
PORT=3000

# ⚠️ IMPORTANTE: Reemplaza esta URI con tu MongoDB Atlas real
MONGODB_URI=mongodb+srv://tu_usuario:tu_password@cluster0.xxxx.mongodb.net/gps_community_dev?retryWrites=true&w=majority

# ⚠️ IMPORTANTE: Genera un secret fuerte (mínimo 32 caracteres)
JWT_SECRET=genera-un-secret-muy-largo-y-aleatorio-aqui-32-chars-minimum

# Frontend URL (para CORS)
FRONTEND_URL=http://localhost:3000
```

**💡 Cómo obtener tu MongoDB URI:**

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com/)
2. Haz clic en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Copia la URI y reemplaza `<password>` con tu contraseña

### 4️⃣ Iniciar el servidor

**Desarrollo (con auto-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

### 5️⃣ Verificar que funciona

Abre tu navegador en:
```
http://localhost:3000/health
```

Deberías ver:
```json
{
  "success": true,
  "message": "GPS Community API is running",
  "uptime": 12.34
}
```

---

## 🧪 Probar la API

### Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "displayName": "Test User"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

Esto te dará un `accessToken` que puedes usar para hacer requests autenticados:

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

---

## 📊 Endpoints Disponibles

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Renovar token
- `GET /api/v1/auth/me` - Usuario actual
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/forgot-password` - Recuperar contraseña
- `POST /api/v1/auth/reset-password` - Resetear contraseña
- `POST /api/v1/auth/change-password` - Cambiar contraseña

### Tracking/Ubicaciones
- `POST /api/v1/locations` - Enviar ubicación
- `POST /api/v1/locations/batch` - Enviar múltiples ubicaciones
- `GET /api/v1/locations/current/:userId` - Ubicación actual
- `GET /api/v1/locations/history/:userId` - Historial
- `GET /api/v1/locations/stats/:userId` - Estadísticas
- `GET /api/v1/locations/nearby` - Ubicaciones cercanas

### Organizaciones (requiere membership)
- `GET /api/v1/organizations/:orgId/locations/live` - Ubicaciones en vivo
- `GET /api/v1/organizations/:orgId/locations/history` - Historial de org

---

## 🔍 Debugging

### Ver logs en tiempo real

```bash
# Todos los logs
tail -f logs/all.log

# Solo errores
tail -f logs/error.log
```

### Errores Comunes

**Error: MONGODB_URI is required**
```bash
# Solución: Configura MONGODB_URI en .env
```

**Error: connect ECONNREFUSED**
```bash
# Solución: Verifica que MongoDB Atlas esté accesible
# Verifica tu IP en Network Access de MongoDB Atlas
```

**Error: JWT_SECRET must be changed in production**
```bash
# Solución: Cambia JWT_SECRET en .env por un valor seguro
```

---

## 📝 Scripts Disponibles

```bash
npm start          # Iniciar servidor (producción)
npm run dev        # Iniciar con nodemon (desarrollo)
npm test           # Ejecutar tests
npm run lint       # Linter (ESLint)
npm run format     # Formatear código (Prettier)
```

---

## 🌐 WebSocket

El servidor WebSocket está disponible en:
```
ws://localhost:3000
```

Conectar desde el cliente:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'TU_ACCESS_TOKEN'
  }
});

// Suscribirse a organización
socket.emit('subscribe:organization', 'ORGANIZATION_ID');

// Escuchar ubicaciones
socket.on('location:update', (data) => {
  console.log('Nueva ubicación:', data);
});
```

---

## 🔐 Seguridad

### Configurado
- ✅ Helmet (security headers)
- ✅ CORS restrictivo
- ✅ Rate limiting
- ✅ MongoDB sanitization
- ✅ JWT tokens
- ✅ Bcrypt passwords

### En Producción
- 🔒 Usa HTTPS
- 🔑 Cambia JWT_SECRET
- 📊 Monitorea logs
- 🚨 Configura alertas

---

## 📚 Documentación Completa

- [README.md](./README.md) - Documentación completa
- [../docs/BACKEND_STRUCTURE.md](../docs/BACKEND_STRUCTURE.md) - Arquitectura detallada

---

## 🆘 Ayuda

Si tienes problemas:

1. Verifica los logs: `tail -f logs/all.log`
2. Revisa que MongoDB Atlas esté configurado
3. Verifica que todas las variables de .env estén configuradas
4. Asegúrate de tener Node.js 18+ instalado

---

**¡Listo!** Tu backend está corriendo 🚀

Para conectar el frontend Flutter, usa:
- **API Base URL:** `http://localhost:3000/api/v1`
- **WebSocket URL:** `ws://localhost:3000`
