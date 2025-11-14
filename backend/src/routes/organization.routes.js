const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organization.controller');
const memberController = require('../controllers/member.controller');
const geofenceController = require('../controllers/geofence.controller');
const alertController = require('../controllers/alert.controller');
const trackingController = require('../controllers/tracking.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { body, param, query } = require('express-validator');

/**
 * Rutas de Organizaciones
 * Base: /api/v1/organizations
 */

// Validadores
const createOrganizationValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  validate,
];

const updateOrganizationValidation = [
  param('id').isMongoId().withMessage('Organization ID inválido'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),
  body('logoURL')
    .optional()
    .isURL()
    .withMessage('URL de logo inválida'),
  validate,
];

const inviteMemberValidation = [
  param('id').isMongoId().withMessage('Organization ID inválido'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('role')
    .isIn(['admin', 'manager', 'member'])
    .withMessage('Rol inválido'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  validate,
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ==================== CRUD de Organizaciones ====================

// Crear organización
router.post(
  '/',
  createOrganizationValidation,
  organizationController.createOrganization
);

// Obtener mis organizaciones
router.get(
  '/',
  organizationController.getMyOrganizations
);

// Obtener organización por ID
router.get(
  '/:id',
  organizationController.getOrganizationById
);

// Actualizar organización (admin)
router.patch(
  '/:id',
  rbacMiddleware(['owner', 'admin']),
  updateOrganizationValidation,
  organizationController.updateOrganization
);

// Eliminar organización (solo owner)
router.delete(
  '/:id',
  rbacMiddleware(['owner']),
  organizationController.deleteOrganization
);

// ==================== Configuración ====================

// Obtener configuración
router.get(
  '/:id/settings',
  rbacMiddleware(['owner', 'admin']),
  organizationController.getSettings
);

// Actualizar configuración
router.patch(
  '/:id/settings',
  rbacMiddleware(['owner', 'admin']),
  organizationController.updateSettings
);

// ==================== Suscripción ====================

// Obtener suscripción
router.get(
  '/:id/subscription',
  rbacMiddleware(['owner', 'admin']),
  organizationController.getSubscription
);

// Actualizar suscripción
router.patch(
  '/:id/subscription',
  rbacMiddleware(['owner']),
  organizationController.updateSubscription
);

// ==================== Estadísticas ====================

// Obtener estadísticas de la organización
router.get(
  '/:id/stats',
  rbacMiddleware(['owner', 'admin', 'manager']),
  organizationController.getStats
);

// ==================== Miembros ====================

// Invitar miembro (admin/manager)
router.post(
  '/:id/invite',
  rbacMiddleware(['owner', 'admin', 'manager']),
  inviteMemberValidation,
  organizationController.inviteMember
);

// Obtener miembros de la organización
router.get(
  '/:orgId/members',
  memberController.getOrganizationMembers
);

// ==================== Geofences ====================

// Obtener geofences de la organización
router.get(
  '/:orgId/geofences',
  geofenceController.getOrganizationGeofences
);

// ==================== Alertas ====================

// Obtener alertas de la organización
router.get(
  '/:orgId/alerts',
  rbacMiddleware(['owner', 'admin', 'manager']),
  alertController.getOrganizationAlerts
);

// ==================== Ubicaciones ====================

// Obtener ubicaciones en vivo de la organización
router.get(
  '/:orgId/locations/live',
  rbacMiddleware(['owner', 'admin', 'manager']),
  trackingController.getOrganizationLiveLocations
);

// Obtener historial de ubicaciones de la organización
router.get(
  '/:orgId/locations/history',
  rbacMiddleware(['owner', 'admin', 'manager']),
  trackingController.getOrganizationLocationHistory
);

module.exports = router;
