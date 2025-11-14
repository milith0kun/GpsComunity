require('dotenv').config();
const http = require('http');
const createApp = require('./src/app');
const config = require('./src/config/environment');
const { connectDB } = require('./src/config/database');
const { initializeFirebase } = require('./src/config/firebase');
const { initializeRedis } = require('./src/config/redis');
const { initializeWebSocket } = require('./src/websocket');
const logger = require('./src/utils/logger');

/**
 * Inicia el servidor
 */
const startServer = async () => {
  try {
    logger.info('🚀 Iniciando GPS Community Backend...');
    logger.info(`📊 Ambiente: ${config.env}`);
    logger.info(`🔧 Puerto: ${config.port}`);

    // ==========================================
    // 1. Conectar a MongoDB
    // ==========================================
    logger.info('Conectando a MongoDB...');
    await connectDB();

    // ==========================================
    // 2. Inicializar servicios opcionales
    // ==========================================

    // Firebase (opcional)
    if (config.firebase.enabled) {
      logger.info('Inicializando Firebase...');
      initializeFirebase();
    } else {
      logger.info('⏭️  Firebase deshabilitado (skipping)');
    }

    // Redis (opcional)
    if (config.redis.enabled) {
      logger.info('Conectando a Redis...');
      initializeRedis();
    } else {
      logger.info('⏭️  Redis deshabilitado (skipping)');
    }

    // ==========================================
    // 3. Crear aplicación Express
    // ==========================================
    const app = createApp();

    // ==========================================
    // 4. Crear servidor HTTP
    // ==========================================
    const server = http.createServer(app);

    // ==========================================
    // 5. Inicializar WebSocket
    // ==========================================
    logger.info('Inicializando WebSocket...');
    const io = initializeWebSocket(server);

    // Hacer io accesible desde controllers (para emitir eventos)
    app.set('io', io);

    // ==========================================
    // 6. Iniciar servidor
    // ==========================================
    server.listen(config.port, () => {
      logger.info('');
      logger.info('✅ ========================================');
      logger.info('✅  GPS Community Backend is READY!');
      logger.info('✅ ========================================');
      logger.info(`🌐 Server: http://localhost:${config.port}`);
      logger.info(`🔗 API: http://localhost:${config.port}/api/v1`);
      logger.info(`💚 Health: http://localhost:${config.port}/health`);
      logger.info(`🔌 WebSocket: ws://localhost:${config.port}`);
      logger.info('========================================');
      logger.info('');
    });

    // ==========================================
    // 7. Manejo de errores no capturados
    // ==========================================

    // Unhandled Promise Rejection
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Unhandled Rejection at:', promise);
      logger.error('Reason:', reason);
      // Cerrar servidor y salir
      server.close(() => {
        logger.error('Server closed due to unhandled rejection');
        process.exit(1);
      });
    });

    // Uncaught Exception
    process.on('uncaughtException', (error) => {
      logger.error('❌ Uncaught Exception:', error);
      // Cerrar servidor y salir
      server.close(() => {
        logger.error('Server closed due to uncaught exception');
        process.exit(1);
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('👋 SIGINT signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
