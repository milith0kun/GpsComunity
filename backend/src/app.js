const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config/environment');
const { httpLogger } = require('./middleware/logger.middleware');
const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes');
const logger = require('./utils/logger');

/**
 * Crea y configura la aplicación Express
 * @returns {express.Application}
 */
const createApp = () => {
  const app = express();

  // ==========================================
  // Seguridad
  // ==========================================

  // Helmet - Headers de seguridad
  app.use(helmet());

  // CORS - Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: config.frontendUrl,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Sanitizar datos de MongoDB (prevenir NoSQL injection)
  app.use(mongoSanitize());

  // ==========================================
  // Parsers
  // ==========================================

  // Body parser - JSON
  app.use(express.json({ limit: '10mb' }));

  // Body parser - URL encoded
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ==========================================
  // Compression
  // ==========================================

  // Comprimir responses
  app.use(compression());

  // ==========================================
  // Logging
  // ==========================================

  // HTTP request logging (Morgan + Winston)
  app.use(httpLogger);

  // ==========================================
  // Rate Limiting
  // ==========================================

  // Rate limiting general (solo en producción para no molestar en dev)
  if (config.isProduction) {
    app.use('/api', generalLimiter);
  }

  // ==========================================
  // Health Check
  // ==========================================

  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'GPS Community API is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.env,
    });
  });

  // ==========================================
  // API Routes
  // ==========================================

  app.use('/api/v1', routes);

  // ==========================================
  // Error Handling
  // ==========================================

  // 404 - Ruta no encontrada
  app.use(notFoundMiddleware);

  // Error handler global
  app.use(errorMiddleware);

  return app;
};

module.exports = createApp;
