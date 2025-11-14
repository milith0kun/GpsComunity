const Member = require('../models/Member');
const { forbiddenResponse } = require('../utils/responseHandler');
const { ERROR_CODES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Middleware para control de acceso basado en roles (RBAC)
 * Verifica que el usuario sea miembro de la organización y tenga los permisos necesarios
 *
 * @param {string|string[]} permission - Permiso(s) requerido(s)
 * @param {Object} options - Opciones adicionales
 * @returns {Function} Middleware function
 */
const rbacMiddleware = (permission, options = {}) => {
  return async (req, res, next) => {
    try {
      // 1. Verificar que el usuario esté autenticado
      if (!req.user) {
        return forbiddenResponse(res, 'Autenticación requerida');
      }

      // 2. Obtener organizationId de params, body o query
      const orgId =
        req.params.orgId ||
        req.params.organizationId ||
        req.body.organizationId ||
        req.query.organizationId;

      if (!orgId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Organization ID is required',
          },
        });
      }

      // 3. Buscar membership
      const member = await Member.findOne({
        organizationId: orgId,
        userId: req.user._id,
        status: 'active',
      }).populate('organizationId');

      if (!member) {
        return forbiddenResponse(
          res,
          'No eres miembro de esta organización',
          ERROR_CODES.RBAC_001
        );
      }

      // 4. Verificar que la organización esté activa
      if (member.organizationId.status !== 'active') {
        return forbiddenResponse(res, 'La organización no está activa');
      }

      // 5. Verificar suscripción activa (si está configurado)
      if (options.requireActiveSubscription) {
        if (!member.organizationId.hasActiveSubscription()) {
          return res.status(402).json({
            // 402 Payment Required
            success: false,
            error: {
              code: ERROR_CODES.SUB_001,
              message: 'Suscripción expirada o inactiva',
            },
          });
        }
      }

      // 6. Verificar permisos
      const permissions = Array.isArray(permission) ? permission : [permission];
      const hasAllPermissions = permissions.every((perm) => member.hasPermission(perm));

      if (!hasAllPermissions) {
        logger.warn(
          `User ${req.user._id} denied access - missing permission: ${permissions.join(', ')}`
        );
        return forbiddenResponse(
          res,
          'No tienes permisos para esta acción',
          ERROR_CODES.RBAC_002
        );
      }

      // 7. Adjuntar member y organization a request
      req.member = member;
      req.organization = member.organizationId;

      next();
    } catch (error) {
      logger.error('Error en RBAC middleware:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error interno del servidor',
        },
      });
    }
  };
};

/**
 * Middleware para verificar si el usuario es owner o admin
 */
const requireOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.member) {
      return forbiddenResponse(res, 'Membership requerido');
    }

    if (!req.member.isAdminOrOwner()) {
      return forbiddenResponse(res, 'Se requiere rol de Admin o Owner');
    }

    next();
  } catch (error) {
    logger.error('Error en requireOwnerOrAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
    });
  }
};

/**
 * Middleware para verificar si el usuario es owner
 */
const requireOwner = async (req, res, next) => {
  try {
    if (!req.member) {
      return forbiddenResponse(res, 'Membership requerido');
    }

    if (!req.member.isOwner()) {
      return forbiddenResponse(res, 'Se requiere rol de Owner');
    }

    next();
  } catch (error) {
    logger.error('Error en requireOwner middleware:', error);
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
    });
  }
};

/**
 * Middleware para verificar acceso a un miembro específico
 * Verifica que el usuario tenga permiso para ver/editar a otro miembro
 */
const requireMemberAccess = (action = 'view') => {
  return async (req, res, next) => {
    try {
      if (!req.member) {
        return forbiddenResponse(res, 'Membership requerido');
      }

      const targetMemberId = req.params.memberId;
      if (!targetMemberId) {
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Member ID is required' },
        });
      }

      // Si es el mismo usuario, siempre tiene acceso a su propia info
      if (req.member._id.toString() === targetMemberId) {
        return next();
      }

      // Para acciones de modificación, verificar permisos
      if (action === 'edit' || action === 'delete') {
        const targetMember = await Member.findById(targetMemberId);

        if (!targetMember) {
          return res.status(404).json({
            success: false,
            error: { code: 'NOT_FOUND', message: 'Member not found' },
          });
        }

        // Verificar si puede gestionar a este miembro
        if (!req.member.canManageMember(targetMember)) {
          return forbiddenResponse(res, 'No puedes gestionar a este miembro');
        }
      }

      next();
    } catch (error) {
      logger.error('Error en requireMemberAccess middleware:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' },
      });
    }
  };
};

module.exports = {
  rbacMiddleware,
  requireOwnerOrAdmin,
  requireOwner,
  requireMemberAccess,
};
