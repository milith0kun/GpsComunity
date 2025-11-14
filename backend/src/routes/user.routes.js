const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { rbacMiddleware } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { body, param } = require('express-validator');

/**
 * Rutas de Usuarios
 * Base: /api/v1/users
 */

// Validadores
const updateUserValidation = [
  param('id').isMongoId().withMessage('User ID inválido'),
  body('displayName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Teléfono inválido'),
  body('photoURL')
    .optional()
    .isURL()
    .withMessage('URL de foto inválida'),
  validate,
];

const updatePreferencesValidation = [
  param('id').isMongoId().withMessage('User ID inválido'),
  body('language')
    .optional()
    .isIn(['es', 'en', 'pt'])
    .withMessage('Idioma no soportado'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'auto'])
    .withMessage('Tema inválido'),
  validate,
];

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Listar usuarios (solo admin)
router.get(
  '/',
  rbacMiddleware(['admin']),
  userController.getUsers
);

// Obtener usuario por ID
router.get(
  '/:id',
  userController.getUserById
);

// Actualizar usuario
router.patch(
  '/:id',
  updateUserValidation,
  userController.updateUser
);

// Eliminar usuario (soft delete)
router.delete(
  '/:id',
  userController.deleteUser
);

// Actualizar preferencias
router.patch(
  '/:id/preferences',
  updatePreferencesValidation,
  userController.updatePreferences
);

module.exports = router;
