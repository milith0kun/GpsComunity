const memberService = require('../services/member.service');
const {
  successResponse,
  createdResponse,
  errorResponse,
} = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Miembros
 */

/**
 * Obtiene los miembros de una organización
 * GET /api/v1/organizations/:orgId/members
 */
const getOrganizationMembers = asyncHandler(async (req, res) => {
  const { orgId } = req.params;
  const filters = req.query;

  const members = await memberService.getOrganizationMembers(orgId, filters);

  return successResponse(res, members, 'Miembros de la organización');
});

/**
 * Obtiene un miembro por ID
 * GET /api/v1/members/:id
 */
const getMemberById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await memberService.getMemberById(id);

  return successResponse(res, member, 'Miembro encontrado');
});

/**
 * Actualiza un miembro
 * PATCH /api/v1/members/:id
 */
const updateMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const member = await memberService.updateMember(id, updates);

  return successResponse(res, member, 'Miembro actualizado');
});

/**
 * Actualiza el rol de un miembro
 * PATCH /api/v1/members/:id/role
 */
const updateMemberRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ROLE_REQUIRED',
        message: 'El rol es requerido',
      },
    });
  }

  const member = await memberService.updateMemberRole(id, role);

  logger.info(`Rol actualizado para miembro ${id}: ${role}`);

  return successResponse(res, member, 'Rol actualizado exitosamente');
});

/**
 * Elimina un miembro de la organización
 * DELETE /api/v1/members/:id
 */
const removeMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const removedBy = req.user._id;

  await memberService.removeMember(id, removedBy);

  logger.info(`Miembro ${id} eliminado por usuario ${removedBy}`);

  return successResponse(res, null, 'Miembro eliminado exitosamente');
});

/**
 * Actualiza la configuración de tracking de un miembro
 * PATCH /api/v1/members/:id/tracking
 */
const updateMemberTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trackingData = req.body;

  const member = await memberService.updateMemberTracking(id, trackingData);

  return successResponse(res, member, 'Configuración de tracking actualizada');
});

/**
 * Acepta una invitación a la organización
 * POST /api/v1/members/:id/accept
 */
const acceptInvitation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const member = await memberService.acceptInvitation(id, userId);

  logger.info(`Usuario ${userId} aceptó invitación de membresía ${id}`);

  return successResponse(res, member, 'Invitación aceptada exitosamente');
});

module.exports = {
  getOrganizationMembers,
  getMemberById,
  updateMember,
  updateMemberRole,
  removeMember,
  updateMemberTracking,
  acceptInvitation,
};
