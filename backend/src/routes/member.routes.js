const express = require('express');
const router = express.Router();
const memberController = require('../controllers/member.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { body, param, query } = require('express-validator');

/**
 * Rutas de Miembros
 * Base: /api/v1/members
 */

// Validadores
const updateRoleValidation = [
  param('id').isMongoId().withMessage('Member ID inválido'),
  body('role')
    .isIn(['owner', 'admin', 'manager', 'member'])
    .withMessage('Rol inválido'),
  validate,
];

const updateTrackingValidation = [
  param('id').isMongoId().withMessage('Member ID inválido'),
  body('trackingEnabled')
    .optional()
    .isBoolean()
    .withMessage('trackingEnabled debe ser booleano'),
  body('trackingInterval')
    .optional()
    .isInt({ min: 10, max: 3600 })
    .withMessage('trackingInterval debe estar entre 10 y 3600 segundos'),
  body('highAccuracyMode')
    .optional()
    .isBoolean()
    .withMessage('highAccuracyMode debe ser booleano'),
  validate,
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Obtener miembro por ID
router.get(
  '/:id',
  memberController.getMemberById
);

// Actualizar miembro (admin/manager)
router.patch(
  '/:id',
  rbacMiddleware(['owner', 'admin', 'manager']),
  memberController.updateMember
);

// Actualizar rol de miembro (solo owner/admin)
router.patch(
  '/:id/role',
  rbacMiddleware(['owner', 'admin']),
  updateRoleValidation,
  memberController.updateMemberRole
);

// Eliminar miembro (admin/manager)
router.delete(
  '/:id',
  rbacMiddleware(['owner', 'admin', 'manager']),
  memberController.removeMember
);

// Actualizar configuración de tracking
router.patch(
  '/:id/tracking',
  updateTrackingValidation,
  memberController.updateMemberTracking
);

// Aceptar invitación
router.post(
  '/:id/accept',
  memberController.acceptInvitation
);

module.exports = router;
