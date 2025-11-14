const express = require('express');
const router = express.Router();

/**
 * Router principal de la API
 * Monta todas las rutas de los diferentes módulos
 */

// Health check específico de la API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'GPS Community API v1 is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// TODO: Montar rutas de los diferentes módulos
// const authRoutes = require('./auth.routes');
// const userRoutes = require('./user.routes');
// const organizationRoutes = require('./organization.routes');
// const trackingRoutes = require('./tracking.routes');

// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/organizations', organizationRoutes);
// router.use('/locations', trackingRoutes);

// Ruta de bienvenida
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a GPS Community API',
    version: '1.0.0',
    documentation: '/api/v1/docs', // TODO: Agregar Swagger
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      organizations: '/api/v1/organizations',
      locations: '/api/v1/locations',
    },
  });
});

module.exports = router;
