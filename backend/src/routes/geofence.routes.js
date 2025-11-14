const express = require('express');
const router = express.Router();
const geofenceController = require('../controllers/geofence.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { body, param, query } = require('express-validator');

/**
 * Rutas de Geofences
 * Base: /api/v1/geofences
 */

// Validadores
const createGeofenceValidation = [
  body('organizationId').isMongoId().withMessage('Organization ID inválido'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('type')
    .isIn(['polygon', 'circle'])
    .withMessage('Tipo de geofence inválido'),
  body('geometry.type')
    .isIn(['Polygon', 'Point'])
    .withMessage('Tipo de geometría inválido'),
  body('geometry.coordinates').isArray().withMessage('Coordenadas inválidas'),
  validate,
];

const updateGeofenceValidation = [
  param('id').isMongoId().withMessage('Geofence ID inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive debe ser booleano'),
  validate,
];

const checkGeofencesValidation = [
  query('lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  query('lon')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  query('organizationId')
    .isMongoId()
    .withMessage('Organization ID inválido'),
  validate,
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Verificar geofences para un punto
router.get(
  '/check',
  checkGeofencesValidation,
  geofenceController.checkGeofences
);

// Crear geofence (admin/manager)
router.post(
  '/',
  rbacMiddleware(['owner', 'admin', 'manager']),
  createGeofenceValidation,
  geofenceController.createGeofence
);

// Obtener geofence por ID
router.get(
  '/:id',
  geofenceController.getGeofenceById
);

// Actualizar geofence (admin/manager)
router.patch(
  '/:id',
  rbacMiddleware(['owner', 'admin', 'manager']),
  updateGeofenceValidation,
  geofenceController.updateGeofence
);

// Eliminar geofence (admin/manager)
router.delete(
  '/:id',
  rbacMiddleware(['owner', 'admin', 'manager']),
  geofenceController.deleteGeofence
);

// Limpiar caché de geofences (solo admin)
router.post(
  '/cache/clear',
  rbacMiddleware(['owner', 'admin']),
  geofenceController.clearCache
);

module.exports = router;
