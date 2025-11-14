const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Member = require('../models/Member');
const config = require('../config/environment');
const logger = require('../utils/logger');

/**
 * Inicializa el servidor WebSocket
 * @param {http.Server} server - Servidor HTTP
 * @returns {SocketIO.Server}
 */
function initializeWebSocket(server) {
  const io = socketIO(server, {
    cors: {
      origin: config.frontendUrl || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: config.websocket.path,
  });

  // ==========================================
  // Middleware de autenticación para sockets
  // ==========================================
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Token no proporcionado'));
      }

      // Verificar token
      const decoded = jwt.verify(token, config.jwt.secret);

      if (decoded.type !== 'access') {
        return next(new Error('Tipo de token inválido'));
      }

      // Buscar usuario
      const user = await User.findById(decoded.userId);

      if (!user || user.status !== 'active') {
        return next(new Error('Usuario no encontrado o inactivo'));
      }

      // Adjuntar usuario al socket
      socket.user = user;
      socket.userId = user._id.toString();

      next();
    } catch (error) {
      logger.error('Error en auth de WebSocket:', error);
      next(new Error('Autenticación fallida'));
    }
  });

  // ==========================================
  // Eventos de conexión
  // ==========================================
  io.on('connection', (socket) => {
    logger.info(`✅ Usuario conectado a WebSocket: ${socket.user.email} (${socket.id})`);

    // ------------------------------------------
    // Suscribirse a canal de organización
    // ------------------------------------------
    socket.on('subscribe:organization', async (orgId) => {
      try {
        // Verificar que el usuario es miembro
        const member = await Member.findOne({
          organizationId: orgId,
          userId: socket.userId,
          status: 'active',
        });

        if (!member) {
          socket.emit('error', {
            message: 'No eres miembro de esta organización',
          });
          return;
        }

        // Unirse a la sala de la organización
        const roomName = `org:${orgId}`;
        socket.join(roomName);

        logger.info(`Usuario ${socket.user.email} se unió a ${roomName}`);

        // Confirmar suscripción
        socket.emit('subscribed:organization', {
          organizationId: orgId,
          message: 'Suscrito exitosamente',
        });

        // Notificar a otros miembros que este usuario se conectó
        socket.to(roomName).emit('user:online', {
          userId: socket.userId,
          displayName: socket.user.displayName,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error en subscribe:organization:', error);
        socket.emit('error', {
          message: 'Error al suscribirse a la organización',
        });
      }
    });

    // ------------------------------------------
    // Desuscribirse de organización
    // ------------------------------------------
    socket.on('unsubscribe:organization', (orgId) => {
      const roomName = `org:${orgId}`;
      socket.leave(roomName);

      logger.info(`Usuario ${socket.user.email} salió de ${roomName}`);

      // Notificar a otros miembros
      socket.to(roomName).emit('user:offline', {
        userId: socket.userId,
        displayName: socket.user.displayName,
        timestamp: new Date().toISOString(),
      });
    });

    // ------------------------------------------
    // Ping/Pong (heartbeat)
    // ------------------------------------------
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
      });
    });

    // ------------------------------------------
    // Desconexión
    // ------------------------------------------
    socket.on('disconnect', (reason) => {
      logger.info(
        `❌ Usuario desconectado: ${socket.user.email} (${socket.id}) - Razón: ${reason}`
      );

      // Notificar a todas las salas que el usuario estaba suscrito
      const rooms = Array.from(socket.rooms).filter((room) => room !== socket.id);

      rooms.forEach((room) => {
        socket.to(room).emit('user:offline', {
          userId: socket.userId,
          displayName: socket.user.displayName,
          timestamp: new Date().toISOString(),
        });
      });
    });
  });

  logger.info('✅ WebSocket inicializado correctamente');

  return io;
}

/**
 * Emitir evento de ubicación a una organización
 * @param {SocketIO.Server} io - Instancia de Socket.IO
 * @param {string} organizationId - ID de la organización
 * @param {Object} locationData - Datos de ubicación
 */
function emitLocationUpdate(io, organizationId, locationData) {
  const roomName = `org:${organizationId}`;

  io.to(roomName).emit('location:update', {
    userId: locationData.userId.toString(),
    location: {
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      timestamp: locationData.timestamp,
      activityType: locationData.activityType,
      batteryLevel: locationData.batteryLevel,
      speed: locationData.speed,
      heading: locationData.heading,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emitir alerta a una organización
 * @param {SocketIO.Server} io - Instancia de Socket.IO
 * @param {string} organizationId - ID de la organización
 * @param {Object} alertData - Datos de la alerta
 */
function emitAlert(io, organizationId, alertData) {
  const roomName = `org:${organizationId}`;

  io.to(roomName).emit('alert:new', {
    alertId: alertData._id.toString(),
    type: alertData.type,
    severity: alertData.severity,
    userId: alertData.userId.toString(),
    title: alertData.title,
    message: alertData.message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Emitir evento de geofence a una organización
 * @param {SocketIO.Server} io - Instancia de Socket.IO
 * @param {string} organizationId - ID de la organización
 * @param {Object} eventData - Datos del evento
 */
function emitGeofenceEvent(io, organizationId, eventData) {
  const roomName = `org:${organizationId}`;

  io.to(roomName).emit('geofence:event', {
    eventType: eventData.type, // 'enter' o 'exit'
    userId: eventData.userId.toString(),
    geofenceId: eventData.geofenceId.toString(),
    geofenceName: eventData.geofenceName,
    timestamp: new Date().toISOString(),
  });
}

module.exports = {
  initializeWebSocket,
  emitLocationUpdate,
  emitAlert,
  emitGeofenceEvent,
};
