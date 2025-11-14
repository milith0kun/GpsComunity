const organizationService = require('../services/organization.service');
const memberService = require('../services/member.service');
const {
  successResponse,
  createdResponse,
  errorResponse,
} = require('../utils/responseHandler');
const { asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Controlador de Organizaciones
 */

/**
 * Crea una nueva organización
 * POST /api/v1/organizations
 */
const createOrganization = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  const result = await organizationService.createOrganization(
    { name, description },
    userId
  );

  return createdResponse(res, result, 'Organización creada exitosamente');
});

/**
 * Obtiene las organizaciones del usuario actual
 * GET /api/v1/organizations
 */
const getMyOrganizations = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const organizations = await organizationService.getUserOrganizations(userId);

  return successResponse(res, organizations, 'Mis organizaciones');
});

/**
 * Obtiene una organización por ID
 * GET /api/v1/organizations/:id
 */
const getOrganizationById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organization = await organizationService.getOrganizationById(id);

  return successResponse(res, organization, 'Organización encontrada');
});

/**
 * Actualiza una organización
 * PATCH /api/v1/organizations/:id
 */
const updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Campos permitidos
  const allowedUpdates = ['name', 'description', 'logoURL'];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const organization = await organizationService.updateOrganization(id, updateData);

  return successResponse(res, organization, 'Organización actualizada');
});

/**
 * Elimina una organización
 * DELETE /api/v1/organizations/:id
 */
const deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await organizationService.deleteOrganization(id);

  return successResponse(res, null, 'Organización eliminada exitosamente');
});

/**
 * Obtiene la configuración de una organización
 * GET /api/v1/organizations/:id/settings
 */
const getSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organization = await organizationService.getOrganizationById(id);

  return successResponse(res, organization.settings, 'Configuración de la organización');
});

/**
 * Actualiza la configuración de una organización
 * PATCH /api/v1/organizations/:id/settings
 */
const updateSettings = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const settings = req.body;

  const organization = await organizationService.updateOrganizationSettings(id, settings);

  return successResponse(res, organization.settings, 'Configuración actualizada');
});

/**
 * Obtiene la suscripción de una organización
 * GET /api/v1/organizations/:id/subscription
 */
const getSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const organization = await organizationService.getOrganizationById(id);

  return successResponse(res, organization.subscription, 'Información de suscripción');
});

/**
 * Actualiza la suscripción de una organización
 * PATCH /api/v1/organizations/:id/subscription
 */
const updateSubscription = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const subscriptionData = req.body;

  const organization = await organizationService.updateSubscription(id, subscriptionData);

  return successResponse(res, organization.subscription, 'Suscripción actualizada');
});

/**
 * Invita un miembro a la organización
 * POST /api/v1/organizations/:id/invite
 */
const inviteMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const inviteData = req.body;
  const inviterId = req.user._id;

  const member = await memberService.inviteMember(id, inviteData, inviterId);

  return createdResponse(res, member, 'Invitación enviada exitosamente');
});

/**
 * Obtiene estadísticas de la organización
 * GET /api/v1/organizations/:id/stats
 */
const getStats = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const stats = await organizationService.getOrganizationStats(id);

  return successResponse(res, stats, 'Estadísticas de la organización');
});

module.exports = {
  createOrganization,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
  getSettings,
  updateSettings,
  getSubscription,
  updateSubscription,
  inviteMember,
  getStats,
};
