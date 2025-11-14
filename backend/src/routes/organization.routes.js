const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');

/**
 * Rutas de Organizaciones - Ubicaciones
 * Base: /api/v1/organizations/:orgId/locations
 */

// Todas las rutas requieren autenticación y membership
router.use('/:orgId/locations', authMiddleware);

// Obtener ubicaciones en vivo de la organización
router.get(
  '/:orgId/locations/live',
  rbacMiddleware('canViewAllLocations'),
  trackingController.getOrganizationLiveLocations
);

// Obtener historial de ubicaciones de la organización
router.get(
  '/:orgId/locations/history',
  rbacMiddleware('canViewLocationHistory'),
  trackingController.getOrganizationLocationHistory
);

module.exports = router;
