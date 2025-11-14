const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alert.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { body, param } = require('express-validator');

/**
 * Rutas de Alertas
 * Base: /api/v1/alerts
 */

// Validadores
const createSOSValidation = [
  body('organizationId').isMongoId().withMessage('Organization ID inválido'),
  body('location')
    .optional()
    .isObject()
    .withMessage('Ubicación inválida'),
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('El mensaje no puede exceder 500 caracteres'),
  validate,
];

const resolveAlertValidation = [
  param('id').isMongoId().withMessage('Alert ID inválido'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Las notas no pueden exceder 1000 caracteres'),
  validate,
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear alerta SOS
router.post(
  '/sos',
  createSOSValidation,
  alertController.createSOSAlert
);

// Obtener alerta por ID
router.get(
  '/:id',
  alertController.getAlertById
);

// Actualizar alerta (admin/manager)
router.patch(
  '/:id',
  rbacMiddleware(['owner', 'admin', 'manager']),
  alertController.updateAlert
);

// Reconocer alerta
router.post(
  '/:id/acknowledge',
  rbacMiddleware(['owner', 'admin', 'manager']),
  alertController.acknowledgeAlert
);

// Resolver alerta
router.post(
  '/:id/resolve',
  rbacMiddleware(['owner', 'admin', 'manager']),
  resolveAlertValidation,
  alertController.resolveAlert
);

// Eliminar alerta (solo admin)
router.delete(
  '/:id',
  rbacMiddleware(['owner', 'admin']),
  alertController.deleteAlert
);

module.exports = router;
