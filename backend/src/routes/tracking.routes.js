const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/tracking.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { locationLimiter } = require('../middleware/rateLimit.middleware');
const { body, query, param } = require('express-validator');

/**
 * Rutas de Tracking/Ubicaciones
 * Base: /api/v1/locations
 */

// Validadores
const createLocationValidation = [
  body('organizationId').isMongoId().withMessage('Organization ID inválido'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('accuracy').isFloat({ min: 0 }).withMessage('Accuracy debe ser positivo'),
  body('timestamp').isISO8601().withMessage('Timestamp inválido'),
  validate,
];

const batchLocationsValidation = [
  body('locations').isArray({ min: 1 }).withMessage('Debe enviar al menos una ubicación'),
  body('locations.*.organizationId').isMongoId().withMessage('Organization ID inválido'),
  body('locations.*.latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('locations.*.longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('locations.*.accuracy').isFloat({ min: 0 }).withMessage('Accuracy debe ser positivo'),
  validate,
];

// Rutas protegidas (todas requieren autenticación)
router.use(authMiddleware);

// Enviar ubicación
router.post('/', locationLimiter, createLocationValidation, trackingController.createLocation);

// Enviar batch de ubicaciones
router.post('/batch', locationLimiter, batchLocationsValidation, trackingController.createBatchLocations);

// Obtener ubicación actual de un usuario
router.get('/current/:userId', trackingController.getCurrentLocation);

// Obtener historial de un usuario
router.get('/history/:userId', trackingController.getLocationHistory);

// Obtener estadísticas de un usuario
router.get('/stats/:userId', trackingController.getUserLocationStats);

// Obtener ubicaciones cercanas
router.get('/nearby', trackingController.getNearbyLocations);

module.exports = router;
