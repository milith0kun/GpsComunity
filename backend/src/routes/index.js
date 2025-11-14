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

// Importar rutas
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const organizationRoutes = require('./organization.routes');
const memberRoutes = require('./member.routes');
const trackingRoutes = require('./tracking.routes');
const geofenceRoutes = require('./geofence.routes');
const alertRoutes = require('./alert.routes');

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
      members: '/api/v1/members',
      locations: '/api/v1/locations',
      geofences: '/api/v1/geofences',
      alerts: '/api/v1/alerts',
    },
  });
});

// Montar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/members', memberRoutes);
router.use('/locations', trackingRoutes);
router.use('/geofences', geofenceRoutes);
router.use('/alerts', alertRoutes);

module.exports = router;
